/* Semana Base — service worker.
   Hace dos cosas: guardar la app para que abra sin internet,
   y permitir que la app muestre avisos del sistema. */

var CACHE = "semana-base-v2";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(FILES); })
      .catch(function(){})
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){
        return k===CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Primero la red, y si no hay, lo guardado.
   Así los cambios que subas a GitHub se ven enseguida. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copia = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copia); }).catch(function(){});
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match("./index.html");
      });
    })
  );
});

/* Tocar el aviso abre la app. */
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:"window", includeUncontrolled:true}).then(function(ws){
      for(var i=0;i<ws.length;i++){
        if("focus" in ws[i]) return ws[i].focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});

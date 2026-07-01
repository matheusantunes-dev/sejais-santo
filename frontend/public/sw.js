const CACHE_VERSION = "v1";
const STATIC_CACHE = "static-" + CACHE_VERSION;
const BIBLE_CACHE = "bible-" + CACHE_VERSION;
const LITURGICAL_CACHE = "liturgical-" + CACHE_VERSION;
const IMAGE_CACHE = "images-" + CACHE_VERSION;

var PRECACHE_URLS = ["/", "/index.html"];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== STATIC_CACHE && key !== BIBLE_CACHE && key !== LITURGICAL_CACHE && key !== IMAGE_CACHE;
          })
          .map(function (key) {
            return caches.delete(key);
          }),
      );
    }),
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (url.pathname.startsWith("/api/bible/")) {
    event.respondWith(cacheFirst(request, BIBLE_CACHE, 30));
    return;
  }

  if (url.pathname.startsWith("/api/gospel/") || url.pathname.startsWith("/api/liturgical/")) {
    event.respondWith(staleWhileRevalidate(request, LITURGICAL_CACHE, 7));
    return;
  }

  if (/\.(webp|png|jpg|jpeg|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 60));
    return;
  }

  if (url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 60));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
});

function cacheFirst(request, cacheName, maxAgeDays) {
  return caches.match(request).then(function (cached) {
    if (cached) {
      var age = (Date.now() - new Date(cached.headers.get("date") || 0).getTime()) / 86400000;
      if (age < maxAgeDays) return cached;
    }
    return fetch(request)
      .then(function (response) {
        if (response.ok) {
          caches.open(cacheName).then(function (cache) {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(function () {
        return cached || new Response("Offline", { status: 503 });
      });
  });
}

function staleWhileRevalidate(request, cacheName, maxAgeDays) {
  var cachedPromise = caches.match(request);
  var fetchPromise = fetch(request)
    .then(function (response) {
      if (response.ok) {
        caches.open(cacheName).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(function () {
      return cachedPromise;
    });

  return cachedPromise.then(function (cached) {
    if (cached) {
      var age = (Date.now() - new Date(cached.headers.get("date") || 0).getTime()) / 86400000;
      if (age < maxAgeDays) return cached;
    }
    return fetchPromise;
  });
}

function networkFirst(request) {
  return fetch(request)
    .then(function (response) {
      if (response.ok) {
        caches.open(STATIC_CACHE).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || caches.match("/index.html");
      }).then(function (page) {
        return page || new Response("Offline", { status: 503 });
      });
    });
}

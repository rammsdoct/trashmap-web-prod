const CACHE_NAME = "trashmap-v1";
const DIST_CACHE = "trashmap-dist-v1";
const API_CACHE = "trashmap-api-v1";

// Assets to cache on install
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(DIST_CACHE).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log("[SW] Some assets failed to cache (expected in dev):", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== DIST_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // API requests: network-first strategy
  if (url.pathname.startsWith("/api") || url.origin !== self.location.origin) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // App shell: cache-first strategy
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
  const cacheName = request.url.includes("/api") ? API_CACHE : DIST_CACHE;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.log("[SW] Network request failed, returning cached:", request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page/response
    return new Response("Offline - No cached response available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({ "Content-Type": "text/plain" }),
    });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DIST_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.log("[SW] Fetch failed for:", request.url);
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({ "Content-Type": "text/plain" }),
    });
  }
}

// Background sync for updates
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reports") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REPORTS" });
        });
      })
    );
  }
});

// Message handler for client communication
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});


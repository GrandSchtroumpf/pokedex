/*
 * WHAT IS THIS FILE?
 *
 * Any file called "service-worker" is automatically bundled and registered with Qwik Router, as long as you add `<RegisterServiceWorker />` in your `root.tsx`.
 *
 * Here you register the events that your service worker will handle.
 *
 * MDN has documentation at https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
export declare const self: ServiceWorkerGlobalScope;


let qwikCache: Cache;
let cache: Cache;

const fetchResponse = async (event: FetchEvent) => {
  const req = event.request;
  // Check cache
  const cachedResponse = await caches.match(req);
  if (cachedResponse) return cachedResponse;

  // Else, use the preloaded response, if it's there
  const response = await event.preloadResponse;
  if (response) return response;

  // Cache and return reponse
  const res = await fetch(req);
  if (req.url.includes("q-") && req.url.endsWith('.js')) {
    qwikCache.put(req, res.clone());
  } else {
    cache.put(req, res.clone());
  }
  return res;
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(self.registration.navigationPreload?.enable());
});

self.addEventListener("fetch", async (event) => {
  qwikCache ||= await caches.open("QwikModulePreload");
  cache ||= await caches.open("Pokedex");
  event.respondWith(fetchResponse(event));
});

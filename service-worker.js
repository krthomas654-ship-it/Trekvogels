/* Het helpertje van Trekvogels nu.
   Het bewaart een kopie van de app op je telefoon.
   Heb je internet? Dan haalt hij de nieuwste versie.
   Geen bereik? Dan laat hij de bewaarde kopie zien. */
const DOOS = "trekvogels-v5";
const BASIS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(DOOS).then(d => d.addAll(BASIS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(namen =>
    Promise.all(namen.filter(n => n !== DOOS).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Geluiden laten we met rust: die zijn groot en komen in stukjes binnen
  if (e.request.destination === "audio" || e.request.headers.has("range")) return;
  e.respondWith(
    fetch(e.request)
      .then(antwoord => {
        if (antwoord.status === 200 || antwoord.type === "opaque"){
          const kopie = antwoord.clone();
          caches.open(DOOS).then(d => d.put(e.request, kopie)).catch(() => {});
        }
        return antwoord;
      })
      .catch(() => caches.match(e.request))
  );
});

// Service worker = malý "strážnik" aplikácie.
// Pri každom otvorení najprv skúsi stiahnuť aktuálnu verziu z internetu.
// Uloženú kópiu použije iba vtedy, keď je telefón offline.

const PAMAT = "spolocne-ulohy";

self.addEventListener("install", function () {
  self.skipWaiting();   // nový strážnik začne pracovať hneď
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  let poziadavka = e.request;
  let adresa = new URL(poziadavka.url);

  // Staráme sa len o súbory našej stránky (nie o Firebase, Google a pod.)
  if (poziadavka.method !== "GET" || adresa.origin !== self.location.origin) return;

  e.respondWith(
    fetch(poziadavka, { cache: "no-cache" })      // vždy over na serveri, či nie je novšia
      .then(function (odpoved) {
        if (odpoved.ok) {
          let kopia = odpoved.clone();
          caches.open(PAMAT).then(function (pamat) { pamat.put(poziadavka, kopia); });
        }
        return odpoved;
      })
      .catch(function () {
        // bez internetu: použi naposledy uloženú kópiu
        return caches.match(poziadavka, { ignoreSearch: true }).then(function (ulozena) {
          return ulozena || caches.match("./");
        });
      })
  );
});

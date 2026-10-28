// ?????????????,???????
const CACHE = "mysudoku-v24";
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "i18n/core.js",
  "i18n/zh.js",
  "i18n/en.js",
  "i18n/fr.js",
  "i18n/content-en-1.js",
  "i18n/content-en-2.js",
  "i18n/content-fr-1.js",
  "i18n/content-fr-2.js",
  "solver/config.js",
  "solver/help.js",
  "solver/core.js",
  "solver/patterns.js",
  "solver/chains.js",
  "solver/als.js",
  "solver/forcing.js",
  "solver/analyze.js",
  "tutorial.js",
  "sudoku.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ????,???????(????,?????????)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

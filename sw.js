/* Logística Yagan: permite instalar la app. La página siempre se pide primero a internet
   (así las actualizaciones llegan al tiro); la copia guardada solo se usa si no hay conexión.
   Las consultas a la planilla (Apps Script) nunca pasan por aquí. */
const CACHE = 'logistica-yagan-v2';
const BASE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r, { cache: 'no-store' }).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r.mode === 'navigate' ? './index.html' : r, cp)); }
    return res;
  }).catch(() => caches.match(r.mode === 'navigate' ? './index.html' : r).then(m => m || caches.match('./'))));
});

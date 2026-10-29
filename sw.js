/* Logística Yagan: permite instalar la app. La página siempre se pide primero a internet
   (así las actualizaciones llegan al tiro); la copia guardada solo se usa si no hay conexión.
   Las consultas a la planilla (Apps Script) nunca pasan por aquí. */
const CACHE = 'logistica-yagan-v7';
const BASE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u =>
    fetch(u, { cache: 'reload' }).then(r => r.ok && c.put(u, r)).catch(() => {})))));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('logistica-yagan') === 0 && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    // las ventanas abiertas con una versión antigua se recargan solas con la nueva
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(cs => cs.forEach(c => { try { c.navigate(c.url); } catch (x) {} }))));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/stock-alianza/') >= 0) return; // la app de Alianza tiene su propio service worker
  const nav = r.mode === 'navigate', key = nav ? './index.html' : r;
  // Ojo: una petición de navegación no se puede reenviar con opciones; se pide por su URL.
  e.respondWith(fetch(nav ? r.url : r.url, { cache: 'no-store', credentials: 'same-origin' }).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(key, cp)); }
    return res;
  }).catch(() => caches.match(key).then(m => m || caches.match('./'))));
});

/* La app de Alianza se movió a https://bodega-yagan.github.io/stock-alianza/ . Este service worker se borra solo. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('stock-alianza') === 0).map(k => caches.delete(k))))
    .then(() => self.registration.unregister())));

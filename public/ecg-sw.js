// MedWise ECG offline support. Pages: network first, cached copy when offline.
// Built assets and ECG images: cache first (their URLs change when their content does).
const V = 'mw-ecg-v4';
// Install: cache the app page, the lab, and every built asset the app page references.
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(['/ecg.html', '/ecg-lab.html', '/ecg-manifest.webmanifest', '/ecg/icon-192.png']).catch(() => {});
    try {
      const html = await (await fetch('/ecg.html', { cache: 'no-store' })).text();
      const assets = [...html.matchAll(/(?:src|href)="(\/_app\/[^"]+)"/g)].map(m => m[1]);
      await c.addAll(assets);
    } catch (err) { /* offline at install: runtime caching fills in later */ }
  })());
  self.skipWaiting();
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/.netlify/')) return;
  const put = res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; };
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(put).catch(() => caches.match(r, { ignoreVary: true }).then(m => m || caches.match(u.pathname.startsWith('/ecg-lab') ? '/ecg-lab.html' : '/ecg.html'))));
  } else if (u.pathname.startsWith('/_app/') || u.pathname.startsWith('/ecg/')) {
    e.respondWith(caches.match(r, { ignoreVary: true }).then(m => m || fetch(r).then(put)));
  }
});

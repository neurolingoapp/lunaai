// Luna AI — offline ishlashi uchun service worker
const CACHE = 'luna-v1';
const SHELL = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png'];
const CDN = /(^|\.)(jsdelivr\.net|cdnjs\.cloudflare\.com)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.hostname === 'openrouter.ai') return; // AI so'rovlari hech qachon keshlanmaydi
  const mine = u.origin === self.location.origin || CDN.test(u.hostname);
  if (!mine) return;
  // Avval internetdan (yangilanishlar darhol ko'rinsin), bo'lmasa keshdan
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});

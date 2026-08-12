// ============================================================
// 라꾸 매니저 - Service Worker
// 정적 자산만 캐싱. Supabase API 호출은 항상 네트워크 우선(캐시 안 함).
// ============================================================
const CACHE_NAME = 'rakku-manager-v1';

const PRECACHE_URLS = [
  '/index.html',
  '/css/style.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase API 요청은 캐시하지 않고 항상 네트워크로
  if (url.hostname.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

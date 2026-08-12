'use strict';

const CACHE_PREFIX = 'academiaqa-static-';
const CACHE_NAME = `${CACHE_PREFIX}0.13.0`;
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/assets/css/app.css',
  '/assets/js/pwa.js',
  '/assets/img/pwa-icon-192.png',
  '/assets/img/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true }))
      || (fallbackUrl ? await cache.match(fallbackUrl) : undefined)
      || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/offline.html'));
    return;
  }

  if (url.pathname.startsWith('/assets/img/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (/\.(?:css|js|mjs|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request));
  }
});

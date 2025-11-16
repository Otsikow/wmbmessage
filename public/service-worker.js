/**
 * Service Worker for MessageGuide
 * Handles offline caching and background sync
 */

const STATIC_CACHE = 'messageguide-static-v2';
const RUNTIME_CACHE = 'messageguide-runtime-v2';
const DATA_CACHE = 'messageguide-data-v1';
const OFFLINE_FALLBACK = '/index.html';

const SUPABASE_PATH_MATCHERS = ['/rest/v1/', '/auth/v1/', '/storage/v1/', '/functions/v1/'];

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, RUNTIME_CACHE, DATA_CACHE].includes(cacheName)) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === location.origin;
  const isSupabaseRequest = SUPABASE_PATH_MATCHERS.some((matcher) =>
    url.pathname.includes(matcher)
  );

  // Only handle same-origin or Supabase data requests
  if (!isSameOrigin && !isSupabaseRequest) {
    return;
  }

  if (isSupabaseRequest) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_FALLBACK)))
    );
    return;
  }

  event.respondWith(cacheFirst(request));
});

function cacheFirst(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        if (request.destination === 'document') {
          return caches.match(OFFLINE_FALLBACK);
        }
      });
  });
}

function networkFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return new Response(
            JSON.stringify({ error: 'Offline - No cached data available' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      )
  );
}

self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-offline-changes') {
    event.waitUntil(syncOfflineChanges());
  }
});

async function syncOfflineChanges() {
  console.log('[ServiceWorker] Syncing offline changes...');

  const db = await openDatabase();
  const syncQueue = await getSyncQueue(db);

  if (syncQueue.length === 0) {
    console.log('[ServiceWorker] No changes to sync');
    return;
  }

  for (const item of syncQueue) {
    try {
      await processSyncItem(item);
      await removeFromSyncQueue(db, item.id);
      console.log('[ServiceWorker] Synced item:', item.id);
    } catch (error) {
      console.error('[ServiceWorker] Failed to sync item:', item.id, error);
    }
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MessageGuideDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getSyncQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync_queue', 'readonly');
    const store = transaction.objectStore('sync_queue');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removeFromSyncQueue(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync_queue', 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function processSyncItem(item) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_ITEM',
      payload: item,
    });
  });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

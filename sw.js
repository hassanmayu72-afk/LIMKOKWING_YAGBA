const CACHE = 'yagba-4-shell-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match('./index.html'))),
  );
});

self.addEventListener('push', event => {
  let data = { title: 'LIMKOKWING YAGBA', body: 'You have a study reminder.', url: self.registration.scope };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Use the default reminder if the push payload is not JSON.
  }
  const url = new URL(data.url || './', self.registration.scope).href;
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './icon.svg',
    badge: './icon.svg',
    data: { url },
    tag: data.tag || 'yagba-reminder',
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    for (const client of clients) {
      if ('focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});

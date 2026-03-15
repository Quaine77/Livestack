self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'LiveStack alert',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'view', title: 'View now' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'LiveStack', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})
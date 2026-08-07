/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

// To disable all workbox logging during development
(self as any).__WB_DISABLE_DEV_LOGS = true;

// Listen for push events
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-192x192.png",
    data: data.data || { url: "/" },
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with this URL
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

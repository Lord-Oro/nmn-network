/* nmn sw.js — NMN Service Worker — Zero-Timeout Optimized */
self.options = { "domain": "5gvci.com", "zoneId": 10763727 };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch(e) {
  console.warn('NMN: Monetag SW suppressed — site continues normally.');
}

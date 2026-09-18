// Loopback review never installs a worker. Public HTTPS uses versioned static assets.
if ('serviceWorker' in navigator && location.protocol === 'https:' && ['rightawaylending.com','www.rightawaylending.com'].includes(location.hostname)) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}

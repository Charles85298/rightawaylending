
(function(){
  window.ralTrack = function(eventName, details = {}) {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      page: location.pathname,
      ...details
    };

    // Placeholder for future GA4, Meta Pixel, HubSpot, or CRM events.
    if (window.dataLayer) window.dataLayer.push(payload);

    if (location.hostname === 'localhost' || location.protocol === 'file:') {
      console.info('[RAL analytics placeholder]', payload);
    }
  };

  document.addEventListener('click', event => {
    const target = event.target.closest('a,button');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const label = target.textContent.trim().replace(/\s+/g, ' ').slice(0, 100);

    if (href.startsWith('tel:')) ralTrack('phone_click', { label, href });
    else if (href.startsWith('mailto:')) ralTrack('email_click', { label, href });
    else if (href.includes('prequalify')) ralTrack('prequalify_click', { label, href });
    else if (href.includes('schedule')) ralTrack('schedule_click', { label, href });
    else if (href.includes('calculator')) ralTrack('calculator_click', { label, href });
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    ralTrack('form_submit_attempt', { formId: form.id || 'unnamed-form' });
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(error => {
        console.warn('Service worker registration failed:', error);
      });
    });
  }
})();

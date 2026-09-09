'use strict';

(function qavanceSeoAnalytics(global) {
  const measurementId = 'G-F5VK3VZYR0';
  global.dataLayer = global.dataLayer || [];
  global.gtag = global.gtag || function gtag(){ global.dataLayer.push(arguments); };

  if (!document.querySelector(`script[src*="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    global.gtag('js', new Date());
    global.gtag('config', measurementId);
  }

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    const target = link || button;
    if (!target) return;

    const href = link?.getAttribute('href') || '';
    let eventName = '';
    if (target.matches('.coffeeLink,[data-action="open-coffee-modal"]')) eventName = 'donation_intent';
    else if (/\/simulacro\//.test(href)) eventName = 'simulator_intent';
    else if (/\/practica\//.test(href)) eventName = 'practice_intent';
    else if (/\/curso\//.test(href)) eventName = 'course_intent';
    else if (/\/contactanos\//.test(href)) eventName = 'contact_intent';
    if (!eventName) return;

    global.gtag('event', eventName, {
      page_path: global.location.pathname,
      destination: href || 'button'
    });
  }, { passive: true });
}(window));

'use strict';

(function loadAcademyApp(global) {
  function appendAppScript() {
    const script = document.createElement('script');
    const version = encodeURIComponent(String(global.ACADEMY_CONFIG?.assetVersion || 'latest'));
    script.src = `/assets/js/app.js?v=${version}`;
    script.async = true;
    document.head.appendChild(script);
  }

  function schedule() {
    if (typeof global.requestAnimationFrame !== 'function') {
      global.setTimeout(appendAppScript, 100);
      return;
    }
    global.requestAnimationFrame(() => global.requestAnimationFrame(() => global.setTimeout(appendAppScript, 100)));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
}(window));

'use strict';

(function setupPwa(global) {
  const installButtons = () => [...document.querySelectorAll('[data-pwa-install]')];
  let installPrompt = null;

  function isStandalone() {
    return global.matchMedia?.('(display-mode: standalone)').matches
      || global.navigator.standalone === true;
  }

  function setInstallVisibility(visible) {
    installButtons().forEach((button) => {
      button.hidden = !visible;
      button.setAttribute('aria-hidden', String(!visible));
    });
  }

  async function installApp() {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    setInstallVisibility(false);
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (typeof global.gtag === 'function') {
      global.gtag('event', 'pwa_install_prompt', { outcome: choice.outcome });
    }
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-pwa-install]')) return;
    installApp().catch(() => setInstallVisibility(false));
  });

  global.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    setInstallVisibility(!isStandalone());
  });

  global.addEventListener('appinstalled', () => {
    installPrompt = null;
    setInstallVisibility(false);
    if (typeof global.gtag === 'function') global.gtag('event', 'pwa_installed');
  });

  if ('serviceWorker' in navigator && !global.__supabaseMock) {
    global.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }, { once: true });
  }

  setInstallVisibility(false);
}(window));

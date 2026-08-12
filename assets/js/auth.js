'use strict';

(function initAcademyAuth(global) {
  const Config = global.ACADEMY_CONFIG || {};
  const RETURN_TO_KEY = 'academiaqa.auth.returnTo';
  const SESSION_CLOSED_KEY = 'academiaqa.auth.sessionClosed';
  const STORAGE_KEY = 'academiaqa-auth';
  let client = null;
  let session = null;
  let initialized = false;
  let admin = false;
  let ready = false;
  let resolveReady;
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });

  function authRoot() {
    return document.getElementById('authControl');
  }

  function configured() {
    return Boolean(Config.supabaseUrl && Config.supabasePublishableKey && global.supabase?.createClient);
  }

  function displayName(user) {
    const metadata = user?.user_metadata || {};
    return String(metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'Mi cuenta').trim();
  }

  function initialFor(user) {
    const name = displayName(user);
    return (name.match(/[\p{L}\p{N}]/u)?.[0] || 'A').toUpperCase();
  }

  function setText(selector, value) {
    const element = authRoot()?.querySelector(selector);
    if (element) element.textContent = String(value || '');
  }

  function setStatus(message) {
    setText('[data-auth-status]', message);
  }

  function closeMenu() {
    const root = authRoot();
    const button = root?.querySelector('[data-auth-menu-toggle]');
    const menu = root?.querySelector('[data-auth-menu]');
    if (!button || !menu) return;
    button.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function render(nextSession) {
    session = nextSession || null;
    const root = authRoot();
    if (!root) return;

    const user = session?.user || null;
    const signInButton = root.querySelector('[data-auth-sign-in]');
    const userPanel = root.querySelector('[data-auth-user]');
    const adminLink = root.querySelector('[data-auth-admin-link]');

    root.dataset.authState = user ? 'authenticated' : 'anonymous';
    root.removeAttribute('aria-busy');
    if (signInButton) {
      signInButton.disabled = !configured();
      signInButton.hidden = Boolean(user);
      signInButton.textContent = configured() ? 'Iniciar sesión' : 'Acceso no disponible';
    }
    if (userPanel) userPanel.hidden = !user;
    if (adminLink) adminLink.hidden = !user || !admin;

    if (user) {
      const name = displayName(user);
      setText('[data-auth-name]', name.split(/\s+/)[0]);
      setText('[data-auth-full-name]', name);
      setText('[data-auth-email]', user.email || 'Cuenta de Google');
      setText('[data-auth-initial]', initialFor(user));
      setStatus(`Sesión iniciada como ${name}.`);
    } else {
      closeMenu();
      setStatus(configured() ? 'No has iniciado sesión.' : 'El acceso todavía no está disponible.');
    }

    global.dispatchEvent(new CustomEvent('academiaqa:auth-change', {
      detail: { authenticated: Boolean(user), user }
    }));
  }

  async function refreshAdminAccess(user) {
    admin = false;
    if (!client || !user) {
      render(session);
      return false;
    }
    try {
      const { data, error } = await client.rpc('is_platform_admin');
      if (error) throw error;
      admin = data === true;
    } catch (error) {
      console.error('No fue posible verificar el acceso administrativo.', error);
      admin = false;
    }
    render(session);
    global.dispatchEvent(new CustomEvent('academiaqa:admin-change', { detail: { admin } }));
    return admin;
  }

  function markReady() {
    if (ready) return;
    ready = true;
    resolveReady(session);
  }

  function safeReturnTo() {
    return `${global.location.pathname}${global.location.search}${global.location.hash}`;
  }

  async function signInWithGoogle() {
    if (!client) {
      setStatus('El acceso todavía no está disponible.');
      return { error: new Error('Supabase Auth no está configurado.') };
    }

    try {
      global.sessionStorage.removeItem(SESSION_CLOSED_KEY);
      global.sessionStorage.setItem(RETURN_TO_KEY, safeReturnTo());
      setStatus('Abriendo el acceso seguro con Google.');
      const redirectTo = new URL('/auth/callback/', global.location.origin).href;
      const result = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' }
        }
      });
      if (result.error) throw result.error;
      return result;
    } catch (error) {
      console.error('No fue posible iniciar sesión con Google.', error);
      setStatus('No fue posible iniciar sesión. Intenta nuevamente.');
      return { error };
    }
  }

  async function signOut() {
    if (!client) return { error: null };
    setStatus('Cerrando sesión.');
    const result = await client.auth.signOut({ scope: 'local' });
    if (result.error) {
      console.error('No fue posible cerrar la sesión.', result.error);
      setStatus('No fue posible cerrar la sesión.');
      return result;
    }
    render(null);
    global.sessionStorage.setItem(SESSION_CLOSED_KEY, '1');
    global.location.assign(new URL('/', global.location.origin).href);
    return result;
  }

  function bindControls() {
    const root = authRoot();
    if (!root || root.dataset.authBound === 'true') return;
    root.dataset.authBound = 'true';

    root.querySelector('[data-auth-sign-in]')?.addEventListener('click', signInWithGoogle);
    root.querySelector('[data-auth-sign-out]')?.addEventListener('click', signOut);
    root.querySelector('[data-auth-menu-toggle]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const menu = root.querySelector('[data-auth-menu]');
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      if (menu) menu.hidden = !open;
    });

    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  async function initialize() {
    if (initialized) return readyPromise;
    initialized = true;
    bindControls();

    const root = authRoot();
    if (root) root.setAttribute('aria-busy', 'true');
    if (!configured()) {
      render(null);
      markReady();
      return readyPromise;
    }

    client = global.supabase.createClient(Config.supabaseUrl, Config.supabasePublishableKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY
      }
    });

    const { data, error } = await client.auth.getSession();
    if (error) console.error('No fue posible restaurar la sesión.', error);
    render(data?.session || null);
    await refreshAdminAccess(data?.session?.user || null);
    markReady();

    client.auth.onAuthStateChange((_event, nextSession) => {
      global.setTimeout(async () => {
        render(nextSession);
        await refreshAdminAccess(nextSession?.user || null);
      }, 0);
    });
    return readyPromise;
  }

  global.AcademyAuth = Object.freeze({
    initialize,
    signInWithGoogle,
    signOut,
    whenReady: () => readyPromise,
    getClient: () => client,
    getSession: () => session,
    getUser: () => session?.user || null,
    isAuthenticated: () => Boolean(session?.user),
    isAdmin: () => admin,
    refreshAdminAccess: () => refreshAdminAccess(session?.user || null)
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}(window));

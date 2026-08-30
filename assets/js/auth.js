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
  let accessStatus = { blocked: false, blocked_at: null, reason: null, admin_role: null };
  let adminAccessRequest = null;
  let activityRequest = null;
  let activityTimer = null;
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

  function avatarUrl(user) {
    const metadata = user?.user_metadata || {};
    const value = String(metadata.avatar_url || metadata.picture || '').trim();
    if (!value) return '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
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

  function render(nextSession, { notify = true } = {}) {
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
      const picture = avatarUrl(user);
      const avatar = root.querySelector('[data-auth-avatar]');
      const initial = root.querySelector('[data-auth-initial]');
      setText('[data-auth-name]', name.split(/\s+/)[0]);
      setText('[data-auth-full-name]', name);
      setText('[data-auth-email]', user.email || 'Cuenta de Google');
      setText('[data-auth-initial]', initialFor(user));
      if (avatar) {
        avatar.hidden = !picture;
        avatar.alt = `Foto de perfil de ${name}`;
        avatar.onerror = () => {
          avatar.hidden = true;
          if (initial) initial.hidden = false;
        };
        if (picture) avatar.src = picture;
        else avatar.removeAttribute('src');
      }
      if (initial) initial.hidden = Boolean(picture);
      setStatus(`Sesión iniciada como ${name}.`);
    } else {
      closeMenu();
      setStatus(configured() ? 'No has iniciado sesión.' : 'El acceso todavía no está disponible.');
    }

    if (notify) {
      global.dispatchEvent(new CustomEvent('academiaqa:auth-change', {
        detail: { authenticated: Boolean(user), user }
      }));
    }
  }

  async function refreshAdminAccess(user) {
    if (!client || !user) {
      admin = false;
      render(session, { notify: false });
      global.dispatchEvent(new CustomEvent('academiaqa:admin-change', { detail: { admin } }));
      return false;
    }
    if (adminAccessRequest) return adminAccessRequest;

    const userId = user.id;
    adminAccessRequest = (async () => {
      let nextAdmin = false;
      try {
        const { data, error } = await client.rpc('is_platform_admin');
        if (error) throw error;
        nextAdmin = data === true;
      } catch (error) {
        console.error('No fue posible verificar el acceso administrativo.', error);
      }

      if (session?.user?.id !== userId) return false;
      admin = nextAdmin;
      render(session, { notify: false });
      global.dispatchEvent(new CustomEvent('academiaqa:admin-change', { detail: { admin } }));
      return admin;
    })();

    try {
      return await adminAccessRequest;
    } finally {
      adminAccessRequest = null;
    }
  }

  async function refreshAccessStatus(user) {
    if (!client || !user) {
      accessStatus = { blocked: false, blocked_at: null, reason: null, admin_role: null };
      return accessStatus;
    }
    try {
      const { data, error } = await client.rpc('get_my_access_status');
      if (error) throw error;
      accessStatus = data && typeof data === 'object'
        ? data
        : { blocked: false, blocked_at: null, reason: null, admin_role: null };
    } catch (error) {
      console.error('No fue posible verificar el estado de acceso.', error);
      accessStatus = { blocked: false, blocked_at: null, reason: null, admin_role: null };
    }
    global.dispatchEvent(new CustomEvent('academiaqa:access-change', { detail: accessStatus }));
    return accessStatus;
  }

  async function touchActivity() {
    if (!client || !session?.user) return null;
    if (activityRequest) return activityRequest;
    activityRequest = (async () => {
      const { data, error } = await client.rpc('touch_user_presence');
      if (error) throw error;
      return data || null;
    })();
    try {
      return await activityRequest;
    } catch (error) {
      console.warn('No fue posible actualizar la actividad de la sesión.', error);
      return null;
    } finally {
      activityRequest = null;
    }
  }

  function stopActivityHeartbeat() {
    if (activityTimer) global.clearInterval(activityTimer);
    activityTimer = null;
  }

  function startActivityHeartbeat() {
    stopActivityHeartbeat();
    if (!session?.user) return Promise.resolve(null);
    const initialTouch = touchActivity();
    activityTimer = global.setInterval(() => {
      if (document.visibilityState === 'visible') touchActivity();
    }, 60_000);
    return initialTouch;
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
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') touchActivity();
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
    await refreshAccessStatus(data?.session?.user || null);
    if (!accessStatus.blocked) await startActivityHeartbeat();
    await refreshAdminAccess(data?.session?.user || null);
    markReady();

    client.auth.onAuthStateChange((_event, nextSession) => {
      global.setTimeout(async () => {
        render(nextSession);
        await refreshAccessStatus(nextSession?.user || null);
        if (!accessStatus.blocked) await startActivityHeartbeat();
        else stopActivityHeartbeat();
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
    isBlocked: () => Boolean(accessStatus.blocked),
    getAccessStatus: () => ({ ...accessStatus }),
    refreshAccessStatus: () => refreshAccessStatus(session?.user || null),
    isAdmin: () => admin,
    refreshAdminAccess: () => refreshAdminAccess(session?.user || null)
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}(window));

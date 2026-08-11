'use strict';

(async function completeAcademyAuth(global) {
  const Config = global.ACADEMY_CONFIG || {};
  const RETURN_TO_KEY = 'academiaqa.auth.returnTo';
  const STORAGE_KEY = 'academiaqa-auth';
  const status = document.getElementById('authCallbackStatus');
  const retry = document.getElementById('authCallbackRetry');

  function setStatus(message, failed = false) {
    if (status) status.textContent = message;
    document.body.dataset.authCallbackState = failed ? 'error' : 'loading';
    if (retry) retry.hidden = !failed;
  }

  function returnDestination() {
    const stored = global.sessionStorage.getItem(RETURN_TO_KEY) || '/';
    global.sessionStorage.removeItem(RETURN_TO_KEY);
    try {
      const target = new URL(stored, global.location.origin);
      if (target.origin !== global.location.origin) return '/';
      return `${target.pathname}${target.search}${target.hash}`;
    } catch (_error) {
      return '/';
    }
  }

  try {
    if (!global.supabase?.createClient || !Config.supabaseUrl || !Config.supabasePublishableKey) {
      throw new Error('La configuración de acceso no está disponible.');
    }

    const code = new URL(global.location.href).searchParams.get('code');
    if (!code) throw new Error('Google no devolvió un código de acceso válido.');

    const client = global.supabase.createClient(Config.supabaseUrl, Config.supabasePublishableKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY
      }
    });

    setStatus('Confirmando tu acceso seguro...');
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;

    setStatus('Acceso confirmado. Regresando a AcademiaQA...');
    global.history.replaceState({}, '', '/auth/callback/');
    global.location.replace(returnDestination());
  } catch (error) {
    console.error('No fue posible completar el acceso.', error);
    setStatus('No pudimos completar el acceso con Google. Regresa e inténtalo nuevamente.', true);
  }
}(window));

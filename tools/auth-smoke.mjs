import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, MOCK_USER, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/';
const browser = await chromium.launch({ headless: true });

try {
  const anonymousPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await anonymousPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await anonymousPage.locator('#authControl[data-auth-state="anonymous"]').waitFor();
  const anonymousSignIn = anonymousPage.locator('#authControl').getByRole('button', { name: 'Iniciar sesión' });
  await assert.doesNotReject(() => anonymousSignIn.waitFor());
  assert.equal(await anonymousSignIn.isEnabled(), true);
  assert.equal(await anonymousPage.locator('.heroProgressTop b').filter({ hasText: 'Google' }).count(), 0, 'El resumen de acceso no debe mostrar el texto azul Google.');
  await anonymousPage.close();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForFunction(() => document.querySelector('#authControl')?.dataset.authState === 'anonymous');
  await mobilePage.waitForTimeout(500);
  await mobilePage.getByRole('button', { name: /Abrir menú principal/i }).click();
  const mobileSignIn = mobilePage.locator('#authControl').getByRole('button', { name: 'Iniciar sesión' });
  await mobileSignIn.waitFor();
  assert.equal(await mobileSignIn.isVisible(), true);
  await mobilePage.close();

  const user = MOCK_USER;
  const authenticatedSession = MOCK_SESSION;
  const authenticatedPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await useMockedSupabase(authenticatedPage, authenticatedSession);
  await authenticatedPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await authenticatedPage.locator('#authControl[data-auth-state="authenticated"]').waitFor();
  await authenticatedPage.getByRole('button', { name: /Javier/i }).click();
  assert.equal(await authenticatedPage.getByText('javier@example.com').isVisible(), true);
  await authenticatedPage.getByRole('link', { name: 'Ver mi cuenta' }).click();
  await authenticatedPage.getByRole('heading', { name: /Hola, Javier AcademiaQA/i }).waitFor();
  assert.equal(new URL(authenticatedPage.url()).pathname, '/mi-cuenta/');
  await authenticatedPage.getByRole('button', { name: /Javier/i }).click();
  await authenticatedPage.getByRole('button', { name: 'Cerrar sesión' }).click();
  await authenticatedPage.waitForURL(new URL('/', BASE_URL).href);
  await authenticatedPage.locator('#authControl[data-auth-state="anonymous"]').waitFor();
  await authenticatedPage.getByText('Sesión cerrada correctamente.', { exact: true }).waitFor();
  assert.equal(new URL(authenticatedPage.url()).pathname, '/');
  assert.deepEqual(await authenticatedPage.evaluate(() => window.__authCalls.signOut), { scope: 'local' });
  await authenticatedPage.close();

  const signInPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await useMockedSupabase(signInPage, null);
  await signInPage.goto(`${BASE_URL}curso/ctfl/`, { waitUntil: 'domcontentloaded' });
  await signInPage.locator('#authControl[data-auth-state="anonymous"]').waitFor();
  await signInPage.getByRole('heading', { name: /Inicia sesión para entrar/i }).waitFor();
  assert.equal(await signInPage.evaluate(() => window.AcademyRegistry?.has('ctfl')), false, 'El banco no debe cargarse antes del login.');
  await signInPage.locator('.courseAuthAction').getByRole('button', { name: 'Iniciar sesión' }).click();
  const signInCall = await signInPage.evaluate(() => window.__authCalls.signIn);
  assert.equal(signInCall.provider, 'google');
  assert.match(signInCall.options.redirectTo, /\/auth\/callback\/$/);
  assert.equal(signInCall.options.queryParams.prompt, 'select_account');
  assert.equal(await signInPage.evaluate(() => sessionStorage.getItem('academiaqa.auth.returnTo')), '/curso/ctfl/');
  await signInPage.close();

  const callbackPage = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await useMockedSupabase(callbackPage, authenticatedSession);
  await callbackPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await callbackPage.evaluate(() => sessionStorage.setItem('academiaqa.auth.returnTo', '/cursos/'));
  await callbackPage.goto(`${BASE_URL}auth/callback/?code=oauth-test`, { waitUntil: 'domcontentloaded' });
  await callbackPage.waitForURL('**/cursos/');
  assert.equal(await callbackPage.evaluate(() => localStorage.getItem('__auth_exchange_code')), 'oauth-test');
  await callbackPage.close();

  console.log('Auth smoke OK: anónimo, móvil, sesión, cierre, OAuth y callback.');
} finally {
  await browser.close();
}

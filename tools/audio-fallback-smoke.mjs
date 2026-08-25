import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
      }
    }
    const synthesis = {
      active: null,
      calls: [],
      cancel() {
        this.active = null;
      },
      speak(utterance) {
        this.active = utterance;
        this.calls.push({ text: utterance.text, rate: utterance.rate });
      },
      getVoices() {
        return [{ name: 'Voz natural de prueba', lang: 'es-CO', localService: true }];
      }
    };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockSpeechSynthesisUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  });
  await useMockedSupabase(page, MOCK_SESSION, [], { audioFailure: true });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE_URL}/curso/ctfl/capitulo/1/`, { waitUntil: 'domcontentloaded' });
  await page.locator('#chapterDetail').getByRole('heading', { name: /Cap[ií]tulo 1 · Fundamentos de la Prueba/i }).waitFor();
  const expandedMaterial = page.locator('#chapterDetail details.contentDetails').filter({ hasText: 'Material de estudio ampliado' }).first();
  await expandedMaterial.locator(':scope > summary').click();
  const playButton = expandedMaterial.getByRole('button', { name: /Escuchar el material ampliado del cap[ií]tulo 1/i });
  await playButton.click();

  const seek = expandedMaterial.locator('[data-narration-seek="chapter-reference-1"]');
  await page.waitForFunction(() => {
    const input = document.querySelector('[data-narration-seek="chapter-reference-1"]');
    return input && !input.disabled && Number(input.max) > 30 && Number(input.value) > 0.25;
  });
  assert.match(await expandedMaterial.locator('.narrationStatus').textContent(), /Voz del dispositivo · avance estimado/i);
  assert.ok((await page.evaluate(() => window.speechSynthesis.calls.length)) >= 1, 'Debe iniciar la voz local al fallar el servicio de nube.');

  const total = Number(await seek.getAttribute('max'));
  const forward = Math.round(total * 0.7);
  await seek.evaluate((element, value) => {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    element.value = String(value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, forward);
  await page.waitForTimeout(650);
  assert.ok(Math.abs(Number(await seek.inputValue()) - forward) < 1, 'El avance no debe sobrescribir la barra mientras el usuario la arrastra.');
  await seek.evaluate((element) => {
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await page.waitForFunction((target) => {
    const input = document.querySelector('[data-narration-seek="chapter-reference-1"]');
    return Number(input?.value || 0) >= target - 1;
  }, forward);

  const backward = Math.round(total * 0.2);
  await seek.evaluate((element, value) => {
    element.value = String(value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, backward);
  await page.waitForFunction((target) => {
    const input = document.querySelector('[data-narration-seek="chapter-reference-1"]');
    return Number(input?.value || 0) >= target - 1 && Number(input?.value || 0) <= target + 2;
  }, backward);
  assert.ok((await page.evaluate(() => window.speechSynthesis.calls.length)) >= 3, 'Avanzar y retroceder deben reiniciar la voz en el segmento elegido.');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('Audio fallback smoke OK: material ampliado, avance estimado, arrastre, avance y retroceso verificados.');
} finally {
  await browser.close();
}

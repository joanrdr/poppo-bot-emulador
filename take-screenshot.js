/**
 * Script para tomar screenshot mientras el bot corre
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

(async () => {
  console.log('Conectando al navegador...');

  // Conectar al navegador que ya está corriendo
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://127.0.0.1:9222' // Puerto por defecto
  }).catch(async () => {
    // Si no se puede conectar, crear uno nuevo
    return await puppeteer.launch({
      headless: false,
      args: ['--remote-debugging-port=9222']
    });
  });

  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();

  console.log('Tomando screenshot...');
  await page.screenshot({
    path: 'analisis-batalla.png',
    fullPage: true
  });

  console.log('✓ Screenshot guardado: analisis-batalla.png');

  // Analizar elementos en la página
  console.log('\nAnalizando elementos clickeables...');
  const elementos = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a, span[onclick]'));
    return buttons.slice(0, 20).map(btn => ({
      tag: btn.tagName,
      text: btn.textContent.substring(0, 50),
      class: btn.className,
      id: btn.id,
      visible: btn.offsetParent !== null
    }));
  });

  console.log('\nElementos encontrados:');
  console.log(JSON.stringify(elementos, null, 2));

  // Buscar popups o overlays
  const overlays = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"], [class*="dialog"]'));
    return modals.map(m => ({
      class: m.className,
      visible: m.offsetParent !== null,
      zIndex: window.getComputedStyle(m).zIndex
    }));
  });

  if (overlays.length > 0) {
    console.log('\n⚠️  POPUPS/OVERLAYS DETECTADOS:');
    console.log(JSON.stringify(overlays, null, 2));
  }

  process.exit(0);
})();

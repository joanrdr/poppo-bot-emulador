/**
 * POPPO Auto-Clicker Humanizado
 * Bot profesional con comportamiento indistinguible de un humano
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import fs from 'fs/promises';
import config from './config.js';
import {
  humanClick,
  humanDelay,
  calculateDelayWithFatigue,
  randomPause,
  idleMouseMovement,
  sleep
} from './humanizer.js';

// Aplicar plugin stealth (evita detección de automatización)
puppeteer.use(StealthPlugin());

class PoppoBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.stats = {
      clicks: 0,
      errors: 0,
      startTime: Date.now(),
      lastClickTime: null
    };
    this.running = false;
  }

  // Inicializar navegador
  async init() {
    console.log(chalk.cyan('🚀 Iniciando bot humanizado...'));

    this.browser = await puppeteer.launch({
      headless: config.browser.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080'
      ],
      defaultViewport: config.browser.viewport
    });

    this.page = await this.browser.newPage();

    // Configurar User Agent
    await this.page.setUserAgent(config.browser.userAgent);

    // Inyectar scripts anti-detección
    await this.page.evaluateOnNewDocument(() => {
      // Ocultar webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Agregar plugins realistas
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      // Idiomas
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es', 'en-US', 'en']
      });

      // Chrome runtime
      window.chrome = { runtime: {} };
    });

    console.log(chalk.green('✓ Navegador iniciado'));

    // Cargar cookies si existen
    await this.loadCookies();
  }

  // Cargar cookies guardadas
  async loadCookies() {
    try {
      const cookiesString = await fs.readFile('./cookies.json', 'utf8');
      const cookies = JSON.parse(cookiesString);
      if (cookies.length > 0) {
        await this.page.setCookie(...cookies);
        console.log(chalk.green('✓ Sesión anterior restaurada'));
      }
    } catch (error) {
      // No hay cookies guardadas, primera vez
    }
  }

  // Guardar cookies
  async saveCookies() {
    try {
      const cookies = await this.page.cookies();
      await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
      console.log(chalk.green('✓ Sesión guardada'));
    } catch (error) {
      console.error(chalk.red('Error guardando cookies:'), error.message);
    }
  }

  // Navegar a la página
  async navigate() {
    console.log(chalk.cyan(`🌐 Navegando a ${config.url}...`));

    try {
      await this.page.goto(config.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Esperar un poco para que cargue todo
      await sleep(3000 + Math.random() * 2000);

      console.log(chalk.green('✓ Página cargada'));
      return true;
    } catch (error) {
      console.error(chalk.red('✗ Error navegando:'), error.message);
      return false;
    }
  }

  // Cerrar popups y overlays que bloquean la vista
  async closePopups() {
    try {
      console.log(chalk.gray('🔍 Buscando popups/overlays...'));

      // Buscar botones de cerrar comunes
      const closeButtons = await this.page.$$eval(
        'button, div[role="button"], a, span',
        elements => {
          return elements
            .filter(el => {
              const text = el.textContent.toLowerCase();
              const className = el.className ? el.className.toLowerCase() : '';
              const isCloseButton =
                text.includes('close') ||
                text.includes('cerrar') ||
                text.includes('×') ||
                text === 'x' ||
                className.includes('close') ||
                className.includes('dismiss') ||
                el.getAttribute('aria-label')?.toLowerCase().includes('close');
              return isCloseButton && el.offsetParent !== null;
            })
            .map(el => ({
              text: el.textContent,
              class: el.className
            }));
        }
      );

      if (closeButtons.length > 0) {
        console.log(chalk.yellow(`⚠️  ${closeButtons.length} popups detectados, cerrando...`));

        // Intentar cerrar cada uno
        for (const btnInfo of closeButtons) {
          try {
            const btn = await this.page.$x(
              `//button[contains(text(), '×')] | //button[contains(text(), 'close')] | //button[contains(text(), 'Close')] | //*[contains(@class, 'close')]`
            );
            if (btn[0]) {
              await btn[0].click();
              await sleep(500);
              console.log(chalk.green('✓ Popup cerrado'));
            }
          } catch (e) {
            // Continuar si falla
          }
        }
      }

      // Presionar ESC por si acaso
      await this.page.keyboard.press('Escape');
      await sleep(300);

    } catch (error) {
      // Ignorar errores en cierre de popups
    }
  }

  // Tomar screenshot para debug
  async takeDebugScreenshot(filename = 'debug') {
    try {
      const timestamp = Date.now();
      const path = `${filename}-${timestamp}.png`;
      await this.page.screenshot({ path, fullPage: false });
      console.log(chalk.gray(`📸 Screenshot: ${path}`));
      return path;
    } catch (error) {
      console.log(chalk.red(`Error en screenshot: ${error.message}`));
      return null;
    }
  }

  // Buscar el botón de la florecita en la batalla de POPPO
  async findFlowerButton() {
    try {
      console.log(chalk.gray('🔍 Buscando botón de batalla POPPO...'));

      // Primero, buscar elementos específicos de batalla PK de POPPO
      const pkButton = await Promise.race([
        this.page.evaluateHandle(() => {
          // Buscar botones que sean parte de la interfaz de batalla
          const allElements = Array.from(document.querySelectorAll('*'));

          // Filtrar elementos que puedan ser el botón de regalo/florecita en batalla
          const candidates = allElements.filter(el => {
            // Verificar que sea clickeable
            const isClickable = el.tagName === 'BUTTON' ||
                               el.tagName === 'A' ||
                               el.getAttribute('role') === 'button' ||
                               el.onclick ||
                               el.style.cursor === 'pointer';

            if (!isClickable) return false;

            // Verificar que sea visible
            if (el.offsetParent === null || el.offsetWidth === 0 || el.offsetHeight === 0) {
              return false;
            }

            const className = el.className ? el.className.toString().toLowerCase() : '';
            const text = el.textContent ? el.textContent.toLowerCase() : '';
            const id = el.id ? el.id.toLowerCase() : '';

            // Palabras clave específicas de POPPO batalla
            const keywords = [
              'pk', 'battle', 'gift', 'flower', 'support',
              '花', '送', '礼物', 'regalo', 'apoyo',
              'tap', 'click', 'send'
            ];

            // Buscar en className, text o id
            const hasKeyword = keywords.some(keyword =>
              className.includes(keyword) ||
              text.includes(keyword) ||
              id.includes(keyword)
            );

            // Verificar si tiene imagen de flor o regalo
            const hasFlowerImage = el.querySelector('img[src*="flower"], img[src*="gift"], img[src*="rose"]') !== null;

            // Verificar si está en el área de la batalla (no en menú superior/inferior)
            const rect = el.getBoundingClientRect();
            const inBattleArea = rect.top > 100 && rect.bottom < window.innerHeight - 100;

            return (hasKeyword || hasFlowerImage) && inBattleArea;
          });

          // Ordenar por área (los más grandes probablemente sean botones principales)
          candidates.sort((a, b) => {
            const areaA = a.offsetWidth * a.offsetHeight;
            const areaB = b.offsetWidth * b.offsetHeight;
            return areaB - areaA;
          });

          // Retornar el primer candidato
          return candidates[0] || null;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]).catch(() => null);

      if (pkButton && pkButton.asElement()) {
        // Obtener info del botón para logging
        const btnInfo = await this.page.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.textContent.substring(0, 30)
        }), pkButton);

        console.log(chalk.green(`✓ Botón encontrado: ${JSON.stringify(btnInfo)}`));
        return pkButton.asElement();
      }

      // Fallback: buscar cualquier botón clickeable en el centro de la pantalla
      console.log(chalk.yellow('⚠️  Buscando botones en centro de pantalla...'));

      const centerButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a, span'));
        const visible = buttons.filter(b => b.offsetParent !== null);

        // Encontrar el botón más cercano al centro
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        let closest = null;
        let minDistance = Infinity;

        visible.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          const btnCenterX = rect.left + rect.width / 2;
          const btnCenterY = rect.top + rect.height / 2;

          const distance = Math.sqrt(
            Math.pow(btnCenterX - centerX, 2) +
            Math.pow(btnCenterY - centerY, 2)
          );

          if (distance < minDistance && rect.width > 30 && rect.height > 30) {
            minDistance = distance;
            closest = btn;
          }
        });

        return closest;
      });

      if (centerButton && centerButton.asElement()) {
        console.log(chalk.green('✓ Encontrado botón central'));
        return centerButton.asElement();
      }

      console.log(chalk.yellow('⚠ No se encontró ningún botón válido'));
      return null;
    } catch (error) {
      console.log(chalk.red(`✗ Error buscando: ${error.message}`));
      return null;
    }
  }

  // Verificar si hay batalla activa
  async isBattleActive() {
    try {
      const battleElement = await Promise.race([
        this.page.$(config.selectors.pkBattle),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]).catch(() => null);

      const isActive = battleElement !== null;
      console.log(chalk.gray(`⚔️  Batalla activa: ${isActive ? 'SÍ' : 'NO'}`));
      return isActive;
    } catch {
      return true; // Asumir que sí para no bloquear
    }
  }

  // Loop principal
  async run() {
    if (!await this.navigate()) {
      console.log(chalk.red('✗ No se pudo cargar la página. Abortando.'));
      return;
    }

    // Esperar a que el usuario inicie sesión
    console.log(chalk.yellow.bold('\n⏸️  PAUSA: Inicia sesión en el navegador'));
    console.log(chalk.cyan('   1. Inicia sesión en POPPO'));
    console.log(chalk.cyan('   2. Navega a una transmisión en vivo con batalla (PK)'));
    console.log(chalk.cyan('   3. Presiona Enter aquí cuando estés listo\n'));

    // Esperar que el usuario presione Enter
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log(chalk.green('✓ Continuando...'));

    // Guardar cookies para la próxima vez
    await this.saveCookies();

    this.running = true;
    let lastIdleMovement = Date.now();
    let consecutiveErrors = 0;

    console.log(chalk.green.bold('\n▶ Bot activo - Modo humanizado\n'));

    while (this.running) {
      const loopStartTime = Date.now();

      try {
        console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
        console.log(chalk.cyan(`🔄 Iteración #${this.stats.clicks + 1} - ${new Date().toLocaleTimeString()}`));
        console.log(chalk.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));

        // Tomar screenshot cada 20 iteraciones para debug
        if ((this.stats.clicks + 1) % 20 === 0) {
          await this.takeDebugScreenshot('batalla-estado');
        }

        // Cerrar popups antes de buscar el botón
        await this.closePopups();

        // Verificar que la página sigue respondiendo y está en la URL correcta
        const pageStatus = await Promise.race([
          this.page.evaluate(() => ({
            ok: true,
            url: window.location.href,
            hasVideo: document.querySelector('video') !== null,
            bodyVisible: document.body.offsetParent !== null
          })),
          new Promise((_, reject) => setTimeout(() => reject(new Error('página no responde')), 5000))
        ]).catch(() => ({ ok: false }));

        if (!pageStatus.ok) {
          console.log(chalk.red('✗ La página no responde, refrescando...'));
          await this.page.reload({ waitUntil: 'networkidle2', timeout: 10000 });
          await sleep(3000);
          continue;
        }

        // Verificar si la URL cambió (redirección)
        if (!pageStatus.url.includes('poppo.com')) {
          console.log(chalk.yellow('⚠️  URL incorrecta, regresando a la batalla...'));
          await this.page.goto(config.url, { waitUntil: 'networkidle2', timeout: 10000 });
          await sleep(3000);
          continue;
        }

        // Verificar si hay video (señal de que la transmisión está activa)
        console.log(chalk.gray(`📹 Video presente: ${pageStatus.hasVideo ? 'SÍ' : 'NO'}`));

        // Verificar si hay batalla activa
        const battleActive = await this.isBattleActive();

        if (!battleActive) {
          console.log(chalk.yellow('⏸ No hay batalla activa, esperando 5s...'));
          await sleep(5000);
          continue;
        }

        // Buscar el botón
        const flowerButton = await this.findFlowerButton();

        if (flowerButton) {
          console.log(chalk.blue('🎯 Preparando click humanizado...'));

          // Click humanizado con timeout
          const clickSuccess = await Promise.race([
            humanClick(this.page, flowerButton, config.humanization),
            new Promise((_, reject) => setTimeout(() => reject(new Error('click timeout')), 10000))
          ]).catch((error) => {
            console.log(chalk.red(`✗ Error en click: ${error.message}`));
            return false;
          });

          if (clickSuccess) {
            this.stats.clicks++;
            this.stats.lastClickTime = Date.now();
            consecutiveErrors = 0;

            console.log(
              chalk.green.bold(`✅ Click #${this.stats.clicks} exitoso`) +
              chalk.gray(` [${new Date().toLocaleTimeString()}]`)
            );
          } else {
            this.stats.errors++;
            consecutiveErrors++;
            console.log(chalk.red('✗ Error al hacer click'));
          }
        } else {
          consecutiveErrors++;
          console.log(chalk.yellow('❌ No se encontró el botón de florecita'));

          // Tomar screenshot para debug
          await this.takeDebugScreenshot('error-no-boton');

          // Analizar qué hay en la página
          const pageInfo = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, div[role="button"], span[onclick]'));
            return {
              url: window.location.href,
              title: document.title,
              buttonsCount: buttons.length,
              visibleButtons: buttons.filter(b => b.offsetParent !== null).length,
              bodyText: document.body.innerText.substring(0, 200)
            };
          });

          console.log(chalk.gray('📄 Página actual:'), JSON.stringify(pageInfo, null, 2));
        }

        // Si hay muchos errores consecutivos, refrescar
        if (consecutiveErrors > 5) {
          console.log(chalk.yellow(`⟳ ${consecutiveErrors} errores consecutivos, refrescando página...`));
          await this.page.reload({ waitUntil: 'networkidle2', timeout: 10000 });
          await sleep(3000);
          consecutiveErrors = 0;
          continue;
        }

        // Pausa aleatoria ocasional
        await randomPause(config.humanization);

        // Movimiento idle del mouse
        const timeSinceIdle = Date.now() - lastIdleMovement;
        const idleInterval =
          config.humanization.mouseMovement.idleInterval[0] +
          Math.random() * (config.humanization.mouseMovement.idleInterval[1] -
                          config.humanization.mouseMovement.idleInterval[0]);

        if (timeSinceIdle > idleInterval) {
          console.log(chalk.gray('🖱️  Movimiento idle del mouse...'));
          await idleMouseMovement(this.page, config.humanization);
          lastIdleMovement = Date.now();
        }

        // Delay humanizado entre clics (con fatiga)
        const delay = calculateDelayWithFatigue(
          config.humanization.clickDelay,
          this.stats.clicks,
          config.humanization.fatigue
        );

        console.log(chalk.gray(`⏱️  Esperando ${Math.round(delay / 1000)}s hasta próximo intento...`));
        await sleep(delay);

        // Mostrar stats periódicamente
        if (config.logging.showStats && this.stats.clicks % 10 === 0 && this.stats.clicks > 0) {
          this.showStats();
        }

        // Calcular tiempo del loop
        const loopTime = Date.now() - loopStartTime;
        console.log(chalk.gray(`⏲️  Loop completado en ${Math.round(loopTime / 1000)}s`));

      } catch (error) {
        this.stats.errors++;
        console.error(chalk.red.bold('💥 Error en loop:'), error.message);
        console.error(chalk.red(error.stack));
        await sleep(5000);
      }
    }
  }

  // Mostrar estadísticas
  showStats() {
    const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
    const clicksPerMinute = this.stats.clicks / (uptime / 60);

    console.log(chalk.cyan('\n📊 Estadísticas:'));
    console.log(chalk.white(`  Clicks: ${this.stats.clicks}`));
    console.log(chalk.white(`  Errores: ${this.stats.errors}`));
    console.log(chalk.white(`  Tiempo activo: ${Math.floor(uptime / 60)}m ${uptime % 60}s`));
    console.log(chalk.white(`  Velocidad: ${clicksPerMinute.toFixed(1)} clicks/min\n`));
  }

  // Detener bot
  async stop() {
    this.running = false;
    this.showStats();

    if (this.browser) {
      await this.browser.close();
    }

    console.log(chalk.cyan('\n👋 Bot detenido'));
  }
}

// Iniciar bot
const bot = new PoppoBot();

// Configurar stdin para recibir input (solo si está en un terminal)
if (process.stdin.isTTY && process.stdin.setRawMode) {
  process.stdin.setRawMode(false);
}
process.stdin.setEncoding('utf8');

// Manejar Ctrl+C
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⏹ Deteniendo bot...'));
  await bot.stop();
  process.exit(0);
});

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Error no manejado:'), error);
});

// Ejecutar
(async () => {
  try {
    await bot.init();
    await bot.run();
  } catch (error) {
    console.error(chalk.red('Error fatal:'), error);
    process.exit(1);
  }
})();

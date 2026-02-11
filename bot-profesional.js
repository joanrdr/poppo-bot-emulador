/**
 * BOT PROFESIONAL POPPO - SOLUCIÓN DESDE LA RAÍZ
 * Maneja login, verificación de batalla, y detección precisa del botón
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import fs from 'fs/promises';
import {
  humanClick,
  humanDelay,
  calculateDelayWithFatigue,
  randomPause,
  sleep
} from './humanizer.js';

puppeteer.use(StealthPlugin());

class BotProfesional {
  constructor() {
    this.browser = null;
    this.page = null;
    this.stats = {
      clicks: 0,
      errors: 0,
      startTime: Date.now()
    };
    this.running = false;
    this.sessionReady = false;
  }

  // Tomar screenshot con timestamp
  async screenshot(nombre) {
    try {
      const path = `debug-${nombre}-${Date.now()}.png`;
      await this.page.screenshot({ path, fullPage: false });
      console.log(chalk.gray(`📸 ${path}`));
      return path;
    } catch (e) {
      return null;
    }
  }

  // Inicializar navegador con perfil persistente
  async init() {
    console.log(chalk.cyan('\n═══════════════════════════════════════════════════'));
    console.log(chalk.cyan('🚀 BOT PROFESIONAL POPPO - INICIALIZANDO'));
    console.log(chalk.cyan('═══════════════════════════════════════════════════\n'));

    // Usar perfil de usuario para mantener sesión
    const userDataDir = './chrome-profile';

    this.browser = await puppeteer.launch({
      headless: false,
      userDataDir: userDataDir, // Mantiene cookies y login
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
        '--start-maximized'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();

    // Anti-detección
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });

    console.log(chalk.green('✓ Navegador iniciado con perfil persistente\n'));
  }

  // Verificar si está logueado
  async verificarLogin() {
    console.log(chalk.yellow('🔐 Verificando sesión...'));

    const loginStatus = await this.page.evaluate(() => {
      // Buscar indicadores de que está logueado
      const hasUserInfo = document.querySelector('[class*="user"], [class*="profile"], [class*="avatar"]') !== null;
      const hasLoginButton = document.querySelector('button[class*="login"], a[href*="login"]') !== null;

      // Buscar texto que indique que debe iniciar sesión
      const bodyText = document.body.innerText.toLowerCase();
      const needsLogin = bodyText.includes('sign in') ||
                        bodyText.includes('log in') ||
                        bodyText.includes('iniciar sesión');

      return {
        probablyLoggedIn: hasUserInfo && !hasLoginButton,
        needsLogin: needsLogin || hasLoginButton,
        bodyTextSample: document.body.innerText.substring(0, 200)
      };
    });

    await this.screenshot('verificar-login');

    if (loginStatus.probablyLoggedIn) {
      console.log(chalk.green('✓ Sesión activa detectada\n'));
      return true;
    } else {
      console.log(chalk.red('✗ No hay sesión activa\n'));
      return false;
    }
  }

  // Cerrar popups y overlays
  async cerrarPopups() {
    console.log(chalk.gray('🔍 Buscando y cerrando popups...'));

    try {
      // Presionar ESC varias veces
      await this.page.keyboard.press('Escape');
      await sleep(300);
      await this.page.keyboard.press('Escape');
      await sleep(300);

      // Buscar y clickear botones de cerrar
      const closed = await this.page.evaluate(() => {
        let count = 0;

        // Buscar botones de cerrar comunes
        const closeSelectors = [
          'button[class*="close"]',
          'div[class*="close"]',
          '[aria-label*="close"]',
          '[aria-label*="Close"]',
          'button:has(svg[class*="close"])',
          '.modal-close',
          '.popup-close'
        ];

        closeSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.offsetParent !== null) {
                el.click();
                count++;
              }
            });
          } catch (e) {}
        });

        return count;
      });

      if (closed > 0) {
        console.log(chalk.green(`✓ ${closed} popups cerrados\n`));
        await sleep(500);
      }

    } catch (e) {
      console.log(chalk.gray('  (Sin popups detectados)\n'));
    }
  }

  // Verificar que la batalla sea visible
  async verificarBatallaVisible() {
    console.log(chalk.yellow('👀 Verificando visibilidad de batalla...'));

    const batallaStatus = await this.page.evaluate(() => {
      // Buscar elementos característicos de batalla
      const hasVideo = document.querySelector('video') !== null;
      const hasPKElements = document.querySelectorAll('[class*="pk"], [class*="battle"], [class*="vs"]').length > 0;

      // Verificar que no haya overlay borroso
      const overlays = Array.from(document.querySelectorAll('div')).filter(el => {
        const style = window.getComputedStyle(el);
        return (style.backdropFilter && style.backdropFilter.includes('blur')) ||
               (style.filter && style.filter.includes('blur'));
      });

      const hasBlur = overlays.length > 0;

      // Contar elementos visibles importantes
      const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.offsetParent !== null &&
               el.offsetWidth > 50 &&
               el.offsetHeight > 50;
      }).length;

      return {
        hasVideo,
        hasPKElements,
        hasBlur,
        visibleElements,
        pageVisible: !document.hidden
      };
    });

    await this.screenshot('verificar-batalla');

    console.log(chalk.gray(`  Video: ${batallaStatus.hasVideo ? '✓' : '✗'}`));
    console.log(chalk.gray(`  Elementos PK: ${batallaStatus.hasPKElements ? '✓' : '✗'}`));
    console.log(chalk.gray(`  Sin blur: ${!batallaStatus.hasBlur ? '✓' : '✗'}`));
    console.log(chalk.gray(`  Elementos visibles: ${batallaStatus.visibleElements}\n`));

    // La batalla es visible si:
    // - Hay video
    // - NO hay blur (overlay de login)
    // - Hay elementos PK
    const visible = batallaStatus.hasVideo &&
                   !batallaStatus.hasBlur &&
                   batallaStatus.visibleElements > 50;

    if (visible) {
      console.log(chalk.green('✓ Batalla visible y accesible\n'));
      return true;
    } else {
      console.log(chalk.red('✗ Batalla NO visible (posible overlay de login)\n'));
      return false;
    }
  }

  // Proceso de preparación (login + verificación)
  async prepararSesion() {
    console.log(chalk.cyan('🔧 PREPARANDO SESIÓN...\n'));

    // Navegar
    console.log(chalk.yellow('📍 Navegando a POPPO...'));
    await this.page.goto('https://www.poppo.com/@68375648/live', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(3000);
    console.log(chalk.green('✓ Página cargada\n'));

    await this.screenshot('pagina-inicial');

    // Cerrar popups iniciales
    await this.cerrarPopups();

    // Verificar login
    const loggedIn = await this.verificarLogin();

    if (!loggedIn) {
      console.log(chalk.yellow('═══════════════════════════════════════════════════'));
      console.log(chalk.yellow('⏸️  ACCIÓN REQUERIDA: INICIAR SESIÓN'));
      console.log(chalk.yellow('═══════════════════════════════════════════════════\n'));
      console.log(chalk.white('1. Inicia sesión en el navegador que se abrió'));
      console.log(chalk.white('2. Ve a una transmisión con batalla (PK mode)'));
      console.log(chalk.white('3. Presiona Enter aquí cuando estés listo\n'));

      // Esperar Enter
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      console.log(chalk.green('\n✓ Continuando...\n'));
      await sleep(2000);

      // Verificar de nuevo
      await this.cerrarPopups();
    }

    // Verificar batalla visible
    const batallaVisible = await this.verificarBatallaVisible();

    if (!batallaVisible) {
      console.log(chalk.red('⚠️  La batalla aún no es visible.'));
      console.log(chalk.yellow('   Asegúrate de estar en una transmisión activa con batalla.\n'));
      console.log(chalk.white('Presiona Enter cuando estés en la batalla...'));

      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      await this.cerrarPopups();
      await sleep(1000);
    }

    this.sessionReady = true;
    console.log(chalk.green('═══════════════════════════════════════════════════'));
    console.log(chalk.green('✅ SESIÓN LISTA - INICIANDO BOT'));
    console.log(chalk.green('═══════════════════════════════════════════════════\n'));
  }

  // Buscar botón de florecita (mejorado)
  async buscarBotonFlorecita() {
    try {
      const boton = await this.page.evaluateHandle(() => {
        const elementos = Array.from(document.querySelectorAll('*'));

        // Filtrar candidatos
        const candidatos = elementos.filter(el => {
          if (el.offsetParent === null) return false;

          const rect = el.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;

          // Debe ser redondo (como una peseta)
          const aspectRatio = width / height;
          const esRedondo = aspectRatio >= 0.85 && aspectRatio <= 1.15;

          // Tamaño razonable (40-100px)
          const tamañoOk = width >= 40 && width <= 100 && height >= 40 && height <= 100;

          if (!esRedondo || !tamañoOk) return false;

          const className = el.className ? el.className.toString().toLowerCase() : '';
          const style = window.getComputedStyle(el);

          // Keywords
          const tieneKeyword =
            className.includes('flower') ||
            className.includes('float-btn') ||
            className.includes('gift');

          // Debe ser clickeable
          const esClickeable =
            style.cursor === 'pointer' ||
            el.tagName === 'BUTTON' ||
            el.onclick;

          return tieneKeyword && esClickeable;
        });

        // Ordenar por score
        candidatos.sort((a, b) => {
          let scoreA = 0, scoreB = 0;

          const classA = a.className.toString().toLowerCase();
          const classB = b.className.toString().toLowerCase();

          if (classA.includes('flower')) scoreA += 100;
          if (classB.includes('flower')) scoreB += 100;

          if (classA.includes('float-btn')) scoreA += 50;
          if (classB.includes('float-btn')) scoreB += 50;

          return scoreB - scoreA;
        });

        return candidatos[0] || null;
      });

      if (boton && boton.asElement()) {
        const info = await this.page.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          width: el.offsetWidth,
          height: el.offsetHeight
        }), boton);

        console.log(chalk.green(`✓ Botón encontrado: ${info.tag}.${info.class.substring(0, 30)}`));
        console.log(chalk.gray(`  Tamaño: ${info.width}x${info.height} (redondo)\n`));

        return boton.asElement();
      }

      return null;
    } catch (error) {
      console.log(chalk.red(`✗ Error buscando botón: ${error.message}\n`));
      return null;
    }
  }

  // Loop principal
  async run() {
    await this.prepararSesion();

    this.running = true;
    let consecutiveErrors = 0;

    while (this.running) {
      try {
        console.log(chalk.cyan(`\n━━━ Iteración #${this.stats.clicks + 1} ━━━\n`));

        // Cerrar popups periódicamente
        if (this.stats.clicks % 10 === 0) {
          await this.cerrarPopups();
        }

        // Buscar botón
        console.log(chalk.yellow('🔍 Buscando botón de florecita...'));
        const boton = await this.buscarBotonFlorecita();

        if (boton) {
          // Click humanizado
          console.log(chalk.blue('🎯 Haciendo click humanizado...'));

          const config = {
            mouseMovement: {
              overshootChance: 0.15,
              jitterAmount: 5
            },
            clickDuration: { min: 50, max: 150, mean: 80 },
            accuracy: { perfectClickChance: 0.70, maxOffset: 15 }
          };

          const success = await humanClick(this.page, boton, config);

          if (success) {
            this.stats.clicks++;
            consecutiveErrors = 0;

            console.log(chalk.green.bold(`✅ Click #${this.stats.clicks} exitoso\n`));

            // Screenshot cada 20 clicks
            if (this.stats.clicks % 20 === 0) {
              await this.screenshot('click-exitoso');
            }
          } else {
            this.stats.errors++;
            consecutiveErrors++;
            console.log(chalk.red('✗ Error en click\n'));
          }
        } else {
          consecutiveErrors++;
          console.log(chalk.red('❌ No se encontró el botón\n'));
          await this.screenshot('boton-no-encontrado');
        }

        // Si muchos errores, reverificar sesión
        if (consecutiveErrors >= 5) {
          console.log(chalk.yellow('⚠️  Demasiados errores, reverificando...\n'));
          await this.cerrarPopups();
          const batallaOk = await this.verificarBatallaVisible();

          if (!batallaOk) {
            console.log(chalk.red('⚠️  Batalla no visible, refrescando...\n'));
            await this.page.reload({ waitUntil: 'networkidle2' });
            await sleep(3000);
          }

          consecutiveErrors = 0;
        }

        // Delay humanizado
        const delay = humanDelay({
          min: 800,
          max: 2500,
          mean: 1500,
          stdDev: 400
        });

        console.log(chalk.gray(`⏱️  Esperando ${Math.round(delay / 1000)}s...\n`));
        await sleep(delay);

        // Pausa aleatoria ocasional
        if (Math.random() < 0.08) {
          const pausa = 3000 + Math.random() * 9000;
          console.log(chalk.yellow(`💭 Pausa humana: ${Math.round(pausa / 1000)}s\n`));
          await sleep(pausa);
        }

        // Stats cada 10 clicks
        if (this.stats.clicks % 10 === 0 && this.stats.clicks > 0) {
          const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
          const cpm = (this.stats.clicks / (uptime / 60)).toFixed(1);

          console.log(chalk.cyan('\n📊 ESTADÍSTICAS:'));
          console.log(chalk.white(`  Clicks: ${this.stats.clicks}`));
          console.log(chalk.white(`  Errores: ${this.stats.errors}`));
          console.log(chalk.white(`  Velocidad: ${cpm} clicks/min`));
          console.log(chalk.white(`  Uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s\n`));
        }

      } catch (error) {
        this.stats.errors++;
        console.error(chalk.red(`💥 Error: ${error.message}\n`));
        await sleep(5000);
      }
    }
  }

  async stop() {
    this.running = false;
    if (this.browser) {
      await this.browser.close();
    }
    console.log(chalk.cyan('\n👋 Bot detenido\n'));
  }
}

// Ejecutar
const bot = new BotProfesional();

process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⏹ Deteniendo...'));
  await bot.stop();
  process.exit(0);
});

// Configurar stdin
if (process.stdin.isTTY && process.stdin.setRawMode) {
  process.stdin.setRawMode(false);
}
process.stdin.setEncoding('utf8');

(async () => {
  try {
    await bot.init();
    await bot.run();
  } catch (error) {
    console.error(chalk.red('Error fatal:'), error);
    process.exit(1);
  }
})();

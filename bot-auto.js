/**
 * BOT AUTOMÁTICO - SIN PRESIONAR ENTER
 * Espera 20 segundos y empieza automáticamente
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import { sleep } from './humanizer.js';

puppeteer.use(StealthPlugin());

class BotAuto {
  constructor() {
    this.browser = null;
    this.page = null;
    this.stats = { clicks: 0, errores: 0, startTime: Date.now() };
    this.running = false;
  }

  async screenshot(nombre) {
    try {
      const path = `${nombre}-${Date.now()}.png`;
      await this.page.screenshot({ path, fullPage: false });
      console.log(chalk.gray(`📸 ${path}`));
      return path;
    } catch (e) {
      return null;
    }
  }

  async init() {
    console.log(chalk.cyan('\n╔════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   BOT AUTOMÁTICO - LADO IZQUIERDO                 ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════╝\n'));

    this.browser = await puppeteer.launch({
      headless: false,
      userDataDir: './chrome-profile',
      args: [
        '--no-sandbox',
        '--window-size=1920,1080',
        '--start-maximized'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();

    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    console.log(chalk.green('✓ Navegador iniciado\n'));
  }

  async prepararSesion() {
    // Usar URL de argumento o URL por defecto
    const url = process.argv[2] || 'https://www.poppo.com/@68337823/live';

    console.log(chalk.yellow(`📍 Navegando a ${url}...`));
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(3000);

    // Cerrar popups
    await this.page.keyboard.press('Escape');
    await sleep(500);

    console.log(chalk.yellow('\n╔════════════════════════════════════════════════════╗'));
    console.log(chalk.yellow('║  ESPERANDO 20 SEGUNDOS...                         ║'));
    console.log(chalk.yellow('║  Ve a una batalla (PK mode) ACTIVA ahora          ║'));
    console.log(chalk.yellow('╚════════════════════════════════════════════════════╝\n'));

    // Cuenta regresiva
    for (let i = 20; i > 0; i--) {
      process.stdout.write(`\r${chalk.yellow(`   ${i} segundos restantes...`)}`);
      await sleep(1000);
    }
    console.log('\n');

    console.log(chalk.green('✓ Iniciando bot...\n'));
    await sleep(2000);
  }

  // Buscar botón en LADO IZQUIERDO
  async buscarBotonIzquierdo() {
    console.log(chalk.yellow('🔍 Buscando botón "float-btn-flower"...'));

    try {
      // PRIMERO: Intentar con el selector EXACTO
      const botonExacto = await this.page.$('.float-btn-flower').catch(() => null);

      if (botonExacto) {
        const info = await this.page.evaluate(el => {
          if (!el || !el.offsetParent) return null;
          const rect = el.getBoundingClientRect();
          return {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            className: el.className,
            visible: true
          };
        }, botonExacto);

        if (info && info.visible) {
          console.log(chalk.green('\n✅ BOTÓN EXACTO ENCONTRADO:'));
          console.log(chalk.white(`  Selector: .float-btn-flower`));
          console.log(chalk.white(`  Clase completa: ${info.className}`));
          console.log(chalk.white(`  Tamaño: ${info.width}x${info.height}`));
          console.log(chalk.white(`  Posición: (${info.x}, ${info.y}) ← LADO IZQUIERDO\n`));

          // Resaltar con borde verde
          await this.page.evaluate((pos) => {
            document.querySelectorAll('.bot-marker').forEach(m => m.remove());
            const marker = document.createElement('div');
            marker.className = 'bot-marker';
            marker.style.cssText = `
              position: fixed;
              left: ${pos.x - pos.width/2}px;
              top: ${pos.y - pos.height/2}px;
              width: ${pos.width}px;
              height: ${pos.height}px;
              border: 5px solid lime;
              border-radius: 50%;
              background: rgba(0, 255, 0, 0.4);
              z-index: 999999;
              pointer-events: none;
              box-shadow: 0 0 30px lime;
              animation: pulse 1s infinite;
            `;
            document.body.appendChild(marker);

            if (!document.querySelector('#bot-animation')) {
              const style = document.createElement('style');
              style.id = 'bot-animation';
              style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }';
              document.head.appendChild(style);
            }
          }, info);

          await this.screenshot('boton-exacto-encontrado');

          return { x: info.x, y: info.y };
        }
      }

      // FALLBACK: Búsqueda manual (por si el selector directo falla)
      console.log(chalk.gray('  Selector directo no encontró, buscando manualmente...'));

      // Esperar a que la página esté estable
      await this.page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
      await sleep(500);

      const resultado = await this.page.evaluate(() => {
        const candidatos = [];
        const elementos = Array.from(document.querySelectorAll('*'));

        elementos.forEach(el => {
          if (el.offsetParent === null) return;

          const rect = el.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;

          // Redondo
          const aspectRatio = width / height;
          const esRedondo = aspectRatio >= 0.85 && aspectRatio <= 1.15;

          // Tamaño 40-100px
          const tamañoOk = width >= 40 && width <= 100 && height >= 40 && height <= 100;

          if (!esRedondo || !tamañoOk) return;

          const className = el.className ? el.className.toString().toLowerCase() : '';
          const style = window.getComputedStyle(el);

          // EXCLUIR menú de regalos
          if (className.includes('gift-icon') ||
              className.includes('gift-item') ||
              className.includes('gift-bag') ||
              className.includes('gift-list')) {
            return;
          }

          // Posición
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          // SOLO LADO IZQUIERDO (x < 600)
          const esLadoIzquierdo = x < 600;

          // Zona de batalla
          const enZonaBatalla = y > 300 && y < 900;

          if (!esLadoIzquierdo || !enZonaBatalla) return;

          // Buscar el texto específico del botón
          const text = el.textContent ? el.textContent.toLowerCase() : '';
          const title = el.getAttribute('title') ? el.getAttribute('title').toLowerCase() : '';
          const ariaLabel = el.getAttribute('aria-label') ? el.getAttribute('aria-label').toLowerCase() : '';
          const allText = `${text} ${title} ${ariaLabel}`;

          // EL BOTÓN SE LLAMA "tap the flower for a reward"
          const esElBotonCorrecto =
            allText.includes('tap the flower') ||
            allText.includes('flower for a reward') ||
            allText.includes('tap flower');

          // Keywords de batalla (secundario)
          const esBatalla =
            className.includes('flower') ||
            className.includes('float') ||
            className.includes('pk') ||
            className.includes('battle') ||
            className.includes('support') ||
            className.includes('vote') ||
            className.includes('btn');

          const esClickeable =
            style.cursor === 'pointer' ||
            el.tagName === 'BUTTON' ||
            el.onclick;

          if ((esBatalla || esClickeable || esElBotonCorrecto) && esLadoIzquierdo) {
            let score = 0;

            // MÁXIMA PRIORIDAD: Selector exacto
            if (className.includes('float-btn-flower')) score += 1000;

            // ALTA PRIORIDAD: Si tiene el texto exacto
            if (esElBotonCorrecto) score += 500;

            if (className.includes('flower')) score += 100;
            if (className.includes('float-btn')) score += 80;
            if (className.includes('el-tooltip__trigger')) score += 70;
            if (className.includes('pk')) score += 60;
            if (style.cursor === 'pointer') score += 20;
            if (el.onclick) score += 20;
            if (x < 400) score += 40; // Muy a la izquierda

            candidatos.push({
              tag: el.tagName,
              className: className,
              text: text.substring(0, 50),
              title: title,
              width: Math.round(width),
              height: Math.round(height),
              x: Math.round(x),
              y: Math.round(y),
              score: score,
              esElCorrecto: esElBotonCorrecto
            });
          }
        });

        candidatos.sort((a, b) => b.score - a.score);

        return {
          total: candidatos.length,
          mejor: candidatos[0] || null,
          todos: candidatos.slice(0, 5)
        };
      });

      console.log(chalk.gray(`  Candidatos en lado izquierdo: ${resultado.total}`));

      if (resultado.mejor) {
        const c = resultado.mejor;
        console.log(chalk.green('\n✓ BOTÓN ENCONTRADO (LADO IZQUIERDO):'));
        console.log(chalk.white(`  Clase: ${c.className.substring(0, 50)}`));
        if (c.text) console.log(chalk.white(`  Texto: "${c.text}"`));
        if (c.title) console.log(chalk.white(`  Title: "${c.title}"`));
        console.log(chalk.white(`  Tamaño: ${c.width}x${c.height}`));
        console.log(chalk.white(`  Posición: (${c.x}, ${c.y}) ← IZQUIERDA`));
        console.log(chalk.white(`  Score: ${c.score}`));
        if (c.esElCorrecto) {
          console.log(chalk.green.bold(`  ✅ ES "TAP THE FLOWER FOR A REWARD"`));
        }
        console.log('');

        // Resaltar con borde verde
        await this.page.evaluate((pos) => {
          document.querySelectorAll('.bot-marker').forEach(m => m.remove());

          const marker = document.createElement('div');
          marker.className = 'bot-marker';
          marker.style.cssText = `
            position: fixed;
            left: ${pos.x - pos.width/2}px;
            top: ${pos.y - pos.height/2}px;
            width: ${pos.width}px;
            height: ${pos.height}px;
            border: 5px solid lime;
            border-radius: 50%;
            background: rgba(0, 255, 0, 0.3);
            z-index: 999999;
            pointer-events: none;
            box-shadow: 0 0 20px lime;
          `;
          document.body.appendChild(marker);
        }, resultado.mejor);

        await this.screenshot('boton-encontrado');

        return { x: resultado.mejor.x, y: resultado.mejor.y };
      }

      console.log(chalk.red('\n✗ NO encontrado en lado izquierdo\n'));

      if (resultado.todos.length > 0) {
        console.log(chalk.gray('Candidatos encontrados:'));
        resultado.todos.forEach((c, i) => {
          console.log(chalk.gray(`  ${i+1}. (${c.x}, ${c.y}) - ${c.className.substring(0, 30)}`));
        });
        console.log('');
      }

      return null;

    } catch (error) {
      // Ignorar errores de frames desconectados (común en páginas con video)
      if (error.message.includes('detached')) {
        console.log(chalk.gray('  (Frame cambiando, reintentando...)\n'));
        await sleep(1000);
        return null;
      }
      console.log(chalk.red(`✗ Error: ${error.message}\n`));
      return null;
    }
  }

  async run() {
    await this.prepararSesion();

    this.running = true;
    let sinEncontrar = 0;

    console.log(chalk.green('╔════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║  BOT ACTIVO - Clickeando lado izquierdo           ║'));
    console.log(chalk.green('╚════════════════════════════════════════════════════╝\n'));

    while (this.running) {
      try {
        console.log(chalk.cyan(`━━━ Click #${this.stats.clicks + 1} ━━━\n`));

        const posicion = await this.buscarBotonIzquierdo();

        if (posicion) {
          sinEncontrar = 0;

          console.log(chalk.blue('🎯 Click en botón izquierdo...'));

          // Click humanizado
          await this.page.mouse.move(
            posicion.x + (Math.random() - 0.5) * 10,
            posicion.y + (Math.random() - 0.5) * 10
          );
          await sleep(80 + Math.random() * 120);
          await this.page.mouse.down();
          await sleep(60 + Math.random() * 90);
          await this.page.mouse.up();

          this.stats.clicks++;

          console.log(chalk.green.bold(`✅ Click #${this.stats.clicks} en lado IZQUIERDO\n`));

          // Stats cada 10
          if (this.stats.clicks % 10 === 0) {
            const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
            const cpm = (this.stats.clicks / (uptime / 60)).toFixed(1);

            console.log(chalk.cyan('📊 STATS:'));
            console.log(chalk.white(`  Clicks: ${this.stats.clicks}`));
            console.log(chalk.white(`  CPM: ${cpm}\n`));
          }

        } else {
          sinEncontrar++;
          this.stats.errores++;
          console.log(chalk.red(`❌ No encontrado (${sinEncontrar}/10)\n`));

          if (sinEncontrar >= 10) {
            console.log(chalk.yellow('⚠️  Demasiados errores. Verifica que:'));
            console.log(chalk.white('  1. Estés en una batalla ACTIVA'));
            console.log(chalk.white('  2. El botón redondo esté visible en lado izquierdo\n'));
            await sleep(10000);
            sinEncontrar = 0;
          }

          await sleep(3000);
          continue;
        }

        // Delay humanizado
        const delay = 800 + Math.random() * 1700;
        console.log(chalk.gray(`⏱️  ${Math.round(delay / 1000)}s...\n`));
        await sleep(delay);

        // Pausa ocasional
        if (Math.random() < 0.08) {
          const pausa = 3000 + Math.random() * 9000;
          console.log(chalk.yellow(`💭 Pausa: ${Math.round(pausa / 1000)}s\n`));
          await sleep(pausa);
        }

      } catch (error) {
        this.stats.errores++;
        console.error(chalk.red(`💥 ${error.message}\n`));
        await sleep(5000);
      }
    }
  }

  async stop() {
    this.running = false;
    if (this.browser) await this.browser.close();
    console.log(chalk.cyan('\n👋 Bot detenido\n'));
  }
}

// Ejecutar
const bot = new BotAuto();

process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⏹ Deteniendo...'));
  await bot.stop();
  process.exit(0);
});

(async () => {
  try {
    await bot.init();
    await bot.run();
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
})();

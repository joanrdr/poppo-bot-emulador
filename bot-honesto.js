/**
 * BOT HONESTO - SIN MENTIRAS
 * Solo clickea el botón CORRECTO de batalla, no el menú de regalos
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import {
  humanClick,
  humanDelay,
  sleep
} from './humanizer.js';

puppeteer.use(StealthPlugin());

class BotHonesto {
  constructor() {
    this.browser = null;
    this.page = null;
    this.stats = { clicks: 0, errores: 0, startTime: Date.now() };
    this.running = false;
    this.botonEncontrado = false;
    this.ultimaPosicionBoton = null;
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
    console.log(chalk.cyan('\n╔═══════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   BOT HONESTO - SOLO BOTÓN CORRECTO          ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════════╝\n'));

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
    console.log(chalk.yellow('📍 Navegando a POPPO...'));
    await this.page.goto('https://www.poppo.com/@68375648/live', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(3000);

    // Cerrar popups
    await this.page.keyboard.press('Escape');
    await sleep(500);

    console.log(chalk.yellow('\n╔═══════════════════════════════════════════════╗'));
    console.log(chalk.yellow('║  INSTRUCCIONES:                              ║'));
    console.log(chalk.yellow('║  1. Inicia sesión si es necesario            ║'));
    console.log(chalk.yellow('║  2. Ve a una batalla (PK mode) ACTIVA        ║'));
    console.log(chalk.yellow('║  3. Presiona Enter cuando estés listo        ║'));
    console.log(chalk.yellow('╚═══════════════════════════════════════════════╝\n'));

    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log(chalk.green('✓ Iniciando análisis...\n'));
    await sleep(2000);
  }

  // BÚSQUEDA HONESTA - Solo el botón correcto
  async buscarBotonBatallaReal() {
    console.log(chalk.yellow('🔍 Buscando botón de BATALLA (no menú regalos)...'));

    try {
      // Tomar screenshot para análisis visual
      await this.screenshot('busqueda-boton');

      const resultado = await this.page.evaluate(() => {
        const candidatos = [];

        // Buscar TODOS los elementos
        const elementos = Array.from(document.querySelectorAll('*'));

        elementos.forEach(el => {
          if (el.offsetParent === null) return;

          const rect = el.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;

          // Debe ser redondo
          const aspectRatio = width / height;
          const esRedondo = aspectRatio >= 0.85 && aspectRatio <= 1.15;

          // Tamaño entre 40-100px
          const tamañoOk = width >= 40 && width <= 100 && height >= 40 && height <= 100;

          if (!esRedondo || !tamañoOk) return;

          const className = el.className ? el.className.toString().toLowerCase() : '';
          const id = el.id ? el.id.toLowerCase() : '';
          const style = window.getComputedStyle(el);

          // EXCLUIR explícitamente elementos del menú de regalos
          const esMenuRegalo =
            className.includes('gift-icon') ||
            className.includes('gift-item') ||
            className.includes('gift-bag') ||
            className.includes('gift-list') ||
            className.includes('gift-panel');

          if (esMenuRegalo) return; // IGNORAR menú de regalos

          // INCLUIR solo elementos de batalla/florecita
          const esBatalla =
            className.includes('flower') ||
            className.includes('float-btn') ||
            className.includes('pk-btn') ||
            className.includes('battle-btn') ||
            className.includes('support') ||
            className.includes('vote');

          // Debe estar en zona de batalla (NO en el menú lateral derecho)
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          // Excluir lado derecho (donde está el menú de regalos)
          const noEsMenuDerecho = x < 1000; // Menú de regalos está en x > 1000

          // Debe estar en zona central-izquierda
          const enZonaBatalla = x > 100 && x < 800 && y > 300 && y < 900;

          const esClickeable =
            style.cursor === 'pointer' ||
            el.tagName === 'BUTTON' ||
            el.onclick;

          if (esBatalla && enZonaBatalla && noEsMenuDerecho && esClickeable) {
            candidatos.push({
              tag: el.tagName,
              className: className,
              id: id,
              width: Math.round(width),
              height: Math.round(height),
              x: Math.round(x),
              y: Math.round(y),
              cursor: style.cursor,
              onClick: !!el.onclick,
              zIndex: style.zIndex
            });
          }
        });

        // Ordenar por score
        candidatos.forEach(c => {
          let score = 0;

          if (c.className.includes('flower')) score += 100;
          if (c.className.includes('float-btn')) score += 80;
          if (c.className.includes('pk')) score += 60;
          if (c.cursor === 'pointer') score += 20;
          if (c.onClick) score += 20;

          // Bonus por posición típica (lado izquierdo)
          if (c.x < 400) score += 30;

          c.score = score;
        });

        candidatos.sort((a, b) => b.score - a.score);

        return {
          total: candidatos.length,
          mejorCandidato: candidatos[0] || null,
          top5: candidatos.slice(0, 5)
        };
      });

      console.log(chalk.gray(`  Total candidatos (sin menú): ${resultado.total}`));

      if (resultado.mejorCandidato) {
        const c = resultado.mejorCandidato;
        console.log(chalk.green('\n✓ BOTÓN DE BATALLA ENCONTRADO:'));
        console.log(chalk.white(`  Tag: ${c.tag}`));
        console.log(chalk.white(`  Clase: ${c.className.substring(0, 50)}`));
        console.log(chalk.white(`  Tamaño: ${c.width}x${c.height}`));
        console.log(chalk.white(`  Posición: (${c.x}, ${c.y})`));
        console.log(chalk.white(`  Score: ${c.score}\n`));

        // Resaltar el botón en pantalla
        await this.page.evaluate((pos) => {
          // Limpiar marcadores previos
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
            animation: pulse 1s infinite;
          `;

          // Agregar animación
          if (!document.querySelector('#bot-animation')) {
            const style = document.createElement('style');
            style.id = 'bot-animation';
            style.textContent = `
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
              }
            `;
            document.head.appendChild(style);
          }

          document.body.appendChild(marker);
        }, resultado.mejorCandidato);

        await this.screenshot('boton-resaltado');

        this.botonEncontrado = true;
        this.ultimaPosicionBoton = resultado.mejorCandidato;

        return { x: resultado.mejorCandidato.x, y: resultado.mejorCandidato.y };
      }

      console.log(chalk.red('\n✗ NO SE ENCONTRÓ EL BOTÓN DE BATALLA'));
      console.log(chalk.yellow('  Asegúrate de estar en una batalla activa\n'));

      if (resultado.top5.length > 0) {
        console.log(chalk.gray('Candidatos encontrados (puede que ninguno sea correcto):'));
        resultado.top5.forEach((c, i) => {
          console.log(chalk.gray(`  ${i+1}. ${c.className.substring(0, 30)} (${c.x}, ${c.y})`));
        });
        console.log('');
      }

      return null;

    } catch (error) {
      console.log(chalk.red(`✗ Error: ${error.message}\n`));
      return null;
    }
  }

  async run() {
    await this.prepararSesion();

    this.running = true;
    let sinEncontrar = 0;

    while (this.running) {
      try {
        console.log(chalk.cyan(`\n╔═══════════════════════════════════════════════╗`));
        console.log(chalk.cyan(`║  Iteración #${this.stats.clicks + 1}`));
        console.log(chalk.cyan(`╚═══════════════════════════════════════════════╝\n`));

        // Buscar botón
        const posicion = await this.buscarBotonBatallaReal();

        if (posicion) {
          sinEncontrar = 0;

          console.log(chalk.blue('🎯 Preparando click humanizado...'));

          // Click en la posición exacta
          const config = {
            mouseMovement: { overshootChance: 0.15, jitterAmount: 5 },
            clickDuration: { min: 50, max: 150, mean: 80 },
            accuracy: { perfectClickChance: 0.70, maxOffset: 8 }
          };

          // Mover mouse y clickear
          await this.page.mouse.move(posicion.x, posicion.y);
          await sleep(100 + Math.random() * 200);
          await this.page.mouse.down();
          await sleep(60 + Math.random() * 90);
          await this.page.mouse.up();

          this.stats.clicks++;

          console.log(chalk.green.bold(`✅ Click #${this.stats.clicks} en botón de BATALLA\n`));

          // Screenshot cada 10 clicks
          if (this.stats.clicks % 10 === 0) {
            await this.screenshot('click-real');

            const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
            const cpm = (this.stats.clicks / (uptime / 60)).toFixed(1);

            console.log(chalk.cyan('📊 ESTADÍSTICAS:'));
            console.log(chalk.white(`  Clicks reales en batalla: ${this.stats.clicks}`));
            console.log(chalk.white(`  Velocidad: ${cpm} clicks/min\n`));
          }

        } else {
          sinEncontrar++;
          this.stats.errores++;

          console.log(chalk.red(`❌ Botón de batalla NO encontrado (${sinEncontrar}/5)\n`));

          if (sinEncontrar >= 5) {
            console.log(chalk.yellow('⚠️  PAUSA: No encuentro el botón de batalla'));
            console.log(chalk.white('  1. Verifica que estés en una batalla ACTIVA'));
            console.log(chalk.white('  2. El botón debe ser REDONDO con florecita'));
            console.log(chalk.white('  3. Debe estar en el centro/izquierda (no menú derecho)'));
            console.log(chalk.white('  4. Presiona Enter cuando corrijas esto\n'));

            await new Promise(resolve => {
              process.stdin.once('data', () => resolve());
            });

            sinEncontrar = 0;
          }

          await sleep(3000);
          continue;
        }

        // Delay humanizado
        const delay = 800 + Math.random() * 1700; // 0.8 - 2.5 segundos
        console.log(chalk.gray(`⏱️  Esperando ${Math.round(delay / 1000)}s...\n`));
        await sleep(delay);

        // Pausa ocasional
        if (Math.random() < 0.08) {
          const pausa = 3000 + Math.random() * 9000;
          console.log(chalk.yellow(`💭 Pausa humana: ${Math.round(pausa / 1000)}s\n`));
          await sleep(pausa);
        }

      } catch (error) {
        this.stats.errores++;
        console.error(chalk.red(`💥 Error: ${error.message}\n`));
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
const bot = new BotHonesto();

process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⏹ Deteniendo...'));
  await bot.stop();
  process.exit(0);
});

if (process.stdin.isTTY && process.stdin.setRawMode) {
  process.stdin.setRawMode(false);
}
process.stdin.setEncoding('utf8');

(async () => {
  try {
    await bot.init();
    await bot.run();
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
})();

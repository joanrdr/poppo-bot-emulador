/**
 * BOT RÁFAGAS - CLICKS RÁPIDOS CON PAUSAS VARIABLES
 * Simula humano haciendo tap tap tap rápido, luego descansando
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import { sleep } from './humanizer.js';

puppeteer.use(StealthPlugin());

class BotRafagas {
  constructor() {
    this.browser = null;
    this.page = null;
    this.stats = {
      clicksTotal: 0,
      rafagasCompletadas: 0,
      startTime: Date.now()
    };
    this.running = false;
  }

  // Generar cantidad aleatoria de clicks para la ráfaga
  generarCantidadRafaga() {
    // RÁFAGAS GRANDES: 300-1400 clicks, totalmente aleatorio y variado
    const cantidades = [
      // Bajas (ocasionales)
      300, 320, 350, 380,
      // Medias
      450, 500, 550, 600, 650, 667,
      // Altas
      700, 750, 800, 850, 900, 950,
      // Muy altas
      1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400
    ];

    const aleatorio = cantidades[Math.floor(Math.random() * cantidades.length)];

    // Agregar variación extra (±30) para que sea más natural
    return aleatorio + Math.floor(Math.random() * 60) - 30;
  }

  // Generar tiempo de pausa aleatorio
  generarPausa() {
    // Entre 4-15 segundos, totalmente aleatorio (pausas más largas para ráfagas grandes)
    const pausasBase = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const segundos = pausasBase[Math.floor(Math.random() * pausasBase.length)];

    // Agregar variación (±1 segundo)
    return (segundos + (Math.random() * 2 - 1)) * 1000;
  }

  // Delay rápido dentro de ráfaga
  delayRafaga() {
    // 60-200ms entre clicks dentro de la ráfaga (MÁS RÁPIDO para ráfagas grandes)
    return 60 + Math.random() * 140;
  }

  async screenshot(nombre) {
    try {
      const path = `${nombre}-${Date.now()}.png`;
      await this.page.screenshot({ path, fullPage: false });
      console.log(chalk.gray(`📸 ${path}`));
    } catch (e) {}
  }

  async init() {
    console.log(chalk.cyan('\n╔════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   BOT RÁFAGAS - MODO ULTRA TURBO ⚡⚡⚡           ║'));
    console.log(chalk.cyan('║   300-1400 clicks rápidos + pausas 4-15s          ║'));
    console.log(chalk.cyan('║   Sube/Baja Natural - Totalmente Variable        ║'));
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
    const url = process.argv[2] || 'https://www.poppo.com/@8712783/live';

    console.log(chalk.yellow(`📍 Navegando a ${url}...`));
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await sleep(3000);

    await this.page.keyboard.press('Escape');
    await sleep(500);

    console.log(chalk.yellow('\n╔════════════════════════════════════════════════════╗'));
    console.log(chalk.yellow('║  ESPERANDO 20 SEGUNDOS...                         ║'));
    console.log(chalk.yellow('║  1. Inicia sesión                                 ║'));
    console.log(chalk.yellow('║  2. Ve a una batalla ACTIVA                       ║'));
    console.log(chalk.yellow('╚════════════════════════════════════════════════════╝\n'));

    for (let i = 20; i > 0; i--) {
      process.stdout.write(`\r${chalk.yellow(`   ${i} segundos...`)}`);
      await sleep(1000);
    }
    console.log('\n');

    console.log(chalk.green('✓ Iniciando modo ráfagas...\n'));
    await sleep(2000);
  }

  async buscarBoton() {
    try {
      const boton = await this.page.$('.float-btn-flower').catch(() => null);

      if (boton) {
        const info = await this.page.evaluate(el => {
          if (!el || !el.offsetParent) return null;
          const rect = el.getBoundingClientRect();
          return {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            visible: true
          };
        }, boton);

        return info && info.visible ? info : null;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async ejecutarRafaga() {
    const cantidadClicks = this.generarCantidadRafaga();

    console.log(chalk.cyan(`\n╔════════════════════════════════════════════════════╗`));
    console.log(chalk.cyan(`║  RÁFAGA #${this.stats.rafagasCompletadas + 1}`));
    console.log(chalk.cyan(`║  Objetivo: ${cantidadClicks} clicks rápidos`));
    console.log(chalk.cyan(`╚════════════════════════════════════════════════════╝\n`));

    let clicksRafaga = 0;
    const inicioRafaga = Date.now();

    for (let i = 0; i < cantidadClicks; i++) {
      const posicion = await this.buscarBoton();

      if (posicion) {
        // Click rápido
        await this.page.mouse.move(
          posicion.x + (Math.random() - 0.5) * 8,
          posicion.y + (Math.random() - 0.5) * 8
        );
        await this.page.mouse.down();
        await sleep(40 + Math.random() * 60);
        await this.page.mouse.up();

        clicksRafaga++;
        this.stats.clicksTotal++;

        // Mostrar progreso cada 50 clicks (menos spam para ráfagas grandes)
        if (clicksRafaga % 50 === 0) {
          const porcentaje = Math.round((clicksRafaga / cantidadClicks) * 100);
          const barras = '█'.repeat(Math.floor(porcentaje / 5)) + '░'.repeat(20 - Math.floor(porcentaje / 5));
          process.stdout.write(`\r${chalk.green(`   ⚡ ${clicksRafaga}/${cantidadClicks} [${barras}] ${porcentaje}%`)}`);
        }
      } else {
        // Si no encuentra el botón, esperar un poco
        await sleep(500);
        continue;
      }

      // Delay rápido entre clicks
      await sleep(this.delayRafaga());
    }

    const duracionRafaga = ((Date.now() - inicioRafaga) / 1000).toFixed(1);
    const cps = (clicksRafaga / (duracionRafaga / 1)).toFixed(1);

    console.log('\n');
    console.log(chalk.green.bold(`✅ RÁFAGA COMPLETADA:`));
    console.log(chalk.white(`   Clicks ejecutados: ${clicksRafaga}/${cantidadClicks}`));
    console.log(chalk.white(`   Duración: ${duracionRafaga}s`));
    console.log(chalk.white(`   Velocidad: ${cps} clicks/segundo\n`));

    this.stats.rafagasCompletadas++;
  }

  async run() {
    await this.prepararSesion();

    this.running = true;

    console.log(chalk.green('╔════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║  BOT ACTIVO - MODO RÁFAGAS                        ║'));
    console.log(chalk.green('╚════════════════════════════════════════════════════╝\n'));

    while (this.running) {
      try {
        // Ejecutar ráfaga
        await this.ejecutarRafaga();

        // Pausa variable después de la ráfaga
        const pausa = this.generarPausa();
        const segundos = (pausa / 1000).toFixed(1);

        console.log(chalk.yellow(`💤 DESCANSO: ${segundos} segundos...`));
        console.log(chalk.gray(`   (Esperando antes de la siguiente ráfaga)\n`));

        await sleep(pausa);

        // Estadísticas cada 5 ráfagas
        if (this.stats.rafagasCompletadas % 5 === 0) {
          const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
          const minutosActivo = Math.floor(uptime / 60);
          const segundosActivo = uptime % 60;
          const clicksPorMinuto = (this.stats.clicksTotal / (uptime / 60)).toFixed(1);

          console.log(chalk.cyan('╔════════════════════════════════════════════════════╗'));
          console.log(chalk.cyan('║  📊 ESTADÍSTICAS GENERALES                        ║'));
          console.log(chalk.cyan('╚════════════════════════════════════════════════════╝'));
          console.log(chalk.white(`   Total clicks: ${this.stats.clicksTotal}`));
          console.log(chalk.white(`   Ráfagas completadas: ${this.stats.rafagasCompletadas}`));
          console.log(chalk.white(`   Promedio por ráfaga: ${Math.round(this.stats.clicksTotal / this.stats.rafagasCompletadas)}`));
          console.log(chalk.white(`   Tiempo activo: ${minutosActivo}m ${segundosActivo}s`));
          console.log(chalk.white(`   Velocidad promedio: ${clicksPorMinuto} clicks/min\n`));
        }

      } catch (error) {
        console.error(chalk.red(`💥 Error: ${error.message}\n`));
        await sleep(5000);
      }
    }
  }

  async stop() {
    this.running = false;

    console.log(chalk.cyan('\n╔════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║  📊 RESUMEN FINAL                                 ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════╝'));
    console.log(chalk.white(`   Total clicks: ${this.stats.clicksTotal}`));
    console.log(chalk.white(`   Ráfagas completadas: ${this.stats.rafagasCompletadas}`));
    console.log(chalk.white(`   Promedio por ráfaga: ${Math.round(this.stats.clicksTotal / this.stats.rafagasCompletadas)}\n`));

    if (this.browser) await this.browser.close();
    console.log(chalk.cyan('👋 Bot detenido\n'));
  }
}

// Ejecutar
const bot = new BotRafagas();

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

/**
 * Bot para Electron - Se ejecuta como proceso separado
 */

const fs = require('fs');
const path = require('path');

// Leer configuración del archivo temporal
const configPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Importar navegación natural
let NavegacionNatural;
import('./navegacion-natural.js').then(module => {
  NavegacionNatural = module.NavegacionNatural;
});

console.log(`Configuración cargada:`);
console.log(`  URL: ${config.url}`);
console.log(`  Clicks: ${config.clicksMin}-${config.clicksMax}`);
console.log(`  Pausas: ${config.pausaMin}-${config.pausaMax}s`);
console.log(`  Velocidad: ${config.velocidadMin}-${config.velocidadMax}ms`);

// Importar y ejecutar bot con ES modules
import('puppeteer-extra').then(async ({ default: puppeteer }) => {
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
  puppeteer.use(StealthPlugin());

  class BotElectron {
    constructor(config) {
      this.config = config;
      this.browser = null;
      this.page = null;
      this.stats = {
        clicksTotal: 0,
        rafagasCompletadas: 0,
        startTime: Date.now()
      };
      this.running = false;
    }

    log(message) {
      console.log(message);
    }

    generarCantidadRafaga() {
      const min = this.config.clicksMin;
      const max = this.config.clicksMax;

      // Generar número base aleatorio
      const base = Math.floor(min + Math.random() * (max - min));

      // Agregar variación extra (±5%) para que sea más natural
      const variacion = Math.floor(base * 0.05 * (Math.random() * 2 - 1));
      const resultado = Math.max(min, Math.min(max, base + variacion));

      return resultado;
    }

    generarPausa() {
      const min = this.config.pausaMin * 1000;
      const max = this.config.pausaMax * 1000;

      // Generar pausa base
      const base = min + Math.random() * (max - min);

      // Agregar variación extra (±10%) para que nunca sea igual
      const variacion = base * 0.1 * (Math.random() * 2 - 1);
      const resultado = Math.max(min, Math.min(max, base + variacion));

      return resultado;
    }

    delayRafaga() {
      const min = this.config.velocidadMin;
      const max = this.config.velocidadMax;
      return min + Math.random() * (max - min);
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async init() {
      this.log('🚀 Iniciando navegador...');

      this.browser = await puppeteer.launch({
        headless: this.config.headless || false,
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

      this.log('✓ Navegador iniciado');
    }

    async prepararSesion() {
      // Usar navegación natural anti-detección
      this.log(`🔐 Usando navegación anti-detección...`);

      const navegacion = new NavegacionNatural(this.page);

      // Configurar headers realistas
      await navegacion.configurarHeadersNaturales();

      // Navegar usando ID del perfil (estrategia aleatoria)
      await navegacion.navegarConID(this.config.url);

      await this.sleep(3000);

      // Simular comportamiento humano
      await navegacion.comportamientoPreBatalla();

      await this.page.keyboard.press('Escape');
      await this.sleep(500);

      this.log('⏰ Esperando 20 segundos para ir a la batalla...');

      for (let i = 20; i > 0; i--) {
        if (i % 5 === 0) {
          this.log(`   ${i} segundos restantes...`);
        }
        await this.sleep(1000);
      }

      this.log('✓ Iniciando modo ráfagas...');
      await this.sleep(2000);
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

      this.log(`\n╔═══════════════════════════════════════════════╗`);
      this.log(`║  🎯 RÁFAGA #${this.stats.rafagasCompletadas + 1}`);
      this.log(`║  📊 OBJETIVO: ${cantidadClicks} CLICKS RÁPIDOS`);
      this.log(`╚═══════════════════════════════════════════════╝`);

      let clicksRafaga = 0;
      const inicioRafaga = Date.now();

      for (let i = 0; i < cantidadClicks; i++) {
        const posicion = await this.buscarBoton();

        if (posicion) {
          await this.page.mouse.move(
            posicion.x + (Math.random() - 0.5) * 8,
            posicion.y + (Math.random() - 0.5) * 8
          );
          await this.page.mouse.down();
          await this.sleep(40 + Math.random() * 60);
          await this.page.mouse.up();

          clicksRafaga++;
          this.stats.clicksTotal++;

          // Mostrar progreso cada 200 clicks (no tan frecuente)
          if (clicksRafaga % 200 === 0 || clicksRafaga === cantidadClicks) {
            const porcentaje = Math.round((clicksRafaga / cantidadClicks) * 100);
            this.log(`   ⚡ Progreso: ${clicksRafaga}/${cantidadClicks} clicks (${porcentaje}%)`);
          }
        } else {
          await this.sleep(500);
          continue;
        }

        await this.sleep(this.delayRafaga());
      }

      const duracionRafaga = ((Date.now() - inicioRafaga) / 1000).toFixed(1);
      const cps = (clicksRafaga / parseFloat(duracionRafaga)).toFixed(1);

      this.log(`\n✅ RÁFAGA COMPLETADA:`);
      this.log(`   ✓ ${clicksRafaga} clicks ejecutados`);
      this.log(`   ✓ Duración: ${duracionRafaga} segundos`);
      this.log(`   ✓ Velocidad: ${cps} clicks/segundo\n`);

      this.stats.rafagasCompletadas++;
    }

    async run() {
      await this.prepararSesion();

      this.running = true;
      this.log('\n╔════════════════════════════════════════╗');
      this.log('║  BOT ACTIVO - MODO RÁFAGAS            ║');
      this.log('╚════════════════════════════════════════╝\n');

      while (this.running) {
        try {
          await this.ejecutarRafaga();

          const pausa = this.generarPausa();
          const segundos = (pausa / 1000).toFixed(1);

          this.log(`💤 DESCANSO: ${segundos} segundos antes de la siguiente ráfaga...`);
          this.log(`   (Pausa natural variada)\n`);
          await this.sleep(pausa);

          if (this.stats.rafagasCompletadas % 3 === 0) {
            const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
            const minutosActivo = Math.floor(uptime / 60);
            const segundosActivo = uptime % 60;
            const cpm = (this.stats.clicksTotal / (uptime / 60)).toFixed(1);
            const promedioPorRafaga = Math.round(this.stats.clicksTotal / this.stats.rafagasCompletadas);

            this.log(`\n╔═══════════════════════════════════════════════╗`);
            this.log(`║  📊 ESTADÍSTICAS GENERALES`);
            this.log(`╚═══════════════════════════════════════════════╝`);
            this.log(`   Total clicks: ${this.stats.clicksTotal}`);
            this.log(`   Ráfagas completadas: ${this.stats.rafagasCompletadas}`);
            this.log(`   Promedio por ráfaga: ${promedioPorRafaga} clicks`);
            this.log(`   Tiempo activo: ${minutosActivo}m ${segundosActivo}s`);
            this.log(`   Velocidad promedio: ${cpm} clicks/min\n`);
          }

        } catch (error) {
          this.log(`💥 Error: ${error.message}`);
          await this.sleep(5000);
        }
      }
    }

    async stop() {
      this.running = false;
      if (this.browser) await this.browser.close();
      this.log('👋 Bot detenido');
    }
  }

  const bot = new BotElectron(config);

  process.on('SIGINT', async () => {
    await bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await bot.stop();
    process.exit(0);
  });

  try {
    await bot.init();
    await bot.run();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});

/**
 * BOT PROFESIONAL PARA EMULADOR ANDROID
 * Usa ADB para hacer taps nativos - NO DETECTABLE
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class BotEmuladorADB {
  constructor(config) {
    this.config = config;
    this.running = false;
    this.stats = {
      clicksTotal: 0,
      rafagasCompletadas: 0,
      startTime: Date.now()
    };
  }

  log(message) {
    console.log(message);
  }

  // Ejecutar comando ADB
  async adb(command) {
    try {
      const { stdout } = await execPromise(`adb ${command}`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`ADB Error: ${error.message}`);
    }
  }

  // Hacer tap en coordenadas con jitter natural
  async tap(x, y) {
    // Agregar jitter (+/- 8 píxeles)
    const jitterX = Math.floor(x + (Math.random() - 0.5) * 16);
    const jitterY = Math.floor(y + (Math.random() - 0.5) * 16);

    await this.adb(`shell input tap ${jitterX} ${jitterY}`);
  }

  // Delay con variación
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generar cantidad de clicks para la ráfaga
  generarCantidadRafaga() {
    const min = this.config.clicksMin;
    const max = this.config.clicksMax;

    const base = Math.floor(min + Math.random() * (max - min));
    const variacion = Math.floor(base * 0.05 * (Math.random() * 2 - 1));
    const resultado = Math.max(min, Math.min(max, base + variacion));

    return resultado;
  }

  // Generar pausa entre ráfagas
  generarPausa() {
    const min = this.config.pausaMin * 1000;
    const max = this.config.pausaMax * 1000;

    const base = min + Math.random() * (max - min);
    const variacion = base * 0.1 * (Math.random() * 2 - 1);
    const resultado = Math.max(min, Math.min(max, base + variacion));

    return resultado;
  }

  // Delay entre clicks dentro de la ráfaga
  delayRafaga() {
    const min = this.config.velocidadMin;
    const max = this.config.velocidadMax;
    return min + Math.random() * (max - min);
  }

  // Verificar que el emulador está conectado
  async verificarEmulador() {
    this.log('🔍 Verificando conexión con emulador...');

    const devices = await this.adb('devices');

    if (!devices.includes('emulator') && !devices.includes('device')) {
      throw new Error('No se encontró emulador conectado. Asegúrate de que el emulador esté ejecutándose.');
    }

    this.log('✅ Emulador conectado correctamente');
  }

  // Ejecutar una ráfaga de clicks
  async ejecutarRafaga() {
    const cantidadClicks = this.generarCantidadRafaga();

    this.log(`\n╔═══════════════════════════════════════════════╗`);
    this.log(`║  🎯 RÁFAGA #${this.stats.rafagasCompletadas + 1}`);
    this.log(`║  📊 OBJETIVO: ${cantidadClicks.toLocaleString()} TAPS RÁPIDOS`);
    this.log(`╚═══════════════════════════════════════════════╝`);

    let clicksRafaga = 0;
    const inicioRafaga = Date.now();

    for (let i = 0; i < cantidadClicks; i++) {
      // Hacer tap en las coordenadas configuradas
      await this.tap(this.config.buttonX, this.config.buttonY);

      clicksRafaga++;
      this.stats.clicksTotal++;

      // Mostrar progreso cada 200 clicks
      if (clicksRafaga % 200 === 0 || clicksRafaga === cantidadClicks) {
        const porcentaje = Math.round((clicksRafaga / cantidadClicks) * 100);
        this.log(`   ⚡ Progreso: ${clicksRafaga.toLocaleString()}/${cantidadClicks.toLocaleString()} taps (${porcentaje}%)`);
      }

      // Delay entre clicks
      await this.sleep(this.delayRafaga());
    }

    const duracionRafaga = ((Date.now() - inicioRafaga) / 1000).toFixed(1);
    const tps = (clicksRafaga / parseFloat(duracionRafaga)).toFixed(1);

    this.log(`\n✅ RÁFAGA COMPLETADA:`);
    this.log(`   ✓ ${clicksRafaga.toLocaleString()} taps ejecutados`);
    this.log(`   ✓ Duración: ${duracionRafaga} segundos`);
    this.log(`   ✓ Velocidad: ${tps} taps/segundo\n`);

    this.stats.rafagasCompletadas++;
  }

  // Loop principal
  async run() {
    await this.verificarEmulador();

    this.log('\n╔════════════════════════════════════════╗');
    this.log('║  🤖 BOT ACTIVO - MODO RÁFAGAS ADB     ║');
    this.log('║  📱 Emulador Android                   ║');
    this.log('║  ⚡ Taps nativos (NO detectable)       ║');
    this.log('╚════════════════════════════════════════╝\n');

    this.log(`📍 Coordenadas del botón: (${this.config.buttonX}, ${this.config.buttonY})`);
    this.log(`📊 Rango de taps: ${this.config.clicksMin}-${this.config.clicksMax}`);
    this.log(`⏱️  Pausas: ${this.config.pausaMin}-${this.config.pausaMax}s`);
    this.log(`⚡ Velocidad: ${this.config.velocidadMin}-${this.config.velocidadMax}ms\n`);

    this.running = true;

    while (this.running) {
      try {
        await this.ejecutarRafaga();

        const pausa = this.generarPausa();
        const segundos = (pausa / 1000).toFixed(1);

        this.log(`💤 DESCANSO: ${segundos} segundos antes de la siguiente ráfaga...`);
        this.log(`   (Pausa natural variada)\n`);
        await this.sleep(pausa);

        // Mostrar estadísticas cada 3 ráfagas
        if (this.stats.rafagasCompletadas % 3 === 0) {
          const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
          const minutosActivo = Math.floor(uptime / 60);
          const segundosActivo = uptime % 60;
          const tpm = (this.stats.clicksTotal / (uptime / 60)).toFixed(1);
          const promedioPorRafaga = Math.round(this.stats.clicksTotal / this.stats.rafagasCompletadas);

          this.log(`\n╔═══════════════════════════════════════════════╗`);
          this.log(`║  📊 ESTADÍSTICAS GENERALES`);
          this.log(`╚═══════════════════════════════════════════════╝`);
          this.log(`   Total taps: ${this.stats.clicksTotal.toLocaleString()}`);
          this.log(`   Ráfagas completadas: ${this.stats.rafagasCompletadas}`);
          this.log(`   Promedio por ráfaga: ${promedioPorRafaga.toLocaleString()} taps`);
          this.log(`   Tiempo activo: ${minutosActivo}m ${segundosActivo}s`);
          this.log(`   Velocidad promedio: ${tpm} taps/min\n`);
        }

      } catch (error) {
        this.log(`💥 Error: ${error.message}`);
        await this.sleep(5000);
      }
    }
  }

  stop() {
    this.running = false;
    this.log('👋 Bot detenido');
  }
}

// ============================================
// CONFIGURACIÓN
// ============================================

// Leer configuración desde archivo o usar valores por defecto
const fs = require('fs');
let config;

const configPath = process.argv[2]; // Primer argumento: ruta al archivo de config

if (configPath && fs.existsSync(configPath)) {
  // Cargar config desde archivo JSON
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('📋 Configuración cargada desde archivo');
} else {
  // Configuración por defecto
  config = {
    // COORDENADAS DEL BOTÓN DE LA ROSA
    // Marcadas por el usuario: X=83, Y=1349
    buttonX: 83,
    buttonY: 1349,

    // Cantidad de clicks por ráfaga
    clicksMin: 300,
    clicksMax: 1400,

    // Pausas entre ráfagas (segundos)
    pausaMin: 4,
    pausaMax: 15,

    // Velocidad entre clicks (milisegundos)
    velocidadMin: 60,
    velocidadMax: 200
  };
  console.log('📋 Usando configuración por defecto');
}

// ============================================
// EJECUTAR BOT
// ============================================

const bot = new BotEmuladorADB(config);

process.on('SIGINT', () => {
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  bot.stop();
  process.exit(0);
});

bot.run().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

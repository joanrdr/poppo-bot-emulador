/**
 * BOT INTELIGENTE - Detecta cuando hay batalla activa
 * Se detiene automáticamente cuando termina la batalla
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const execPromise = util.promisify(exec);

class BotInteligente {
  constructor(config) {
    this.config = config;
    this.running = false;
    this.stats = {
      clicksTotal: 0,
      rafagasCompletadas: 0,
      batallasDetectadas: 0,
      startTime: Date.now()
    };
  }

  log(message) {
    console.log(message);
  }

  async adb(command) {
    try {
      const { stdout } = await execPromise(`adb ${command}`);
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  async tap(x, y) {
    const jitterX = Math.floor(x + (Math.random() - 0.5) * 16);
    const jitterY = Math.floor(y + (Math.random() - 0.5) * 16);
    await this.adb(`shell input tap ${jitterX} ${jitterY}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // DETECTAR SI HAY BATALLA ACTIVA
  async hayBatallaActiva() {
    try {
      // Tomar captura rápida
      await this.adb('shell screencap -p /sdcard/check.png');
      await this.adb('pull /sdcard/check.png /tmp/check.png');

      // Leer la captura y buscar indicadores de batalla
      // Por ahora, verificamos si el archivo existe y tiene tamaño razonable
      const stats = fs.statSync('/tmp/check.png');

      // Si la captura es muy pequeña (< 100KB), probablemente no hay batalla
      if (stats.size < 100000) {
        return false;
      }

      // TODO: Aquí podríamos usar OCR o detección de imagen
      // Por ahora, asumimos que si la captura es normal, hay batalla
      return true;

    } catch (error) {
      return false;
    }
  }

  generarCantidadRafaga() {
    const min = this.config.clicksMin;
    const max = this.config.clicksMax;
    const base = Math.floor(min + Math.random() * (max - min));
    const variacion = Math.floor(base * 0.05 * (Math.random() * 2 - 1));
    return Math.max(min, Math.min(max, base + variacion));
  }

  generarPausa() {
    const min = this.config.pausaMin * 1000;
    const max = this.config.pausaMax * 1000;
    const base = min + Math.random() * (max - min);
    const variacion = base * 0.1 * (Math.random() * 2 - 1);
    return Math.max(min, Math.min(max, base + variacion));
  }

  delayRafaga() {
    const min = this.config.velocidadMin;
    const max = this.config.velocidadMax;
    return min + Math.random() * (max - min);
  }

  async verificarEmulador() {
    this.log('🔍 Verificando emulador...');
    const devices = await this.adb('devices');
    if (!devices || (!devices.includes('emulator') && !devices.includes('device'))) {
      throw new Error('No se encontró emulador conectado');
    }
    this.log('✅ Emulador conectado');
  }

  async ejecutarRafaga() {
    const cantidadClicks = this.generarCantidadRafaga();

    this.log(`\n╔═══════════════════════════════════════════════╗`);
    this.log(`║  🎯 RÁFAGA #${this.stats.rafagasCompletadas + 1}`);
    this.log(`║  📊 OBJETIVO: ${cantidadClicks.toLocaleString()} TAPS`);
    this.log(`╚═══════════════════════════════════════════════╝`);

    let clicksRafaga = 0;
    const inicioRafaga = Date.now();

    for (let i = 0; i < cantidadClicks; i++) {
      // Verificar cada 100 clicks si sigue habiendo batalla
      if (i > 0 && i % 100 === 0) {
        const batalla = await this.hayBatallaActiva();
        if (!batalla) {
          this.log(`\n⚠️  BATALLA TERMINADA - Deteniendo ráfaga en ${clicksRafaga} taps`);
          break;
        }
      }

      await this.tap(this.config.buttonX, this.config.buttonY);
      clicksRafaga++;
      this.stats.clicksTotal++;

      if (clicksRafaga % 200 === 0 || clicksRafaga === cantidadClicks) {
        const porcentaje = Math.round((clicksRafaga / cantidadClicks) * 100);
        this.log(`   ⚡ Progreso: ${clicksRafaga.toLocaleString()}/${cantidadClicks.toLocaleString()} taps (${porcentaje}%)`);
      }

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

  async esperarBatalla() {
    this.log('\n⏰ ESPERANDO BATALLA...');
    this.log('   (Entra a una batalla cuando estés listo)\n');

    while (this.running) {
      const batalla = await this.hayBatallaActiva();

      if (batalla) {
        this.stats.batallasDetectadas++;
        this.log('\n🎮 ¡BATALLA DETECTADA! Iniciando taps...\n');
        return true;
      }

      await this.sleep(3000); // Verificar cada 3 segundos
      process.stdout.write('.');
    }

    return false;
  }

  async run() {
    await this.verificarEmulador();

    this.running = true;
    this.log('\n╔════════════════════════════════════════╗');
    this.log('║  🤖 BOT INTELIGENTE ACTIVO            ║');
    this.log('║  🧠 Detecta inicio/fin de batalla     ║');
    this.log('╚════════════════════════════════════════╝\n');

    this.log(`📍 Coordenadas: (${this.config.buttonX}, ${this.config.buttonY})`);
    this.log(`📊 Taps por ráfaga: ${this.config.clicksMin}-${this.config.clicksMax}`);
    this.log(`⏱️  Pausas: ${this.config.pausaMin}-${this.config.pausaMax}s`);
    this.log(`⚡ Velocidad: ${this.config.velocidadMin}-${this.config.velocidadMax}ms\n`);

    while (this.running) {
      try {
        // Esperar a que haya una batalla
        const hayBatalla = await this.esperarBatalla();

        if (!hayBatalla) continue;

        // Ejecutar ráfaga
        await this.ejecutarRafaga();

        // Pausa antes de verificar de nuevo
        const pausa = this.generarPausa();
        const segundos = (pausa / 1000).toFixed(1);

        this.log(`💤 Descanso: ${segundos}s antes de verificar batalla...\n`);
        await this.sleep(pausa);

        // Mostrar estadísticas cada 3 ráfagas
        if (this.stats.rafagasCompletadas % 3 === 0) {
          const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
          const minutosActivo = Math.floor(uptime / 60);
          const segundosActivo = uptime % 60;
          const tpm = (this.stats.clicksTotal / (uptime / 60)).toFixed(1);

          this.log(`\n╔═══════════════════════════════════════════════╗`);
          this.log(`║  📊 ESTADÍSTICAS`);
          this.log(`╚═══════════════════════════════════════════════╝`);
          this.log(`   Total taps: ${this.stats.clicksTotal.toLocaleString()}`);
          this.log(`   Ráfagas: ${this.stats.rafagasCompletadas}`);
          this.log(`   Batallas detectadas: ${this.stats.batallasDetectadas}`);
          this.log(`   Tiempo activo: ${minutosActivo}m ${segundosActivo}s`);
          this.log(`   Velocidad: ${tpm} taps/min\n`);
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

// CONFIGURACIÓN
const config = {
  // Coordenadas del botón de la rosa (marcadas por el usuario)
  buttonX: 83,
  buttonY: 1349,

  // Cantidad de taps por ráfaga
  clicksMin: 300,
  clicksMax: 1400,

  // Pausas entre ráfagas (segundos)
  pausaMin: 4,
  pausaMax: 15,

  // Velocidad entre taps (milisegundos)
  velocidadMin: 60,
  velocidadMax: 200
};

// EJECUTAR
const bot = new BotInteligente(config);

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

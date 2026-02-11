/**
 * ENCONTRAR COORDENADAS DEL BOTÓN
 * Herramienta para identificar dónde tocar en el emulador
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function adb(command) {
  try {
    const { stdout } = await execPromise(`adb ${command}`);
    return stdout.trim();
  } catch (error) {
    console.error(`Error ADB: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  🎯 ENCONTRAR COORDENADAS DEL BOTÓN DE LA FLOR  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Verificar emulador
  const devices = await adb('devices');
  if (!devices.includes('emulator') && !devices.includes('device')) {
    console.error('❌ No se encontró emulador. Inicia el emulador primero.');
    process.exit(1);
  }

  console.log('✅ Emulador conectado\n');

  // Obtener resolución de pantalla
  console.log('📱 Obteniendo resolución de pantalla...');
  const wm = await adb('shell wm size');
  console.log(`   ${wm}\n`);

  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  INSTRUCCIONES:                                  ║');
  console.log('╠═══════════════════════════════════════════════════╣');
  console.log('║  1. Abre POPPO en el emulador                    ║');
  console.log('║  2. Ve a una batalla (donde está el botón)       ║');
  console.log('║  3. Toca el botón de la flor en el emulador      ║');
  console.log('║  4. Mira aquí abajo las coordenadas              ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  console.log('👆 ESPERANDO TOQUES EN LA PANTALLA...\n');
  console.log('   (Presiona Ctrl+C cuando termines)\n');

  // Habilitar visualización de toques
  await adb('shell settings put system show_touches 1');
  await adb('shell settings put system pointer_location 1');

  console.log('🔵 Círculos azules mostrarán dónde tocas');
  console.log('📍 Las coordenadas aparecerán en la parte superior\n');

  // Capturar eventos táctiles
  const child = exec('adb shell getevent -l', (error, stdout, stderr) => {
    if (error && error.code !== 130) { // 130 = SIGINT (Ctrl+C)
      console.error(`Error: ${error.message}`);
    }
  });

  let lastX = null;
  let lastY = null;

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');

    for (const line of lines) {
      // Buscar eventos de posición táctil
      if (line.includes('ABS_MT_POSITION_X')) {
        const match = line.match(/(\d+)/g);
        if (match && match.length > 0) {
          lastX = parseInt(match[match.length - 1], 16);
        }
      } else if (line.includes('ABS_MT_POSITION_Y')) {
        const match = line.match(/(\d+)/g);
        if (match && match.length > 0) {
          lastY = parseInt(match[match.length - 1], 16);
        }
      } else if (line.includes('BTN_TOUCH') && line.includes('UP') && lastX !== null && lastY !== null) {
        // Convertir de valores hex a píxeles
        // Estos valores varían según el emulador, típicamente están en rango 0-32767
        // Necesitamos mapearlos a la resolución real (ejemplo: 1080x2400)

        // Para pantalla 1080x2400
        const screenWidth = 1080;
        const screenHeight = 2400;
        const maxValue = 32767;

        const pixelX = Math.round((lastX / maxValue) * screenWidth);
        const pixelY = Math.round((lastY / maxValue) * screenHeight);

        console.log(`\n✅ TOQUE DETECTADO:`);
        console.log(`   📍 Coordenadas: X=${pixelX}, Y=${pixelY}`);
        console.log(`   💾 Copia estas coordenadas a bot-emulador-adb.js\n`);

        lastX = null;
        lastY = null;
      }
    }
  });

  // Manejar Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n\n👋 Deteniendo...\n');

    // Desactivar visualización de toques
    await adb('shell settings put system show_touches 0');
    await adb('shell settings put system pointer_location 0');

    child.kill();
    process.exit(0);
  });
}

main();

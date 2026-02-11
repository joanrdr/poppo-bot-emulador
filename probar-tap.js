/**
 * PROBAR TAP EN COORDENADAS
 * Hace un tap de prueba para verificar que las coordenadas sean correctas
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// COORDENADAS DEL BOTÓN DE LA ROSA
const X = 78;   // Coordenada X
const Y = 60;   // Coordenada Y

async function adb(command) {
  try {
    const { stdout } = await execPromise(`adb ${command}`);
    return stdout.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  🎯 PRUEBA DE TAP                     ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Verificar emulador
  const devices = await adb('devices');
  if (!devices || (!devices.includes('emulator') && !devices.includes('device'))) {
    console.error('❌ No se encontró emulador conectado');
    process.exit(1);
  }

  console.log('✅ Emulador conectado');
  console.log(`📍 Coordenadas configuradas: (${X}, ${Y})\n`);

  console.log('🔵 Haciendo tap de prueba en 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log(`👆 TAP en (${X}, ${Y})`);
  await adb(`shell input tap ${X} ${Y}`);

  console.log('\n¿El tap tocó el botón correcto?');
  console.log('  ✅ SÍ: Las coordenadas son correctas');
  console.log('  ❌ NO: Ajusta X e Y en este archivo y vuelve a ejecutar\n');

  console.log('💡 TIPS:');
  console.log('  - Si el tap está muy arriba/abajo: ajusta Y');
  console.log('  - Si el tap está muy izquierda/derecha: ajusta X');
  console.log('  - Usa encontrar-coordenadas.js para obtener coordenadas exactas\n');
}

main();

/**
 * MARCADOR INTERACTIVO DE BOTÓN
 * Te permite ajustar coordenadas con teclado hasta encontrar el botón exacto
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Posición inicial (centro-izquierda)
let x = 100;
let y = 500;

// Tamaño del ajuste
let ajuste = 50; // píxeles

async function adb(command) {
  try {
    const { stdout } = await execPromise(`adb ${command}`);
    return stdout.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

async function tap() {
  console.log(`\n👆 TAP en (${x}, ${y})`);
  await adb(`shell input tap ${x} ${y}`);
}

function mostrarAyuda() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  🎯 MARCADOR INTERACTIVO DE BOTÓN            ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log('COMANDOS:');
  console.log('  w = Arriba     s = Abajo');
  console.log('  a = Izquierda  d = Derecha');
  console.log('  t = Hacer TAP en posición actual');
  console.log('  + = Aumentar ajuste (mover más rápido)');
  console.log('  - = Reducir ajuste (mover más preciso)');
  console.log('  g = Guardar coordenadas cuando encuentres el botón');
  console.log('  q = Salir');
  console.log(`\n📍 Posición actual: (${x}, ${y})`);
  console.log(`📏 Ajuste: ${ajuste} píxeles\n`);
}

async function guardarCoordenadas() {
  console.log('\n✅ COORDENADAS ENCONTRADAS:');
  console.log(`   X = ${x}`);
  console.log(`   Y = ${y}\n`);

  console.log('💾 Guardando en bot-emulador-adb.js...');

  const fs = require('fs');
  const botPath = '/Users/joanrodriguez/taptap/bot-emulador-adb.js';
  let content = fs.readFileSync(botPath, 'utf8');

  // Reemplazar coordenadas
  content = content.replace(/buttonX:\s*\d+/, `buttonX: ${x}`);
  content = content.replace(/buttonY:\s*\d+/, `buttonY: ${y}`);

  fs.writeFileSync(botPath, content);

  console.log('✅ Coordenadas guardadas en bot-emulador-adb.js');
  console.log('\nAhora puedes ejecutar:');
  console.log('  npm run probar-tap  (para probar)');
  console.log('  npm run emulador    (para ejecutar el bot)\n');
}

async function main() {
  // Verificar emulador
  const devices = await adb('devices');
  if (!devices || (!devices.includes('emulator') && !devices.includes('device'))) {
    console.error('❌ No se encontró emulador conectado');
    process.exit(1);
  }

  mostrarAyuda();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  // Hacer tap inicial
  await tap();
  rl.prompt();

  rl.on('line', async (input) => {
    const cmd = input.trim().toLowerCase();

    switch(cmd) {
      case 'w': // Arriba
        y -= ajuste;
        console.log(`⬆️  Arriba: (${x}, ${y})`);
        await tap();
        break;

      case 's': // Abajo
        y += ajuste;
        console.log(`⬇️  Abajo: (${x}, ${y})`);
        await tap();
        break;

      case 'a': // Izquierda
        x -= ajuste;
        console.log(`⬅️  Izquierda: (${x}, ${y})`);
        await tap();
        break;

      case 'd': // Derecha
        x += ajuste;
        console.log(`➡️  Derecha: (${x}, ${y})`);
        await tap();
        break;

      case 't': // Tap
        await tap();
        break;

      case '+': // Aumentar ajuste
        ajuste = Math.min(ajuste + 10, 200);
        console.log(`📏 Ajuste aumentado a ${ajuste} píxeles (movimientos más grandes)`);
        break;

      case '-': // Reducir ajuste
        ajuste = Math.max(ajuste - 10, 5);
        console.log(`📏 Ajuste reducido a ${ajuste} píxeles (movimientos más precisos)`);
        break;

      case 'g': // Guardar
        await guardarCoordenadas();
        rl.close();
        return;

      case 'q': // Salir
        console.log('👋 Saliendo...');
        rl.close();
        return;

      case 'h': // Ayuda
        mostrarAyuda();
        break;

      default:
        console.log('❓ Comando desconocido. Escribe "h" para ayuda.');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main();

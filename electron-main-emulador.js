const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let botProcess = null;
let estadisticas = {
    clicksTotal: 0,
    rafagasCompletadas: 0,
    velocidad: 0,
    inicioSesion: null
};

// Determinar ruta de ADB
function findAdbPath() {
    const possiblePaths = [
        '/opt/homebrew/bin/adb',           // Homebrew Apple Silicon
        '/usr/local/bin/adb',              // Homebrew Intel
        '/usr/bin/adb',                    // Linux
        process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : null,
        'adb'                              // PATH del sistema
    ].filter(Boolean);

    for (const adbPath of possiblePaths) {
        if (adbPath === 'adb' || fs.existsSync(adbPath)) {
            return adbPath;
        }
    }

    return 'adb'; // Fallback
}

const ADB_PATH = findAdbPath();
console.log('🔍 ADB path:', ADB_PATH);

// Configurar PATH para comandos exec
const execEnv = {
    ...process.env,
    PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`
};

// Ruta del emulador
const EMULATOR_PATH = process.env.ANDROID_HOME
    ? `${process.env.ANDROID_HOME}/emulator/emulator`
    : `${process.env.HOME}/Library/Android/sdk/emulator/emulator`;

const AVD_NAME = 'POPPO_Bot';

// Verificar estado del emulador
function verificarEstadoEmulador() {
    exec(`${ADB_PATH} devices`, { env: execEnv }, (error, stdout) => {
        // Verificar que haya una línea con "emulator" o "device" además del header
        const lines = stdout.split('\n').filter(line => line.trim());
        const conectado = !error && lines.length > 1 && lines.some(line =>
            line.includes('emulator') && line.includes('device')
        );
        if (mainWindow) {
            mainWindow.webContents.send('emulador-estado', { conectado });
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 1000,
        minHeight: 650,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'POPPO Bot Emulador',
        backgroundColor: '#667eea'
    });

    mainWindow.loadFile('electron-emulador.html');

    // Abrir DevTools en desarrollo
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        if (botProcess) {
            botProcess.kill();
        }
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// ==================== IPC HANDLERS ====================

// Verificar estado del emulador
ipcMain.on('verificar-emulador', () => {
    verificarEstadoEmulador();
});

// Iniciar emulador
ipcMain.on('iniciar-emulador', () => {
    enviarLog('🚀 Iniciando emulador...', 'info');
    enviarLog('⏱️  Esto puede tardar 30-60 segundos...', 'warning');

    const emulatorProcess = spawn(EMULATOR_PATH, ['-avd', AVD_NAME, '-no-snapshot-load'], {
        env: execEnv,
        detached: true,
        stdio: 'ignore'
    });

    emulatorProcess.unref();

    // Verificar estado cada 5 segundos
    let intentos = 0;
    const maxIntentos = 20;
    const intervalo = setInterval(() => {
        exec(`${ADB_PATH} devices`, { env: execEnv }, (error, stdout) => {
            intentos++;
            if (!error && (stdout.includes('emulator') || stdout.includes('device'))) {
                clearInterval(intervalo);
                enviarLog('✅ Emulador iniciado correctamente', 'success');
                verificarEstadoEmulador();
            } else if (intentos >= maxIntentos) {
                clearInterval(intervalo);
                enviarLog('⚠️ El emulador está tardando más de lo esperado', 'warning');
                verificarEstadoEmulador();
            }
        });
    }, 5000);
});

// Marcar coordenadas visualmente
ipcMain.on('marcar-coordenadas', () => {
    enviarLog('🎯 Abriendo herramienta de marcado...', 'info');

    // Tomar captura de pantalla
    exec(`${ADB_PATH} shell screencap -p /sdcard/batalla.png && ${ADB_PATH} pull /sdcard/batalla.png batalla.png`, { env: execEnv }, (error) => {
        if (error) {
            enviarLog('❌ Error al capturar pantalla', 'error');
            return;
        }

        // Iniciar servidor Python
        const pythonServer = spawn('python3', ['click-capturador.py']);

        pythonServer.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python:', output);

            // Detectar coordenadas guardadas
            const match = output.match(/X=(\d+), Y=(\d+)/);
            if (match) {
                const coords = {
                    x: parseInt(match[1]),
                    y: parseInt(match[2])
                };
                mainWindow.webContents.send('coordenadas-actualizadas', coords);
                pythonServer.kill();
            }
        });

        enviarLog('📍 Servidor de marcado iniciado en http://localhost:8000', 'success');
        enviarLog('👆 Haz clic en la imagen para marcar el botón', 'info');
    });
});

// Probar coordenadas con 50 taps
ipcMain.on('probar-coordenadas', (event, config) => {
    enviarLog(`🧪 Probando coordenadas (${config.buttonX}, ${config.buttonY})...`, 'info');

    const scriptContent = `#!/bin/bash
for i in {1..50}; do
    adb shell input tap ${config.buttonX} ${config.buttonY}
    sleep 0.08
done
echo "✅ Prueba completada: 50 taps"
`;

    fs.writeFileSync('/tmp/probar-tap-temp.sh', scriptContent);
    exec('chmod +x /tmp/probar-tap-temp.sh', () => {
        const testProcess = spawn('/tmp/probar-tap-temp.sh');

        testProcess.stdout.on('data', (data) => {
            enviarLog(data.toString().trim(), 'success');
        });

        testProcess.on('close', () => {
            enviarLog('✅ Prueba finalizada', 'success');
        });
    });
});

// Iniciar bot
ipcMain.on('start-bot-emulador', (event, config) => {
    if (botProcess) {
        enviarLog('⚠️ Bot ya está en ejecución', 'warning');
        return;
    }

    enviarLog('🚀 Verificando conexión con emulador...', 'info');

    // Verificar conexión ADB
    exec(`${ADB_PATH} devices`, { env: execEnv }, (error, stdout) => {
        if (error || !stdout.includes('emulator')) {
            enviarLog('❌ Emulador no detectado. Inicia el emulador primero.', 'error');
            console.error('ADB error:', error);
            console.log('ADB stdout:', stdout);
            return;
        }

        enviarLog('✅ Emulador conectado', 'success');
        enviarLog('⚡ Iniciando bot...', 'info');

        // Resetear estadísticas
        estadisticas = {
            clicksTotal: 0,
            rafagasCompletadas: 0,
            velocidad: 0,
            inicioSesion: Date.now()
        };

        // Crear archivo de configuración temporal
        const configPath = '/tmp/bot-config.json';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Determinar ruta del bot
        // En app empaquetada, los archivos asarUnpack están en .asar.unpacked
        let botScriptPath;
        if (app.isPackaged) {
            // Reemplazar .asar con .asar.unpacked para archivos extraídos
            botScriptPath = __dirname.replace('app.asar', 'app.asar.unpacked');
            botScriptPath = path.join(botScriptPath, 'bot-emulador-adb.js');
        } else {
            botScriptPath = path.join(__dirname, 'bot-emulador-adb.js');
        }

        console.log('📍 Bot script path:', botScriptPath);

        // Iniciar bot con configuración
        botProcess = spawn('node', [botScriptPath, configPath], {
            env: execEnv,
            cwd: path.dirname(botScriptPath)
        });

        botProcess.stdout.on('data', (data) => {
            const output = data.toString();
            procesarOutputBot(output);
        });

        botProcess.stderr.on('data', (data) => {
            enviarLog(`Error: ${data.toString()}`, 'error');
        });

        botProcess.on('close', (code) => {
            enviarLog(`🛑 Bot detenido (código: ${code})`, 'warning');
            botProcess = null;
        });

        enviarLog('🤖 Bot activo en modo ráfagas', 'success');
        enviarLog(`📍 Coordenadas: (${config.buttonX}, ${config.buttonY})`, 'info');
        enviarLog(`📊 Taps por ráfaga: ${config.clicksMin}-${config.clicksMax}`, 'info');
        enviarLog(`⏱️  Pausas: ${config.pausaMin}-${config.pausaMax}s`, 'info');
        enviarLog(`⚡ Velocidad: ${config.velocidadMin}-${config.velocidadMax}ms`, 'info');
    });
});

// Detener bot
ipcMain.on('stop-bot-emulador', () => {
    if (botProcess) {
        botProcess.kill();
        botProcess = null;
        enviarLog('⏹ Bot detenido por el usuario', 'warning');
        enviarEstadisticas();
    } else {
        enviarLog('⚠️ No hay bot en ejecución', 'warning');
    }
});

// ==================== FUNCIONES AUXILIARES ====================

function procesarOutputBot(output) {
    const lineas = output.split('\n');

    lineas.forEach(linea => {
        linea = linea.trim();
        if (!linea) return;

        // Detectar ráfaga iniciada
        if (linea.includes('RÁFAGA #')) {
            const match = linea.match(/RÁFAGA #(\d+)/);
            if (match) {
                estadisticas.rafagasCompletadas = parseInt(match[1]) - 1;
                enviarLog(`🎯 ${linea}`, 'info');
            }
        }
        // Detectar progreso de taps
        else if (linea.includes('taps (') && linea.includes('%')) {
            const match = linea.match(/(\d+)\/\d+ taps/);
            if (match) {
                estadisticas.clicksTotal = parseInt(match[1]);
                calcularVelocidad();
                enviarEstadisticas();
                enviarLog(linea, 'success');
            }
        }
        // Detectar ráfaga completada
        else if (linea.includes('RÁFAGA COMPLETADA')) {
            estadisticas.rafagasCompletadas++;
            enviarLog('✅ Ráfaga completada', 'success');
            enviarEstadisticas();
        }
        // Detectar descanso
        else if (linea.includes('DESCANSO')) {
            enviarLog(linea, 'warning');
        }
        // Otros mensajes
        else if (linea.includes('✅') || linea.includes('✓')) {
            enviarLog(linea, 'success');
        }
        else if (linea.includes('❌')) {
            enviarLog(linea, 'error');
        }
        else if (linea.includes('⚡') || linea.includes('🎯')) {
            enviarLog(linea, 'info');
        }
    });
}

function calcularVelocidad() {
    if (estadisticas.inicioSesion) {
        const tiempoTranscurrido = (Date.now() - estadisticas.inicioSesion) / 1000 / 60; // minutos
        if (tiempoTranscurrido > 0) {
            estadisticas.velocidad = Math.round(estadisticas.clicksTotal / tiempoTranscurrido);
        }
    }
}

function enviarLog(message, type = 'info') {
    if (mainWindow) {
        mainWindow.webContents.send('bot-log', { message, type });
    }
}

function enviarEstadisticas() {
    if (mainWindow) {
        mainWindow.webContents.send('bot-stats', estadisticas);
    }
}

// ==================== MANEJO DE ERRORES ====================

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    enviarLog(`❌ Error crítico: ${error.message}`, 'error');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada:', reason);
    enviarLog(`❌ Error: ${reason}`, 'error');
});

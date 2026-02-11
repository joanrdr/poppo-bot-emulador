/**
 * POPPO BOT - Aplicación de Escritorio
 * Electron Main Process
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let botProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('electron-ui.html');

  // Abrir DevTools en desarrollo
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    if (botProcess) {
      botProcess.kill();
    }
    mainWindow = null;
  });
}

// Iniciar bot
ipcMain.on('start-bot', (event, config) => {
  if (botProcess) {
    event.reply('bot-log', { type: 'warning', message: 'El bot ya está corriendo' });
    return;
  }

  event.reply('bot-log', { type: 'info', message: '🚀 Iniciando bot...' });

  // Crear archivo de configuración temporal
  const fs = require('fs');
  const configPath = path.join(__dirname, 'bot-config-temp.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Iniciar bot como proceso hijo
  botProcess = spawn('node', [
    path.join(__dirname, 'bot-electron.js'),
    configPath
  ], {
    cwd: __dirname
  });

  botProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      event.reply('bot-log', { type: 'info', message: line });
    });
  });

  botProcess.stderr.on('data', (data) => {
    event.reply('bot-log', { type: 'error', message: data.toString() });
  });

  botProcess.on('close', (code) => {
    event.reply('bot-log', {
      type: code === 0 ? 'success' : 'error',
      message: `Bot detenido (código: ${code})`
    });
    botProcess = null;
    event.reply('bot-stopped');
  });
});

// Detener bot
ipcMain.on('stop-bot', (event) => {
  if (botProcess) {
    botProcess.kill();
    botProcess = null;
    event.reply('bot-log', { type: 'warning', message: '⏹ Bot detenido por usuario' });
    event.reply('bot-stopped');
  }
});

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

app.on('before-quit', () => {
  if (botProcess) {
    botProcess.kill();
  }
});

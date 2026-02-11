# 🌸 POPPO Bot Emulador

Bot automatizado con interfaz gráfica para Android Emulator que realiza taps automáticos en POPPO Live de manera humanizada e indetectable.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

- 🎯 **Interfaz Gráfica Intuitiva** - Aplicación de escritorio con Electron
- 🤖 **Taps Nativos ADB** - Usa Android Debug Bridge para simular taps reales
- 🎨 **Diseño Responsive** - Se adapta a diferentes tamaños de pantalla
- ⚡ **Múltiples Presets** - Ultra Rápido, Balanceado, Conservador, Modo Loco
- 📊 **Estadísticas en Tiempo Real** - Total de taps, ráfagas, velocidad
- 🎯 **Herramienta de Marcado Visual** - Marca coordenadas con clicks
- 🔧 **Configuración Flexible** - Personaliza todos los parámetros
- 🌊 **Comportamiento Humanizado** - Velocidad y pausas variables

## 📋 Requisitos

### macOS
- macOS 10.13 o superior (recomendado macOS 14+)
- Android Studio con Android Emulator
- ADB (Android Debug Bridge)
- Node.js 16+ y npm

### Windows
- Windows 10/11
- Android Studio con Android Emulator
- ADB en PATH
- Node.js 16+ y npm

## 🚀 Instalación

### 1. Instalar Android Platform Tools (ADB)

**macOS:**
```bash
brew install --cask android-platform-tools
```

**Windows:**
Descarga desde [Android Developer](https://developer.android.com/studio/releases/platform-tools) y agrega al PATH.

### 2. Clonar el Repositorio
```bash
git clone https://github.com/joanrdr/taptap.git
cd taptap
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Emulador Android
```bash
# Crear AVD (Android Virtual Device)
# Recomendado: Pixel 7, API 34, ARM64 (para Mac M1/M2/M3/M4)
emulator -avd Pixel_7_API_34 -no-snapshot-load
```

### 5. Instalar POPPO Live en el Emulador
- Descarga el APK de POPPO Live
- Instala en el emulador: `adb install poppo.apk`

## 💻 Uso

### Ejecutar la Aplicación GUI

```bash
npm run app-emulador
```

### Usar desde Terminal (sin GUI)

```bash
npm run emulador
```

## 🎮 Guía Rápida

### 1. Primera Configuración

1. **Inicia el emulador Android**
2. **Abre POPPO Live** en el emulador
3. **Entra a una batalla**
4. **Ejecuta la aplicación**: `npm run app-emulador`
5. **Marca las coordenadas**:
   - Clic en "Marcar en Pantalla"
   - Se abre navegador con captura del emulador
   - Haz clic en el botón de la rosa
   - Las coordenadas se actualizan automáticamente

### 2. Probar Coordenadas

- Clic en "Probar (50 taps)" para verificar
- Si los taps no tocan el botón correcto, vuelve a marcar

### 3. Configurar y Ejecutar

1. **Elige un preset** o configura manualmente:
   - **Taps por Ráfaga**: Cantidad de taps antes de pausar
   - **Pausas**: Tiempo de descanso entre ráfagas
   - **Velocidad**: Delay entre cada tap individual

2. **Inicia el bot**: Clic en "INICIAR BOT"
3. **Monitorea las estadísticas** en tiempo real
4. **Detén cuando termine la batalla**: Clic en "DETENER BOT"

## ⚙️ Presets Disponibles

| Preset | Taps/Ráfaga | Pausas | Velocidad | Uso |
|--------|-------------|--------|-----------|-----|
| ⚡ Ultra Rápido | 500-1400 | 1-5s | 50-150ms | Máximo rendimiento |
| ⚖️ Balanceado | 300-1400 | 4-15s | 60-200ms | Recomendado |
| 🐢 Conservador | 200-800 | 8-20s | 100-300ms | Más seguro |
| 🔥 Modo Loco | 800-2000 | 1-3s | 20-80ms | Agresivo |

## 📦 Crear Ejecutable

### macOS
```bash
npm run build-mac
```
El ejecutable se genera en `dist/mac-arm64/POPPO Bot Emulador.app`

### Windows
```bash
npm run build-win
```
El instalador se genera en `dist/`

## 🛠️ Scripts Disponibles

```bash
npm run app-emulador      # Abrir aplicación GUI
npm run emulador          # Bot en terminal (sin GUI)
npm run bot-inteligente   # Bot con detección de batallas
npm run build-mac         # Crear ejecutable para macOS
npm run build-win         # Crear instalador para Windows
```

## 📁 Estructura del Proyecto

```
taptap/
├── electron-main-emulador.js    # Proceso principal de Electron
├── electron-emulador.html       # Interfaz gráfica
├── bot-emulador-adb.js         # Lógica del bot con ADB
├── click-capturador.py         # Herramienta de marcado de coordenadas
├── ultra-rapido.sh             # Script shell para modo ultra rápido
├── probar-ahora.sh             # Script de prueba rápida
├── package.json                # Configuración de npm
├── GUIA-APP-EMULADOR.md       # Guía detallada
└── README.md                   # Este archivo
```

## ❓ Solución de Problemas

### El bot no hace taps
```bash
# Verifica conexión con emulador
adb devices

# Debería mostrar: emulator-5554	device
```

### Los taps no tocan el botón correcto
1. Usa "Marcar en Pantalla" para encontrar nuevas coordenadas
2. Prueba con "Probar (50 taps)"
3. Ajusta manualmente si es necesario

### Error de conexión ADB
```bash
# Reinicia ADB
adb kill-server
adb start-server
```

### El emulador no inicia
- Verifica que Android Studio esté instalado
- Asegúrate de tener un AVD creado
- En Mac M1/M2/M3/M4 usa imágenes ARM64

## 🔒 Seguridad y Ética

⚠️ **IMPORTANTE**: Este bot es para uso educacional y personal únicamente.

- Usa bajo tu propia responsabilidad
- No garantizamos que sea indetectable
- El uso de bots puede violar los términos de servicio de POPPO Live
- Recomendamos usar con moderación

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

**Joan Rodriguez**
- GitHub: [@joanrdr](https://github.com/joanrdr)
- Email: joanrdr37@gmail.com

## ⭐ Agradecimientos

- A la comunidad de Electron por el excelente framework
- A los desarrolladores de ADB por la herramienta
- A todos los que contribuyen al proyecto

---

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**

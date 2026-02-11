# 🌸 POPPO Bot Emulador - Aplicación GUI

Aplicación de escritorio con interfaz gráfica para controlar el bot de tapping en el emulador Android.

## 🚀 Inicio Rápido

### 1. Iniciar el Emulador Android
```bash
emulator -avd Pixel_7_API_34 -no-snapshot-load
```

### 2. Abrir la App de POPPO Live en el emulador

### 3. Lanzar la aplicación GUI
```bash
npm run app-emulador
```

## 📱 Uso de la Aplicación

### Panel de Configuración (Izquierda)

#### 📍 Coordenadas
- **X (Horizontal)**: Posición horizontal del botón de la rosa (por defecto: 83)
- **Y (Vertical)**: Posición vertical del botón de la rosa (por defecto: 1349)
- **Botón "Marcar en Pantalla"**: Abre herramienta visual para marcar nuevas coordenadas
- **Botón "Probar (50 taps)"**: Hace 50 taps de prueba para verificar coordenadas

#### 🎯 Taps por Ráfaga
- **Mínimo**: Cantidad mínima de taps por ráfaga (recomendado: 300-500)
- **Máximo**: Cantidad máxima de taps por ráfaga (recomendado: 1000-1400)
- El bot genera un número aleatorio entre estos valores para cada ráfaga

#### ⏱️ Pausas (segundos)
- **Mínimo**: Pausa mínima entre ráfagas (recomendado: 1-4)
- **Máximo**: Pausa máxima entre ráfagas (recomendado: 5-15)
- Pausas variables para comportamiento natural

#### ⚡ Velocidad (milisegundos)
- **Mínimo**: Delay mínimo entre cada tap (recomendado: 50-60)
- **Máximo**: Delay máximo entre cada tap (recomendado: 150-200)
- Menor valor = más rápido

### ⚙️ Presets Rápidos

Configura todos los parámetros con un solo clic:

- **⚡ Ultra Rápido**: Máxima velocidad (500-1400 taps, pausas 1-5s, 50-150ms)
- **⚖️ Balanceado**: Configuración equilibrada (300-1400 taps, pausas 4-15s, 60-200ms)
- **🐢 Conservador**: Velocidad segura (200-800 taps, pausas 8-20s, 100-300ms)
- **🔥 Modo Loco**: Agresivo (800-2000 taps, pausas 1-3s, 20-80ms)

### Panel Principal (Derecha)

#### 📊 Estadísticas en Tiempo Real

- **Estado**: Indica si el bot está activo o inactivo
- **Total Taps**: Contador acumulado de todos los taps realizados
- **Ráfagas**: Número de ráfagas completadas
- **Taps/min**: Velocidad promedio de tapping

#### 📋 Log de Actividad

Muestra en tiempo real:
- Inicio/fin de cada ráfaga
- Progreso durante las ráfagas
- Pausas entre ráfagas
- Errores o advertencias

Los mensajes tienen colores:
- 🟢 Verde: Eventos exitosos
- 🔵 Azul: Información general
- 🟡 Amarillo: Advertencias
- 🔴 Rojo: Errores

## 🎯 Flujo de Trabajo Típico

1. **Primera vez - Marcar coordenadas:**
   ```
   1. Entra a una batalla en POPPO
   2. Clic en "Marcar en Pantalla"
   3. Clic en la rosa en la imagen que se abre
   4. Las coordenadas se actualizan automáticamente
   ```

2. **Probar coordenadas:**
   ```
   1. Entra a una batalla
   2. Clic en "Probar (50 taps)"
   3. Verifica que los taps funcionan
   ```

3. **Configurar preset:**
   ```
   1. Elige un preset (ej: "Balanceado")
   2. Ajusta si es necesario
   ```

4. **Iniciar bot:**
   ```
   1. Entra a una batalla
   2. Clic en "INICIAR BOT"
   3. El bot empieza a hacer taps
   4. Monitorea las estadísticas
   ```

5. **Detener bot:**
   ```
   - Opción 1: Clic en "DETENER BOT"
   - Opción 2: Cerrar la aplicación
   ```

## 🔧 Herramienta de Marcado de Coordenadas

Cuando haces clic en "Marcar en Pantalla":

1. Se captura una imagen de la pantalla del emulador
2. Se abre un servidor web en http://localhost:8000
3. Haz clic en la posición exacta del botón de la rosa
4. Las coordenadas se calculan y actualizan automáticamente
5. El servidor se cierra automáticamente

## 💡 Consejos

### Para Máximo Rendimiento
- Usa preset "Ultra Rápido" o "Modo Loco"
- Objetivo: ~10,000 taps en 3 minutos
- Atención: Puede ser más detectable

### Para Seguridad
- Usa preset "Balanceado" o "Conservador"
- Comportamiento más humano
- Menor probabilidad de detección

### Detener cuando la Batalla Termina
- El bot no detecta automáticamente el fin de batalla
- Debes detenerlo manualmente cuando termine
- Simplemente haz clic en "DETENER BOT"

## ❗ Solución de Problemas

### El bot no hace taps
- Verifica que el emulador esté conectado: `adb devices`
- Prueba las coordenadas con "Probar (50 taps)"
- Re-marca las coordenadas con "Marcar en Pantalla"

### Los taps no tocan el botón correcto
- Las coordenadas pueden haber cambiado
- Usa "Marcar en Pantalla" para encontrar las nuevas coordenadas
- Verifica con "Probar (50 taps)"

### El bot es muy lento
- Reduce los valores de "Velocidad"
- Aumenta los valores de "Taps por Ráfaga"
- Reduce las "Pausas"

### Error de conexión ADB
- Reinicia el emulador
- Ejecuta: `adb kill-server && adb start-server`
- Verifica: `adb devices`

## 🎮 Comandos Útiles

### Ver logs del bot en terminal
```bash
# Opción 1: GUI app
npm run app-emulador

# Opción 2: Bot solo (sin GUI)
npm run emulador
```

### Verificar conexión ADB
```bash
adb devices
```

### Reiniciar ADB
```bash
adb kill-server
adb start-server
```

### Tomar captura de pantalla manual
```bash
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```

## 📦 Construir Ejecutable

Para crear un ejecutable de la aplicación:

```bash
# macOS
npm run build-mac

# Windows
npm run build-win

# Todos los sistemas
npm run build-all
```

El ejecutable se generará en la carpeta `dist/`.

---

**¡Disfruta automatizando tus batallas de POPPO! 🌸⚡**

# 🤖 POPPO Bot - Emulador Android (PROFESIONAL)

## 🏆 **LA MEJOR SOLUCIÓN - NO DETECTABLE**

Usamos **emulador Android + ADB** para hacer **taps nativos** que son **imposibles de detectar** porque:

✅ **Taps reales del sistema Android** - No es navegador web
✅ **Sin detección de Puppeteer** - No hay webdriver ni headers sospechosos
✅ **Sin bloqueos de URL** - No navegas por web, usas la app nativa
✅ **Funciona con Mac M4 Pro** - Optimizado para Apple Silicon

---

## 🎯 **ESTADO ACTUAL**

✅ **Emulador Android creado** (POPPO_Bot)
✅ **POPPO instalado** en el emulador
✅ **ADB configurado** y funcionando
✅ **Bot de ráfagas listo** (300-1400 taps con pausas 4-15s)

---

## 🚀 **CÓMO USAR (3 PASOS)**

### **PASO 1: Iniciar el Emulador**

```bash
~/Library/Android/sdk/emulator/emulator -avd POPPO_Bot -no-audio &
```

Espera 30-60 segundos a que inicie. Verás una ventana del emulador.

---

### **PASO 2: Configurar POPPO y Encontrar Coordenadas**

#### 2.1 Abrir POPPO en el emulador

```bash
adb shell monkey -p com.baitu.qingshu -c android.intent.category.LAUNCHER 1
```

#### 2.2 Iniciar sesión y ir a una batalla

- En el emulador, inicia sesión en POPPO
- Ve a una transmisión en vivo
- **Entra a una batalla** donde aparezca el botón de la flor

#### 2.3 Encontrar las coordenadas del botón

```bash
npm run coordenadas
```

Este script:
- Mostrará círculos azules cuando toques la pantalla
- Imprimirá las coordenadas exactas donde tocaste

**¡IMPORTANTE!** Toca el **botón de la flor** varias veces y anota las coordenadas.

Ejemplo de salida:
```
✅ TOQUE DETECTADO:
   📍 Coordenadas: X=542, Y=1823
```

Presiona **Ctrl+C** cuando termines.

#### 2.4 Configurar coordenadas en el bot

Abre `bot-emulador-adb.js` y edita estas líneas (aproximadamente línea 211):

```javascript
const config = {
  // COORDENADAS DEL BOTÓN (las que obtuviste)
  buttonX: 542,  // ⚠️ CAMBIAR ESTO
  buttonY: 1823, // ⚠️ CAMBIAR ESTO

  // ... resto de configuración
};
```

#### 2.5 Probar que las coordenadas funcionen

```bash
npm run probar-tap
```

Esto hará **un tap de prueba**. Verifica que toque el botón de la flor.

- ✅ **SÍ funciona**: Continúa al paso 3
- ❌ **NO funciona**: Ajusta las coordenadas y vuelve a probar

---

### **PASO 3: Ejecutar el Bot**

Una vez que:
- ✅ El emulador está abierto
- ✅ POPPO está en una batalla
- ✅ Las coordenadas están configuradas correctamente

**Ejecuta:**

```bash
npm run emulador
```

El bot empezará a hacer:
- 🎯 **Ráfagas de 300-1400 taps** (variado)
- ⏱️ **Pausas de 4-15 segundos** (variado)
- ⚡ **Velocidad 60-200ms** entre taps
- 📊 **Estadísticas en tiempo real**

---

## ⚙️ **CONFIGURACIÓN PERSONALIZADA**

Edita `bot-emulador-adb.js` (líneas 211-228):

```javascript
const config = {
  // Coordenadas del botón
  buttonX: 542,
  buttonY: 1823,

  // Cantidad de taps por ráfaga
  clicksMin: 300,   // Mínimo
  clicksMax: 1400,  // Máximo

  // Pausas entre ráfagas (segundos)
  pausaMin: 4,      // Mínimo
  pausaMax: 15,     // Máximo

  // Velocidad entre taps (milisegundos)
  velocidadMin: 60,   // Más rápido
  velocidadMax: 200   // Más lento
};
```

---

## 📋 **COMANDOS ÚTILES**

| Comando | Descripción |
|---------|-------------|
| `npm run emulador` | Ejecutar bot de taps |
| `npm run coordenadas` | Encontrar coordenadas del botón |
| `npm run probar-tap` | Probar un tap en las coordenadas |
| `adb devices` | Ver emuladores conectados |
| `adb shell monkey -p com.baitu.qingshu 1` | Abrir POPPO |

---

## 🔧 **COMANDOS DEL EMULADOR**

### Iniciar emulador
```bash
~/Library/Android/sdk/emulator/emulator -avd POPPO_Bot -no-audio &
```

### Detener emulador
```bash
adb emu kill
```

### Ver emuladores disponibles
```bash
~/Library/Android/sdk/emulator/emulator -list-avds
```

### Captura de pantalla
```bash
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

## 🎯 **EJEMPLOS DE CONFIGURACIÓN**

### ⚡ Ultra Agresivo
```javascript
clicksMin: 800,
clicksMax: 1400,
pausaMin: 4,
pausaMax: 8,
velocidadMin: 50,
velocidadMax: 150
```

### ⚖️ Balanceado (Recomendado)
```javascript
clicksMin: 300,
clicksMax: 1400,
pausaMin: 4,
pausaMax: 15,
velocidadMin: 60,
velocidadMax: 200
```

### 🐢 Conservador
```javascript
clicksMin: 200,
clicksMax: 800,
pausaMin: 8,
pausaMax: 20,
velocidadMin: 100,
velocidadMax: 300
```

---

## 🛠️ **SOLUCIÓN DE PROBLEMAS**

### El emulador no inicia
```bash
# Detener procesos antiguos
pkill -9 -f emulator

# Reiniciar emulador
~/Library/Android/sdk/emulator/emulator -avd POPPO_Bot -no-audio &
```

### ADB no encuentra el emulador
```bash
# Reiniciar ADB
adb kill-server
adb start-server
adb devices
```

### POPPO no se abre
```bash
# Abrir con launcher
adb shell monkey -p com.baitu.qingshu -c android.intent.category.LAUNCHER 1

# O abrir manualmente en el emulador
# (busca el ícono de POPPO)
```

### Las coordenadas no funcionan
```bash
# Usar el script de coordenadas
npm run coordenadas

# Tocar el botón varias veces
# Anotar las coordenadas promedio
# Actualizar bot-emulador-adb.js
```

### El bot hace taps pero no en el botón correcto
- Verifica que estés en una **batalla activa**
- El botón de la flor debe estar **visible**
- Ajusta las coordenadas con `npm run coordenadas`
- Prueba con `npm run probar-tap`

---

## 🎉 **VENTAJAS vs NAVEGADOR**

| Característica | Emulador Android | Navegador Web |
|----------------|------------------|---------------|
| Detección | ❌ Casi imposible | ✅ Fácil de detectar |
| Bloqueos de URL | ❌ No hay | ✅ Frecuentes |
| Taps nativos | ✅ Sí | ❌ No (clicks) |
| Headers sospechosos | ❌ No | ✅ Sí |
| Webdriver | ❌ No existe | ✅ Detectable |
| Rendimiento | ⚡ Rápido | 🐌 Más lento |

---

## 📊 **ESTADÍSTICAS EN TIEMPO REAL**

El bot muestra:

```
╔═══════════════════════════════════════════════╗
║  🎯 RÁFAGA #5
║  📊 OBJETIVO: 1,237 TAPS RÁPIDOS
╚═══════════════════════════════════════════════╝

   ⚡ Progreso: 200/1,237 taps (16%)
   ⚡ Progreso: 400/1,237 taps (32%)
   ...

✅ RÁFAGA COMPLETADA:
   ✓ 1,237 taps ejecutados
   ✓ Duración: 89.3 segundos
   ✓ Velocidad: 13.9 taps/segundo

💤 DESCANSO: 8.4 segundos antes de la siguiente ráfaga...

╔═══════════════════════════════════════════════╗
║  📊 ESTADÍSTICAS GENERALES
╚═══════════════════════════════════════════════╝
   Total taps: 6,184
   Ráfagas completadas: 5
   Promedio por ráfaga: 1,237 taps
   Tiempo activo: 9m 23s
   Velocidad promedio: 660.2 taps/min
```

---

## 🎯 **WORKFLOW COMPLETO**

```bash
# 1. Iniciar emulador
~/Library/Android/sdk/emulator/emulator -avd POPPO_Bot -no-audio &

# 2. Esperar 30-60 segundos

# 3. Abrir POPPO
adb shell monkey -p com.baitu.qingshu 1

# 4. En el emulador:
#    - Iniciar sesión
#    - Ir a batalla

# 5. Encontrar coordenadas del botón
npm run coordenadas
# Tocar el botón varias veces
# Copiar coordenadas
# Ctrl+C para salir

# 6. Editar bot-emulador-adb.js
#    - Pegar coordenadas en buttonX y buttonY

# 7. Probar coordenadas
npm run probar-tap

# 8. Si funciona, ejecutar bot
npm run emulador

# 9. ¡LISTO! El bot está haciendo taps automáticos
```

---

## 🔐 **POR QUÉ ES MÁS SEGURO**

1. **Taps nativos de Android**: El sistema operativo Android procesa los eventos táctiles como si fueran de un dedo real
2. **Sin JavaScript detectable**: No hay código ejecutándose en el navegador
3. **Sin webdriver**: No existe `navigator.webdriver` porque no es web
4. **Headers normales**: La app usa conexiones nativas, no HTTP modificado
5. **APK oficial**: Usamos la app oficial de POPPO, sin modificar

---

**¡TODO CONFIGURADO Y LISTO PARA USAR!** 🚀📱⚡

Tu bot profesional con taps nativos está completo. Es la solución más avanzada y difícil de detectar.

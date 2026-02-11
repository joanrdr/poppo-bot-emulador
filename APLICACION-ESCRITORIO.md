# 🖥️ POPPO Bot - Aplicación de Escritorio

## 🎉 ¡APLICACIÓN GRÁFICA COMPLETA!

Ahora tienes una **interfaz visual** profesional para controlar todo el bot desde una ventana de aplicación.

---

## 🚀 EJECUTAR LA APLICACIÓN

### Opción 1: Ejecutar Directamente
```bash
cd /Users/joanrodriguez/taptap
npm start
```

Se abrirá una ventana con la interfaz gráfica completa.

---

## 🎨 CARACTERÍSTICAS DE LA INTERFAZ

### 📊 Panel de Control
- **Configuración de URL** - Cambia de participante fácilmente
- **Ráfagas de Clicks** - Ajusta mínimo y máximo (300-1400)
- **Pausas** - Configura descansos (4-15 segundos)
- **Velocidad** - Controla delay entre clicks (60-200ms)
- **Modo Oculto** - Checkbox para navegador invisible

### 📈 Estadísticas en Tiempo Real
- **Estado** - Activo/Detenido con indicador visual
- **Total Clicks** - Contador en vivo
- **Ráfagas Completadas** - Cuántas ráfagas se han hecho
- **Velocidad** - Clicks por minuto

### 📝 Registro de Actividad
- **Log en vivo** - Todos los mensajes del bot
- **Colores** - Info (azul), Éxito (verde), Advertencia (naranja), Error (rojo)
- **Scroll automático** - Siempre ves lo último

### 🎮 Controles
- **Botón Iniciar** - Empieza el bot con tu configuración
- **Botón Detener** - Para el bot en cualquier momento

---

## ⚙️ CÓMO USAR

### 1. Ejecuta la aplicación
```bash
npm start
```

### 2. Configura los parámetros

**URL del Participante:**
```
https://www.poppo.com/@8712783/live
```

**Cantidad de Clicks por Ráfaga:**
- Mínimo: `300`
- Máximo: `1400`

**Tiempo de Descanso (segundos):**
- Mínimo: `4`
- Máximo: `15`

**Delay entre Clicks (milisegundos):**
- Mínimo: `60`
- Máximo: `200`

**Modo Oculto:**
- ☐ Desactivado (puedes ver el navegador)
- ☑ Activado (navegador invisible)

### 3. Presiona "⚡ Iniciar Bot"

El bot:
1. Abrirá el navegador (o no, si activaste modo oculto)
2. Esperará 20 segundos para que vayas a la batalla
3. Empezará a hacer ráfagas automáticamente
4. Mostrará todo en el log

### 4. Observa las Estadísticas

En tiempo real verás:
- Cuántos clicks lleva
- Cuántas ráfagas ha completado
- Velocidad en clicks/minuto

### 5. Para Detenerlo

Presiona "⏹ Detener Bot" en cualquier momento

---

## 🎯 EJEMPLOS DE CONFIGURACIÓN

### ⚡ Ultra Rápido (Agresivo)
```
Clicks: 800-1400
Pausas: 4-8 segundos
Velocidad: 60-150ms
```

### ⚖️ Balanceado (Recomendado)
```
Clicks: 300-1400
Pausas: 4-15 segundos
Velocidad: 60-200ms
```

### 🐢 Conservador (Más Seguro)
```
Clicks: 200-800
Pausas: 8-20 segundos
Velocidad: 100-300ms
```

---

## 🏗️ CREAR APLICACIÓN INSTALABLE

### Para Mac:
```bash
npm run build-mac
```

Generará una aplicación `.app` en la carpeta `dist/` que puedes:
- Arrastrar a tu carpeta Aplicaciones
- Abrir como cualquier app de Mac
- Agregar al Dock

### Para Windows:
```bash
npm run build-win
```

Generará un instalador `.exe`

### Para Todos:
```bash
npm run build-all
```

Genera para Mac, Windows y Linux

---

## 📁 ARCHIVOS DE LA APLICACIÓN

- `electron-main.js` - Proceso principal de Electron
- `electron-ui.html` - Interfaz gráfica
- `bot-electron.js` - Bot adaptado para Electron

---

## 🎨 DISEÑO

- **Tema Oscuro** - Gradientes azul/morado profesional
- **Estadísticas en Tarjetas** - Visuales y fáciles de leer
- **Log Colorizado** - Diferentes colores según tipo de mensaje
- **Responsive** - Se adapta al tamaño de la ventana
- **Animaciones** - Indicador de estado pulsante

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### La aplicación no inicia
```bash
npm install
npm start
```

### El bot no encuentra el botón
- Asegúrate de ir a una batalla ACTIVA
- El botón debe ser visible
- Espera los 20 segundos completos

### Quiero cambiar la configuración en medio de ejecución
- Detén el bot primero
- Cambia los parámetros
- Inicia de nuevo

---

## 🎉 VENTAJAS DE LA APLICACIÓN

✅ **Interfaz Visual** - No más terminal
✅ **Configuración Fácil** - Sliders y campos de texto
✅ **Estadísticas en Vivo** - Ves todo en tiempo real
✅ **Log Colorizado** - Fácil de entender
✅ **Instalable** - Puedes crear .app para Mac
✅ **Profesional** - Diseño moderno y elegante

---

## 📸 VISTA PREVIA

```
┌─────────────────────────────────────────────────┐
│ 🌸 POPPO Bot Ultra Turbo                       │
├──────────────┬──────────────────────────────────┤
│ CONFIG       │ ┌──────┬──────┬──────┬──────┐   │
│              │ │Estado│Clicks│Ráfagas│CPM  │   │
│ URL          │ └──────┴──────┴──────┴──────┘   │
│ ┌──────────┐ │                                  │
│ │ @8712783 │ │ ┌─────────────────────────────┐ │
│ └──────────┘ │ │ Registro de Actividad      │ │
│              │ │                             │ │
│ CLICKS       │ │ [LOG COLORIZADO AQUÍ]      │ │
│ Min: 300     │ │                             │ │
│ Max: 1400    │ │                             │ │
│              │ └─────────────────────────────┘ │
│ PAUSAS       │                                  │
│ Min: 4s      │                                  │
│ Max: 15s     │                                  │
│              │                                  │
│ ┌──────────┐ │                                  │
│ │ INICIAR  │ │                                  │
│ └──────────┘ │                                  │
└──────────────┴──────────────────────────────────┘
```

---

**¡EJECUTA `npm start` Y DISFRUTA DE TU APLICACIÓN DE ESCRITORIO!** 🚀🖥️✨

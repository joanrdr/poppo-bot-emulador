# 🚀 INSTRUCCIONES - BOT POPPO

## ⚠️ IMPORTANTE: DEBES EJECUTARLO EN TU TERMINAL

El bot **NO puede funcionar** si se ejecuta desde Claude Code en background porque:
- ❌ No puede ver la pantalla
- ❌ No puede iniciar sesión por ti
- ❌ No puede navegar a la batalla

**DEBES ejecutarlo TÚ en tu terminal para que funcione.**

---

## 📋 PASOS EXACTOS PARA EJECUTAR:

### 1️⃣ Abre Terminal

Abre **Terminal.app** (o iTerm2 si lo usas)

### 2️⃣ Navega al directorio

```bash
cd /Users/joanrodriguez/taptap
```

### 3️⃣ Ejecuta el bot

```bash
npm start
```

### 4️⃣ Se abrirá Chrome

El bot abrirá una ventana de Chrome y verás:

```
╔════════════════════════════════════════════════════╗
║  ESPERANDO 20 SEGUNDOS...                         ║
║  Ve a una batalla (PK mode) ACTIVA ahora          ║
╚════════════════════════════════════════════════════╝

   20 segundos restantes...
```

### 5️⃣ Durante esos 20 segundos:

**EN EL NAVEGADOR CHROME QUE SE ABRIÓ:**

1. **Inicia sesión** en POPPO (si no estás logueado)
2. **Ve a una transmisión** con batalla activa (PK mode)
3. **Espera** a que termine la cuenta regresiva

### 6️⃣ El bot empezará automáticamente

Verás:

```
🔍 Buscando botón en LADO IZQUIERDO...
✓ BOTÓN ENCONTRADO (LADO IZQUIERDO):
  Clase: float-btn-flower
  Posición: (216, 828) ← IZQUIERDA

🎯 Click en botón izquierdo...
✅ Click #1 en lado IZQUIERDO
```

### 7️⃣ Verifica visualmente

**EN EL NAVEGADOR:**
- Verás un **BORDE VERDE** en el botón que el bot encontró
- **VERIFICA** que es la florecita redonda del lado izquierdo
- Si es correcta, el bot empezará a clickear automáticamente

---

## ❌ SI NO ENCUENTRA EL BOTÓN:

Si ves:
```
❌ No encontrado (1/10)
```

**Causas comunes:**
1. ❌ No estás en una **batalla ACTIVA**
2. ❌ No has **iniciado sesión**
3. ❌ El botón no es **visible** aún

**Solución:**
- Presiona `Ctrl+C` para detener
- Asegúrate de estar en una batalla activa
- Ejecuta `npm start` de nuevo

---

## 🎯 SI EL BORDE VERDE ESTÁ EN EL BOTÓN EQUIVOCADO:

Si el borde verde aparece en el botón del menú de regalos (lado derecho) en lugar de la florecita de batalla:

1. Presiona `Ctrl+C` para detener
2. Toma un screenshot y dime dónde está el borde verde
3. Ajustaré los filtros del bot

---

## 📊 DURANTE LA EJECUCIÓN:

El bot mostrará estadísticas:

```
━━━ Click #25 ━━━
✅ Click #25 en lado IZQUIERDO

📊 STATS:
  Clicks: 25
  CPM: 18.5
```

---

## 🛑 DETENER EL BOT:

Presiona `Ctrl+C` en la terminal

---

## 🔧 SOLUCIÓN DE PROBLEMAS:

### Error: "browser is already running"

**Solución:**
```bash
pkill -9 Chrome
sleep 3
npm start
```

### No encuentra el botón después de 10 intentos

**Solución:**
1. Verifica que estés EN UNA BATALLA ACTIVA (PK mode)
2. El botón debe ser redondo, con florecita, lado izquierdo
3. Si no lo ves tú, el bot tampoco lo ve

### El bot clickea pero no genera puntos

**Solución:**
1. Detén el bot (Ctrl+C)
2. Mira dónde está el BORDE VERDE
3. Si está en el lugar equivocado, avísame para ajustar

---

## ✅ CONFIRMACIÓN DE QUE FUNCIONA:

Sabrás que funciona cuando:
- ✅ Ves el BORDE VERDE en la florecita correcta (lado izquierdo)
- ✅ El bot dice "Click #N en lado IZQUIERDO"
- ✅ **GENERAS PUNTOS en la batalla** cada vez que clickea

---

## 🆘 AYUDA:

Si tienes problemas, dime:
1. ¿Qué mensaje ves en la terminal?
2. ¿Ves el borde verde? ¿Dónde está?
3. ¿Estás en una batalla activa?
4. ¿El bot clickea pero no genera puntos?

---

**¡EJECUTA `npm start` EN TU TERMINAL AHORA!** 🚀

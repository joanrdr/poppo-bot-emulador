// Configuración del bot
export default {
  // URL de la transmisión
  url: 'https://www.poppo.com/@8712783/live',

  // Selectores CSS para encontrar elementos (ajustar según la página real)
  selectors: {
    // SELECTOR EXACTO DEL BOTÓN DE FLORECITA (encontrado por análisis profesional)
    flower: '.float-btn-flower-out, .float-btn-flower, .gift-icon',
    pkBattle: '[class*="pk"], [class*="battle"]',
    liveIndicator: '[class*="live"], .live-status'
  },

  // Configuración de humanización
  humanization: {
    // Delays entre clics (milisegundos)
    clickDelay: {
      min: 800,      // Mínimo delay entre clics
      max: 2500,     // Máximo delay entre clics
      mean: 1500,    // Media de la distribución normal
      stdDev: 400    // Desviación estándar
    },

    // Movimiento del mouse
    mouseMovement: {
      speed: 'medium',           // slow, medium, fast
      bezierCurve: true,         // Usar curvas bezier naturales
      overshootChance: 0.15,     // 15% de veces se pasa y corrige
      jitterAmount: 5,           // Píxeles de variación en posición
      idleMovements: true,       // Movimientos aleatorios cuando idle
      idleInterval: [8000, 15000] // Intervalo de movimientos idle
    },

    // Duración del clic
    clickDuration: {
      min: 50,
      max: 150,
      mean: 80
    },

    // Pausas aleatorias (simular distracción humana)
    randomPauses: {
      enabled: true,
      chance: 0.08,              // 8% de chance cada iteración
      duration: [3000, 12000]    // Entre 3-12 segundos
    },

    // Simulación de fatiga (se hace más lento con el tiempo)
    fatigue: {
      enabled: true,
      increaseDelayAfter: 100,   // Después de N clics
      maxDelayIncrease: 500      // Aumenta hasta 500ms extra
    },

    // Variación en precisión (a veces no clica exacto en el centro)
    accuracy: {
      perfectClickChance: 0.70,  // 70% clics perfectos
      maxOffset: 15              // Máximo offset del centro
    }
  },

  // Configuración del navegador
  browser: {
    headless: false,              // Cambiar a true para ocultar ventana
    viewport: {
      width: 1920,
      height: 1080
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  },

  // Logging
  logging: {
    enabled: true,
    showTimestamps: true,
    showStats: true,
    statsInterval: 30000         // Mostrar stats cada 30 segundos
  }
};

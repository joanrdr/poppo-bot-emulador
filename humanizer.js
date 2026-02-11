/**
 * Módulo de humanización avanzada
 * Simula comportamiento humano realista para evitar detección
 */

// Genera número aleatorio con distribución normal (campana de Gauss)
export function normalRandom(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Evitar log(0)
  while (v === 0) v = Math.random();

  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.round(num * stdDev + mean);
}

// Genera delay humanizado basado en configuración
export function humanDelay(config) {
  const { min, max, mean, stdDev } = config;
  let delay = normalRandom(mean, stdDev);

  // Asegurar que está en rango
  delay = Math.max(min, Math.min(max, delay));

  // Ocasionalmente agregar un delay extra (distracción)
  if (Math.random() < 0.05) {
    delay += normalRandom(500, 200);
  }

  return delay;
}

// Genera curva de Bezier para movimiento natural del mouse
export function generateBezierCurve(start, end, numSteps = 20) {
  const points = [];

  // Puntos de control aleatorios para la curva
  const cp1 = {
    x: start.x + (end.x - start.x) * (0.25 + Math.random() * 0.25),
    y: start.y + (end.y - start.y) * (Math.random() * 0.5 - 0.25)
  };

  const cp2 = {
    x: start.x + (end.x - start.x) * (0.5 + Math.random() * 0.25),
    y: start.y + (end.y - start.y) * (0.75 + Math.random() * 0.5)
  };

  // Generar puntos en la curva de Bezier cúbica
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    points.push({
      x: start.x * mt3 + 3 * cp1.x * mt2 * t + 3 * cp2.x * mt * t2 + end.x * t3,
      y: start.y * mt3 + 3 * cp1.y * mt2 * t + 3 * cp2.y * mt * t2 + end.y * t3
    });
  }

  return points;
}

// Mueve el mouse de forma natural usando curvas de Bezier
export async function humanMouseMove(page, targetX, targetY, config) {
  const currentPosition = await page.evaluate(() => {
    return { x: window.mouseX || window.innerWidth / 2, y: window.mouseY || window.innerHeight / 2 };
  });

  // Generar curva
  const curve = generateBezierCurve(currentPosition, { x: targetX, y: targetY });

  // Simular overshoot (pasar de largo y corregir)
  const shouldOvershoot = Math.random() < config.overshootChance;
  if (shouldOvershoot) {
    const overshootX = targetX + (Math.random() - 0.5) * 30;
    const overshootY = targetY + (Math.random() - 0.5) * 30;
    curve.push({ x: overshootX, y: overshootY });
    curve.push({ x: targetX, y: targetY });
  }

  // Mover por la curva con velocidad variable
  for (let i = 0; i < curve.length; i++) {
    const point = curve[i];

    // Agregar jitter (temblor natural)
    const jitterX = (Math.random() - 0.5) * config.jitterAmount;
    const jitterY = (Math.random() - 0.5) * config.jitterAmount;

    await page.mouse.move(
      point.x + jitterX,
      point.y + jitterY
    );

    // Delay variable (más rápido al principio, más lento al final)
    const progress = i / curve.length;
    const delay = 5 + progress * 10 + Math.random() * 5;
    await sleep(delay);
  }

  // Guardar posición actual
  await page.evaluate((x, y) => {
    window.mouseX = x;
    window.mouseY = y;
  }, targetX, targetY);
}

// Click humanizado
export async function humanClick(page, element, config) {
  try {
    // Obtener posición del elemento
    const box = await element.boundingBox();
    if (!box) return false;

    // Calcular posición del click
    let clickX = box.x + box.width / 2;
    let clickY = box.y + box.height / 2;

    // Agregar imprecisión ocasional
    if (Math.random() > config.accuracy.perfectClickChance) {
      const offsetX = (Math.random() - 0.5) * config.accuracy.maxOffset;
      const offsetY = (Math.random() - 0.5) * config.accuracy.maxOffset;
      clickX += offsetX;
      clickY += offsetY;
    }

    // Mover mouse de forma natural
    await humanMouseMove(page, clickX, clickY, config.mouseMovement);

    // Duración del click (tiempo presionando)
    const clickDuration = normalRandom(
      config.clickDuration.mean,
      (config.clickDuration.max - config.clickDuration.min) / 6
    );

    // Click con duración natural
    await page.mouse.down();
    await sleep(Math.max(config.clickDuration.min, Math.min(config.clickDuration.max, clickDuration)));
    await page.mouse.up();

    return true;
  } catch (error) {
    console.error('Error en humanClick:', error.message);
    return false;
  }
}

// Movimiento aleatorio del mouse cuando está idle
export async function idleMouseMovement(page, config) {
  if (!config.mouseMovement.idleMovements) return;

  const viewport = await page.viewport();

  // Posición aleatoria en la pantalla
  const targetX = Math.random() * viewport.width;
  const targetY = Math.random() * viewport.height;

  await humanMouseMove(page, targetX, targetY, config.mouseMovement);
}

// Pausa aleatoria (simula distracción)
export async function randomPause(config) {
  if (!config.randomPauses.enabled) return;

  if (Math.random() < config.randomPauses.chance) {
    const duration =
      config.randomPauses.duration[0] +
      Math.random() * (config.randomPauses.duration[1] - config.randomPauses.duration[0]);

    console.log(`💭 Pausa humana: ${Math.round(duration / 1000)}s`);
    await sleep(duration);
  }
}

// Sleep mejorado
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calcula delay con fatiga
export function calculateDelayWithFatigue(baseConfig, clickCount, fatigueConfig) {
  if (!fatigueConfig.enabled || clickCount < fatigueConfig.increaseDelayAfter) {
    return humanDelay(baseConfig);
  }

  // Aumentar delay gradualmente
  const fatigueProgress = Math.min(
    (clickCount - fatigueConfig.increaseDelayAfter) / 100,
    1
  );

  const fatigueDelay = fatigueProgress * fatigueConfig.maxDelayIncrease;

  return humanDelay(baseConfig) + fatigueDelay;
}

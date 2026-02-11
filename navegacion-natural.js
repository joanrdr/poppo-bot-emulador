/**
 * NAVEGACIÓN NATURAL - Anti-Detección
 * Navega como humano usando el ID del perfil
 */

class NavegacionNatural {
  constructor(page) {
    this.page = page;
  }

  // Extraer ID de la URL
  extraerID(url) {
    const match = url.match(/@(\d+)/);
    return match ? match[1] : null;
  }

  // Sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ESTRATEGIA 1: Ir directo pero con delays naturales
  async estrategia1_DirectoConDelays(userId) {
    console.log('📍 Estrategia 1: Navegación directa con delays');

    // Primero ir a la home de POPPO
    await this.page.goto('https://www.poppo.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En página principal');
    await this.sleep(2000 + Math.random() * 3000);

    // Luego navegar al perfil del usuario
    await this.page.goto(`https://www.poppo.com/@${userId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En perfil del usuario');
    await this.sleep(3000 + Math.random() * 2000);

    // Finalmente ir al live
    await this.page.goto(`https://www.poppo.com/@${userId}/live`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En transmisión en vivo');
    return true;
  }

  // ESTRATEGIA 2: Buscar el usuario y clickear
  async estrategia2_BuscarYClickear(userId) {
    console.log('📍 Estrategia 2: Buscar usuario y navegar');

    // Ir a la home
    await this.page.goto('https://www.poppo.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En página principal');
    await this.sleep(2000 + Math.random() * 2000);

    // Intentar buscar el ID en la barra de búsqueda (si existe)
    const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');

    if (searchInput) {
      console.log('✓ Campo de búsqueda encontrado');

      // Escribir el ID de forma natural (letra por letra)
      await searchInput.click();
      await this.sleep(500);

      for (const char of userId) {
        await searchInput.type(char);
        await this.sleep(100 + Math.random() * 200);
      }

      await this.sleep(1000);
      await this.page.keyboard.press('Enter');
      await this.sleep(3000);
    }

    // Navegar al perfil
    await this.page.goto(`https://www.poppo.com/@${userId}/live`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En transmisión en vivo');
    return true;
  }

  // ESTRATEGIA 3: Usar URL de perfil primero
  async estrategia3_PerfilPrimero(userId) {
    console.log('📍 Estrategia 3: Perfil → Live');

    // Ir directo al perfil (no al live)
    await this.page.goto(`https://www.poppo.com/@${userId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En perfil del usuario');
    await this.sleep(3000 + Math.random() * 2000);

    // Buscar botón de "LIVE" o similar
    const liveButton = await this.page.$('button[class*="live"], a[href*="/live"], [class*="live-btn"]').catch(() => null);

    if (liveButton) {
      console.log('✓ Botón LIVE encontrado, clickeando...');
      await liveButton.click();
      await this.sleep(3000);
    } else {
      // Si no hay botón, navegar directamente
      await this.page.goto(`https://www.poppo.com/@${userId}/live`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    }

    console.log('✓ En transmisión en vivo');
    return true;
  }

  // ESTRATEGIA 4: Simular clicks de navegación
  async estrategia4_SimularClicks(userId) {
    console.log('📍 Estrategia 4: Simulación completa de navegación');

    // Ir a home
    await this.page.goto('https://www.poppo.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En página principal');
    await this.sleep(2000);

    // Simular scroll
    await this.page.evaluate(() => {
      window.scrollTo(0, 300 + Math.random() * 200);
    });
    await this.sleep(1000);

    // Navegar al perfil
    await this.page.goto(`https://www.poppo.com/@${userId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En perfil');
    await this.sleep(2000);

    // Simular scroll en perfil
    await this.page.evaluate(() => {
      window.scrollTo(0, 200 + Math.random() * 100);
    });
    await this.sleep(1500);

    // Ir al live
    await this.page.goto(`https://www.poppo.com/@${userId}/live`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✓ En transmisión en vivo');
    return true;
  }

  // NAVEGACIÓN INTELIGENTE - Elige estrategia aleatoria
  async navegarConID(url) {
    const userId = this.extraerID(url);

    if (!userId) {
      console.log('❌ No se pudo extraer ID de la URL');
      // Fallback: navegar directo
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      return true;
    }

    console.log(`\n╔═══════════════════════════════════════════════╗`);
    console.log(`║  🔐 NAVEGACIÓN ANTI-DETECCIÓN`);
    console.log(`║  ID Usuario: ${userId}`);
    console.log(`╚═══════════════════════════════════════════════╝\n`);

    // Elegir estrategia aleatoria
    const estrategias = [
      this.estrategia1_DirectoConDelays.bind(this),
      this.estrategia3_PerfilPrimero.bind(this),
      this.estrategia4_SimularClicks.bind(this)
    ];

    const estrategiaElegida = estrategias[Math.floor(Math.random() * estrategias.length)];

    try {
      await estrategiaElegida(userId);
      return true;
    } catch (error) {
      console.log(`⚠️  Error en navegación: ${error.message}`);
      console.log('🔄 Intentando navegación directa...');

      // Fallback: navegar directo
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      return true;
    }
  }

  // Configurar headers más realistas
  async configurarHeadersNaturales() {
    // User agents realistas de Mac
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0'
    ];

    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    await this.page.setUserAgent(userAgent);

    // Configurar headers extra
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    console.log('✓ Headers configurados');
  }

  // Simular comportamiento humano antes de empezar
  async comportamientoPreBatalla() {
    console.log('🎭 Simulando comportamiento humano...');

    // Mover mouse aleatoriamente
    const width = await this.page.evaluate(() => window.innerWidth);
    const height = await this.page.evaluate(() => window.innerHeight);

    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      await this.page.mouse.move(x, y);
      await this.sleep(500 + Math.random() * 1000);
    }

    // Scroll aleatorio
    await this.page.evaluate(() => {
      window.scrollTo(0, Math.random() * 300);
    });

    await this.sleep(1000);

    console.log('✓ Comportamiento humano simulado');
  }
}

module.exports = { NavegacionNatural };

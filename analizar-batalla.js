/**
 * ANALIZADOR PROFESIONAL DE ELEMENTOS CLICKEABLES EN POPPO
 * Encuentra el botón EXACTO de la florecita en batalla
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

puppeteer.use(StealthPlugin());

const ANALISIS_PROFUNDO = async () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔬 ANÁLISIS PROFESIONAL DE BATALLA POPPO');
  console.log('═══════════════════════════════════════════════════\n');

  let browser, page;

  try {
    // Abrir la página
    console.log('🌐 Abriendo navegador...');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080'],
      defaultViewport: { width: 1920, height: 1080 }
    });

    page = await browser.newPage();

    console.log('📍 Navegando a POPPO...');
    await page.goto('https://www.poppo.com/@68375648/live', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('\n⏸️  PAUSA: Ve a la batalla (PK mode) y presiona Enter');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('\n🔍 INICIANDO ANÁLISIS PROFUNDO...\n');

    // PASO 1: Analizar TODOS los elementos
    console.log('📊 PASO 1: Catalogando elementos clickeables...\n');

    const todosElementos = await page.evaluate(() => {
      const elementos = [];
      const tags = ['button', 'div', 'span', 'a', 'img', 'svg', 'path'];

      tags.forEach(tag => {
        const found = Array.from(document.querySelectorAll(tag));
        found.forEach((el, index) => {
          // Solo elementos visibles
          if (el.offsetParent === null || el.offsetWidth < 10 || el.offsetHeight < 10) {
            return;
          }

          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          elementos.push({
            index: elementos.length,
            tag: el.tagName,
            id: el.id || '',
            className: el.className ? el.className.toString().substring(0, 100) : '',
            text: el.textContent ? el.textContent.trim().substring(0, 50) : '',
            src: el.src || el.getAttribute('src') || '',
            onClick: !!el.onclick,
            cursor: style.cursor,
            position: {
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              centerX: Math.round(rect.left + rect.width / 2),
              centerY: Math.round(rect.top + rect.height / 2)
            },
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            pointerEvents: style.pointerEvents
          });
        });
      });

      return elementos;
    });

    console.log(`✓ Encontrados ${todosElementos.length} elementos visibles\n`);

    // PASO 2: Filtrar candidatos probables
    console.log('🎯 PASO 2: Filtrando candidatos para botón de batalla...\n');

    const candidatos = todosElementos.filter(el => {
      // Debe ser clickeable
      const isClickeable =
        el.onClick ||
        el.cursor === 'pointer' ||
        el.tag === 'BUTTON' ||
        el.tag === 'A';

      // Debe estar en área de batalla (centro de pantalla)
      const enAreaBatalla =
        el.position.centerX > 300 &&
        el.position.centerX < 1620 &&
        el.position.centerY > 200 &&
        el.position.centerY < 880;

      // Tamaño razonable para botón
      const tamañoRazonable =
        el.position.width >= 30 &&
        el.position.width <= 300 &&
        el.position.height >= 30 &&
        el.position.height <= 300;

      // Keywords sospechosas
      const keywords = ['flower', 'gift', 'pk', 'battle', 'tap', 'click', '花', '送', 'support', 'regalo'];
      const tieneKeyword = keywords.some(k =>
        el.className.toLowerCase().includes(k) ||
        el.text.toLowerCase().includes(k) ||
        el.id.toLowerCase().includes(k) ||
        el.src.toLowerCase().includes(k)
      );

      return (isClickeable || tieneKeyword) && enAreaBatalla && tamañoRazonable;
    });

    console.log(`✓ ${candidatos.length} candidatos potenciales\n`);

    // PASO 3: Ordenar por probabilidad
    console.log('📈 PASO 3: Ranking de candidatos por probabilidad...\n');

    const ranking = candidatos.map(el => {
      let score = 0;

      // Keywords en className (+30 puntos)
      const classKeywords = ['flower', 'gift', 'pk', 'battle', 'support', '花'];
      classKeywords.forEach(k => {
        if (el.className.toLowerCase().includes(k)) score += 30;
      });

      // Es button o tiene onClick (+20 puntos)
      if (el.tag === 'BUTTON' || el.onClick) score += 20;

      // Cursor pointer (+10 puntos)
      if (el.cursor === 'pointer') score += 10;

      // Tamaño ideal 40-120px (+15 puntos)
      if (el.position.width >= 40 && el.position.width <= 120) score += 15;

      // Cerca del centro (+10 puntos)
      const distanciaCentro = Math.abs(el.position.centerX - 960) + Math.abs(el.position.centerY - 540);
      if (distanciaCentro < 400) score += 10;

      // Tiene imagen (+20 puntos)
      if (el.src) score += 20;

      // zIndex alto (encima de otros) (+5 puntos)
      if (parseInt(el.zIndex) > 100) score += 5;

      return { ...el, score };
    });

    ranking.sort((a, b) => b.score - a.score);

    // Mostrar top 10
    console.log('🏆 TOP 10 CANDIDATOS:\n');
    ranking.slice(0, 10).forEach((el, i) => {
      console.log(`${i + 1}. [Score: ${el.score}] ${el.tag} ${el.className.substring(0, 50)}`);
      console.log(`   Posición: (${el.position.centerX}, ${el.position.centerY})`);
      console.log(`   Texto: "${el.text.substring(0, 30)}"`);
      console.log(`   Cursor: ${el.cursor}, onClick: ${el.onClick}\n`);
    });

    // PASO 4: Marcar elementos en pantalla
    console.log('🎨 PASO 4: Marcando candidatos en pantalla...\n');

    await page.evaluate((candidatos) => {
      // Limpiar marcadores previos
      document.querySelectorAll('.analisis-marker').forEach(m => m.remove());

      candidatos.slice(0, 10).forEach((el, index) => {
        const marker = document.createElement('div');
        marker.className = 'analisis-marker';
        marker.style.cssText = `
          position: fixed;
          left: ${el.position.x}px;
          top: ${el.position.y}px;
          width: ${el.position.width}px;
          height: ${el.position.height}px;
          border: 3px solid ${index === 0 ? 'red' : 'yellow'};
          background: rgba(255, 0, 0, ${index === 0 ? 0.3 : 0.1});
          z-index: 999999;
          pointer-events: none;
          font-size: 20px;
          font-weight: bold;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 2px 2px 4px black;
        `;
        marker.textContent = `#${index + 1}`;
        document.body.appendChild(marker);
      });
    }, ranking);

    // Tomar screenshot
    console.log('📸 Tomando screenshot con marcadores...');
    await page.screenshot({
      path: 'analisis-candidatos.png',
      fullPage: false
    });
    console.log('✓ Screenshot guardado: analisis-candidatos.png\n');

    // PASO 5: Guardar selectores
    console.log('💾 PASO 5: Generando selectores CSS...\n');

    const selectores = await page.evaluate((candidatos) => {
      return candidatos.slice(0, 10).map(el => {
        const elements = Array.from(document.querySelectorAll(el.tag));
        const element = elements.find(e => {
          const rect = e.getBoundingClientRect();
          return Math.abs(rect.left - el.position.x) < 5 &&
                 Math.abs(rect.top - el.position.y) < 5;
        });

        if (!element) return null;

        // Generar selector único
        let selector = el.tag.toLowerCase();

        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && el.className.split(' ').length > 0) {
          const classes = el.className.split(' ').filter(c => c.length > 0);
          if (classes.length > 0) {
            selector = `${el.tag.toLowerCase()}.${classes.join('.')}`;
          }
        }

        return {
          rank: candidatos.indexOf(el) + 1,
          selector: selector,
          xpath: getXPath(element)
        };

        function getXPath(element) {
          if (element.id) return `//*[@id="${element.id}"]`;
          if (element === document.body) return '/html/body';

          let ix = 0;
          const siblings = element.parentNode?.childNodes || [];
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
              return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
              ix++;
            }
          }
        }
      }).filter(s => s !== null);
    }, ranking);

    console.log('📝 SELECTORES GENERADOS:\n');
    selectores.forEach(s => {
      console.log(`Rank #${s.rank}:`);
      console.log(`  CSS: ${s.selector}`);
      console.log(`  XPath: ${s.xpath}\n`);
    });

    // Guardar reporte
    const reporte = {
      fecha: new Date().toISOString(),
      totalElementos: todosElementos.length,
      candidatos: candidatos.length,
      top10: ranking.slice(0, 10),
      selectores: selectores
    };

    await fs.writeFile('reporte-analisis.json', JSON.stringify(reporte, null, 2));
    console.log('✓ Reporte guardado: reporte-analisis.json\n');

    // PASO 6: Prueba interactiva
    console.log('🧪 PASO 6: Prueba interactiva de candidatos...\n');
    console.log('Voy a clickear el TOP 1 candidato en 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (ranking.length > 0) {
      const topCandidate = ranking[0];
      console.log(`\n🎯 Clickeando: ${topCandidate.tag}.${topCandidate.className.substring(0, 30)}`);

      await page.mouse.click(topCandidate.position.centerX, topCandidate.position.centerY);
      console.log('✓ Click ejecutado\n');

      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('❓ ¿Generó puntos? Observa la pantalla.\n');
      console.log('Si NO funcionó, probaremos el siguiente candidato.');
      console.log('Presiona Enter para probar el candidato #2...');

      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      // Probar candidato #2
      if (ranking.length > 1) {
        const segundo = ranking[1];
        console.log(`\n🎯 Clickeando candidato #2: ${segundo.tag}.${segundo.className.substring(0, 30)}`);
        await page.mouse.click(segundo.position.centerX, segundo.position.centerY);
        console.log('✓ Click ejecutado\n');
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ ANÁLISIS COMPLETADO');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📁 Archivos generados:');
    console.log('  - analisis-candidatos.png (screenshot con marcadores)');
    console.log('  - reporte-analisis.json (datos completos)\n');

    console.log('🎯 SIGUIENTE PASO:');
    console.log('  Revisa cual candidato (#1, #2, etc) generó puntos');
    console.log('  y dime el número para actualizar el bot.\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n⏸️  Presiona Enter para cerrar...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    if (browser) {
      await browser.close();
    }
  }
};

// Ejecutar
ANALISIS_PROFUNDO();

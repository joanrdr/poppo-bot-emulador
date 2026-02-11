/**
 * ANALIZADOR AUTOMÁTICO - SIN INTERACCIÓN
 * Analiza la batalla automáticamente después de 15 segundos
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';
import chalk from 'chalk';

puppeteer.use(StealthPlugin());

const ANALISIS_AUTO = async () => {
  console.log(chalk.cyan('═══════════════════════════════════════════════════'));
  console.log(chalk.cyan('🔬 ANALIZADOR AUTOMÁTICO DE BATALLA POPPO'));
  console.log(chalk.cyan('═══════════════════════════════════════════════════\n'));

  let browser, page;

  try {
    console.log(chalk.yellow('🌐 Abriendo navegador...'));
    browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080'],
      defaultViewport: { width: 1920, height: 1080 }
    });

    page = await browser.newPage();

    console.log(chalk.yellow('📍 Navegando a POPPO...'));
    await page.goto('https://www.poppo.com/@68375648/live', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log(chalk.green('✓ Página cargada\n'));
    console.log(chalk.yellow('⏰ Esperando 15 segundos para que vayas a la batalla...'));
    console.log(chalk.gray('   (Ve al modo PK/Batalla ahora)\n'));

    // Esperar 15 segundos
    for (let i = 15; i > 0; i--) {
      process.stdout.write(`\r${chalk.yellow(`   ${i} segundos restantes...`)}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n');

    console.log(chalk.cyan('🔍 INICIANDO ANÁLISIS PROFUNDO...\n'));

    // Tomar screenshot inicial
    await page.screenshot({ path: 'analisis-antes.png' });
    console.log(chalk.green('✓ Screenshot inicial guardado\n'));

    // ANÁLISIS COMPLETO
    console.log(chalk.yellow('📊 Catalogando elementos clickeables...\n'));

    const analisis = await page.evaluate(() => {
      const resultados = {
        elementos: [],
        info: {
          url: window.location.href,
          title: document.title,
          hasVideo: document.querySelector('video') !== null,
          bodyText: document.body.innerText.substring(0, 300)
        }
      };

      // Buscar TODOS los elementos clickeables
      const tags = ['button', 'div', 'span', 'a', 'img', 'svg'];
      const todosElementos = [];

      tags.forEach(tag => {
        const found = Array.from(document.querySelectorAll(tag));
        found.forEach(el => {
          // Solo elementos visibles y con tamaño razonable
          if (el.offsetParent === null || el.offsetWidth < 20 || el.offsetHeight < 20) {
            return;
          }

          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          // Información completa del elemento
          const info = {
            tag: el.tagName,
            id: el.id || '',
            className: el.className ? el.className.toString() : '',
            text: el.textContent ? el.textContent.trim().substring(0, 100) : '',
            src: el.src || el.getAttribute('src') || el.getAttribute('xlink:href') || '',
            dataAttrs: {},
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
            opacity: style.opacity,
            pointerEvents: style.pointerEvents
          };

          // Capturar data-* attributes
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              info.dataAttrs[attr.name] = attr.value;
            }
          });

          todosElementos.push(info);
        });
      });

      resultados.elementos = todosElementos;
      return resultados;
    });

    console.log(chalk.green(`✓ ${analisis.elementos.length} elementos encontrados\n`));
    console.log(chalk.gray('📄 Info de página:'));
    console.log(chalk.gray(`   URL: ${analisis.info.url}`));
    console.log(chalk.gray(`   Video: ${analisis.info.hasVideo ? 'SÍ' : 'NO'}\n`));

    // FILTRAR Y RANKEAR
    console.log(chalk.yellow('🎯 Filtrando y rankeando candidatos...\n'));

    const candidatos = analisis.elementos.filter(el => {
      // Debe ser clickeable o tener keywords
      const isClickeable =
        el.onClick ||
        el.cursor === 'pointer' ||
        el.tag === 'BUTTON' ||
        el.tag === 'A';

      // Área de batalla (centro)
      const enAreaBatalla =
        el.position.centerX > 200 &&
        el.position.centerX < 1720 &&
        el.position.centerY > 150 &&
        el.position.centerY < 930;

      // Keywords importantes
      const keywords = [
        'flower', 'gift', 'pk', 'battle', 'tap', 'click',
        '花', '送', 'support', 'regalo', 'present',
        'vote', 'like', 'heart', 'star'
      ];

      const texto = `${el.className} ${el.text} ${el.id} ${el.src}`.toLowerCase();
      const tieneKeyword = keywords.some(k => texto.includes(k));

      return (isClickeable || tieneKeyword) && enAreaBatalla;
    });

    // Calcular score
    const ranking = candidatos.map(el => {
      let score = 0;

      // Keywords en className (muy importante)
      ['flower', 'gift', 'pk', 'battle', 'support', '花', 'tap'].forEach(k => {
        if (el.className.toLowerCase().includes(k)) score += 40;
      });

      // Keywords en data attributes
      Object.values(el.dataAttrs).forEach(val => {
        if (val && typeof val === 'string') {
          ['flower', 'gift', 'pk'].forEach(k => {
            if (val.toLowerCase().includes(k)) score += 30;
          });
        }
      });

      // Es button o tiene onClick
      if (el.tag === 'BUTTON') score += 25;
      if (el.onClick) score += 20;

      // Cursor pointer
      if (el.cursor === 'pointer') score += 15;

      // Tamaño ideal (40-200px)
      if (el.position.width >= 40 && el.position.width <= 200) score += 20;
      if (el.position.height >= 40 && el.position.height <= 200) score += 20;

      // REDONDO (width ≈ height) - MUY IMPORTANTE
      const aspectRatio = el.position.width / el.position.height;
      if (aspectRatio >= 0.85 && aspectRatio <= 1.15) {
        score += 50; // BONUS GRANDE por ser redondo
      }

      // Cerca del centro vertical
      const distanciaCentroY = Math.abs(el.position.centerY - 540);
      if (distanciaCentroY < 300) score += 15;

      // Tiene imagen
      if (el.src) score += 25;

      // zIndex alto
      if (parseInt(el.zIndex) > 100) score += 10;

      // Opacity 1 (completamente visible)
      if (parseFloat(el.opacity) === 1) score += 5;

      return { ...el, score };
    });

    ranking.sort((a, b) => b.score - a.score);

    console.log(chalk.green(`✓ ${ranking.length} candidatos filtrados\n`));

    // Mostrar TOP 15
    console.log(chalk.cyan('═══════════════════════════════════════════════════'));
    console.log(chalk.cyan('🏆 TOP 15 CANDIDATOS MÁS PROBABLES'));
    console.log(chalk.cyan('═══════════════════════════════════════════════════\n'));

    ranking.slice(0, 15).forEach((el, i) => {
      console.log(chalk.yellow(`━━━ #${i + 1} [Score: ${el.score}] ━━━`));
      console.log(chalk.white(`Tag: ${el.tag}`));
      console.log(chalk.white(`Class: ${el.className.substring(0, 80)}`));
      console.log(chalk.white(`ID: ${el.id || '(sin ID)'}`));
      console.log(chalk.white(`Texto: "${el.text.substring(0, 50)}"`));
      console.log(chalk.white(`Posición: (${el.position.centerX}, ${el.position.centerY})`));
      console.log(chalk.white(`Tamaño: ${el.position.width}x${el.position.height}`));
      console.log(chalk.white(`Cursor: ${el.cursor}, onClick: ${el.onClick}`));
      if (el.src) console.log(chalk.white(`Src: ${el.src.substring(0, 60)}`));
      console.log('');
    });

    // Marcar en pantalla
    console.log(chalk.yellow('🎨 Marcando candidatos en pantalla...\n'));

    await page.evaluate((candidatos) => {
      // Limpiar marcadores previos
      document.querySelectorAll('.analisis-marker').forEach(m => m.remove());

      candidatos.slice(0, 15).forEach((el, index) => {
        const marker = document.createElement('div');
        marker.className = 'analisis-marker';

        // Color según ranking
        let color = 'yellow';
        let bgOpacity = 0.1;
        if (index === 0) { color = 'red'; bgOpacity = 0.4; }
        else if (index === 1) { color = 'orange'; bgOpacity = 0.3; }
        else if (index === 2) { color = 'lime'; bgOpacity = 0.2; }

        marker.style.cssText = `
          position: fixed;
          left: ${el.position.x}px;
          top: ${el.position.y}px;
          width: ${el.position.width}px;
          height: ${el.position.height}px;
          border: 4px solid ${color};
          background: rgba(255, 0, 0, ${bgOpacity});
          z-index: 999999;
          pointer-events: none;
          font-size: 24px;
          font-weight: bold;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 3px 3px 6px black;
        `;
        marker.textContent = `#${index + 1}`;
        document.body.appendChild(marker);
      });
    }, ranking);

    // Screenshot con marcadores
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'analisis-candidatos.png' });
    console.log(chalk.green('✓ Screenshot con marcadores: analisis-candidatos.png\n'));

    // Guardar reporte JSON
    const reporte = {
      fecha: new Date().toISOString(),
      url: analisis.info.url,
      totalElementos: analisis.elementos.length,
      candidatos: ranking.length,
      top15: ranking.slice(0, 15).map(el => ({
        rank: ranking.indexOf(el) + 1,
        score: el.score,
        tag: el.tag,
        className: el.className,
        id: el.id,
        text: el.text.substring(0, 100),
        position: el.position
      }))
    };

    await fs.writeFile('reporte-analisis.json', JSON.stringify(reporte, null, 2));
    console.log(chalk.green('✓ Reporte JSON: reporte-analisis.json\n'));

    // Generar config recomendado
    if (ranking.length > 0) {
      console.log(chalk.cyan('═══════════════════════════════════════════════════'));
      console.log(chalk.cyan('⚙️  CONFIGURACIÓN RECOMENDADA'));
      console.log(chalk.cyan('═══════════════════════════════════════════════════\n'));

      const top3 = ranking.slice(0, 3);
      const selectores = top3.map(el => {
        if (el.id) return `#${el.id}`;
        const classes = el.className.split(' ').filter(c => c.length > 2 && c.length < 50);
        if (classes.length > 0) {
          return `.${classes.join('.')}`;
        }
        return el.tag.toLowerCase();
      });

      console.log(chalk.yellow('Copia esto en config.js:\n'));
      console.log(chalk.white(`selectors: {`));
      console.log(chalk.white(`  flower: '${selectores.join(', ')}'`));
      console.log(chalk.white(`}\n`));
    }

    console.log(chalk.cyan('═══════════════════════════════════════════════════'));
    console.log(chalk.green('✅ ANÁLISIS COMPLETADO'));
    console.log(chalk.cyan('═══════════════════════════════════════════════════\n'));

    console.log(chalk.yellow('📁 Archivos generados:'));
    console.log(chalk.white('  - analisis-antes.png'));
    console.log(chalk.white('  - analisis-candidatos.png (con marcadores numerados)'));
    console.log(chalk.white('  - reporte-analisis.json\n'));

    console.log(chalk.yellow('🔍 Revisa el screenshot:'));
    console.log(chalk.white('  open analisis-candidatos.png\n'));

    console.log(chalk.yellow('📋 SIGUIENTE PASO:'));
    console.log(chalk.white('  1. Abre analisis-candidatos.png'));
    console.log(chalk.white('  2. Mira qué número (#1, #2, #3...) está sobre la florecita correcta'));
    console.log(chalk.white('  3. Dime el número y actualizaré el bot\n'));

    // Esperar 30 segundos antes de cerrar
    console.log(chalk.gray('⏰ Cerrando en 30 segundos...\n'));
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error(chalk.red('❌ ERROR:'), error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
    process.exit(0);
  }
};

// Ejecutar
ANALISIS_AUTO();

// ============================================================
// API · fetch catálogo, reportes y Apps Script
// ============================================================

// ------------------------------------------------------------
// PARSEO CSV
// ------------------------------------------------------------
function parsearCSV(texto) {
  const filas = [];
  let fila = [], campo = '', enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else {
      if (c === '"') enComillas = true;
      else if (c === ',') { fila.push(campo); campo = ''; }
      else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
      else if (c !== '\r') campo += c;
    }
  }
  if (campo.length || fila.length) { fila.push(campo); filas.push(fila); }

  const headers = filas[0].map(h => h.trim().toUpperCase());
  const idx = (name) => headers.indexOf(name);

  return filas.slice(1)
    .filter(f => f.length >= 20 && f[idx('CODIGO')])
    .map(f => ({
      sede: String(f[idx('SEDE')] || '').trim().toUpperCase(),
      codigo: f[idx('CODIGO')] || '',
      categoria: f[idx('CATEGORIA')] || '',
      descripcion: f[idx('DESCRIPCION_CORTA')] || '',
      stock: f[idx('STOCK')] || '',
      precio_usd: num(f[idx('PRECIO_USD')]) || null,
      marca: f[idx('MARCA')] || '',
      tc_real: num(f[idx('TC_REAL')]) || 0,
      tc_ajustado: num(f[idx('TC_AJUSTADO')]) || 0,
      precio_pen: num(f[idx('PRECIO_PEN')]) || null,
      sku: f[idx('SKU')] || '',
      ganancia_base: f[idx('GANANCIA_BASE')] || '',
      ganancia_real: f[idx('GANANCIA_REAL')] || '',
      ganancia_soles: num(f[idx('GANANCIA_SOLES')]) || null,
      valor_venta: num(f[idx('VALOR_VENTA')]) || null,
      igv: num(f[idx('IGV')]) || null,
      precio_publico: num(f[idx('PRECIO_PUBLICO')]) || null
    }))
    .filter(d => !esStockCero(d.stock))
    .filter(d => !esCategoriaExcluida(d.categoria))
    .filter(d => !esMarcaExcluida(d.marca))
    .filter(d => !empiezaConZZ(d.codigo))
    .filter(d => !esPrecioBasura(d.precio_usd))
    .filter(d => d.precio_usd && d.precio_usd > 0);
}

function parsearCSVReportes(texto) {
  const filas = [];
  let fila = [], campo = '', enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else {
      if (c === '"') enComillas = true;
      else if (c === ',') { fila.push(campo); campo = ''; }
      else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
      else if (c !== '\r') campo += c;
    }
  }
  if (campo.length || fila.length) { fila.push(campo); filas.push(fila); }

  if (filas.length < 2) return [];
  const headers = filas[0].map(h => h.trim().toUpperCase());
  return filas.slice(1).filter(f => f.length >= 5).map(f => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = f[i]; });
    return obj;
  });
}

function parsearFechaReporte(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  const s = String(str).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    return new Date(
      parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]),
      parseInt(m[4] || 0), parseInt(m[5] || 0)
    );
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ------------------------------------------------------------
// FILTROS DE CATÁLOGO (exclusiones)
// ------------------------------------------------------------
function esStockCero(stock) {
  if (!stock) return true;
  const s = String(stock).trim();
  return s === '' || s === '0';
}
function esCategoriaExcluida(cat) {
  if (!cat) return false;
  const c = String(cat).trim().toUpperCase();
  return CATEGORIAS_EXCLUIDAS.some(ex => c === ex);
}
function esMarcaExcluida(marca) {
  if (!marca) return false;
  const m = String(marca).trim().toUpperCase();
  return MARCAS_EXCLUIDAS.some(ex => m === ex);
}
function empiezaConZZ(codigo) {
  if (!codigo) return false;
  return String(codigo).trim().toLowerCase().startsWith('zz');
}
function esPrecioBasura(precio) {
  if (!precio) return true;
  return PRECIOS_BASURA.some(p => Math.abs(precio - p) < 0.01);
}

// ------------------------------------------------------------
// URLs Deltron (foto / ficha técnica)
// ------------------------------------------------------------
function getImagenPHP(codigo) {
  const c = String(codigo).trim().toUpperCase();
  return 'https://www.deltron.com.pe/modulos/productos/items/image_ext.php?item=' +
         encodeURIComponent(c) + '&nomenu=1';
}
function getFichaPHP(codigo) {
  const c = String(codigo).trim().toUpperCase();
  return 'https://www.deltron.com.pe/modulos/productos/items/postsql.php?from=new_product&item_number=' +
         encodeURIComponent(c);
}

// ------------------------------------------------------------
// CARGA DE DATOS
// ------------------------------------------------------------
let _reqId = 0;

async function cargarDatos() {
  const my = ++_reqId;

  document.getElementById('loading').style.display = 'block';
  document.getElementById('panel').style.display = 'none';
  document.getElementById('error').style.display = 'none';

  try {
    const r = await fetch(URL_SHEET + '&t=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const texto = await r.text();

    if (my !== _reqId) return; // respuesta obsoleta

    const todasLasFilas = parsearCSV(texto);

    llenarSedeDropdown(todasLasFilas);

    if (!SEDE_ACTUAL) {
      const guardada = localStorage.getItem(KEY_SEDE);
      const sedesDisponibles = [...new Set(todasLasFilas.map(d => d.sede))];
      SEDE_ACTUAL = (guardada && sedesDisponibles.includes(guardada))
        ? guardada
        : (sedesDisponibles[0] || '');
    }
    document.getElementById('sedeHeader').value = SEDE_ACTUAL;

    DATA = todasLasFilas.filter(d =>
      d.sede === SEDE_ACTUAL && !esStockCero(d.stock)
    );

    document.getElementById('loading').style.display = 'none';
    document.getElementById('panel').style.display = 'block';

    llenarFiltros();

    if (DATA.length > 0) {
      TC_ACTUAL = calcularTC(DATA);
      document.getElementById('tc-badge').textContent = 'TC: ' + TC_ACTUAL.toFixed(2);
    }

    document.getElementById('ultima-act').textContent = new Date().toLocaleString('es-PE');
    actualizarSedeTags();

    // 🔥 Reportes en paralelo (NO bloquean favoritos)
    const promesaReportes = cargarReportes();

    // 🔥 Favoritos en paralelo (con DATA ya lleno)
    if (typeof cargarFavoritos === 'function') {
      await cargarFavoritos();
      if (my !== _reqId) return;
      if (typeof actualizarContadorFavoritos === 'function') {
        actualizarContadorFavoritos();
      }
    }

    // Primer render con favoritos listos (badges pueden no estar aún)
    if (my !== _reqId) return;
    render();

    // Esperar reportes (badges) y re-render
    await promesaReportes;
    if (my !== _reqId) return;
    render();

  } catch (e) {
    if (my !== _reqId) return;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = '❌ Error: ' + e.message;
  }
}

// Calcula el TC usando la moda (valor más repetido)
function calcularTC(filas) {
  const conteo = {};
  for (const d of filas) {
    const t = d.tc_real;
    if (!t || t <= 0) continue;
    const k = t.toFixed(2);
    conteo[k] = (conteo[k] || 0) + 1;
  }
  let mejor = null, mejorCnt = 0;
  for (const k in conteo) {
    if (conteo[k] > mejorCnt) { mejor = parseFloat(k); mejorCnt = conteo[k]; }
  }
  return mejor || (filas[0]?.tc_real || 0);
}

async function cargarReportes() {
  try {
    const [rP, rN, rS] = await Promise.all([
      fetch(URL_REP_PRECIOS + '&t=' + Date.now()).then(r => r.ok ? r.text() : ''),
      fetch(URL_REP_NUEVOS  + '&t=' + Date.now()).then(r => r.ok ? r.text() : ''),
      fetch(URL_REP_STOCK   + '&t=' + Date.now()).then(r => r.ok ? r.text() : '')
    ]);
    DATA_PRECIOS = rP ? parsearCSVReportes(rP) : [];
    DATA_NUEVOS  = rN ? parsearCSVReportes(rN) : [];
    DATA_STOCK   = rS ? parsearCSVReportes(rS) : [];
    construirBadges();
    actualizarContadoresBadges();
    log('✅ Badges: ' + Object.keys(BADGES).length + ' productos con estado');
  } catch (e) {
    warn('⚠️ Error cargando reportes:', e.message);
    BADGES = {};
  }
}

// ============================================================
// CONFIGURACIÓN
// ============================================================
const URL_CSV_COTIZACIONES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=1562213448&single=true&output=csv';
const WHATSAPP_CONTACTO = '51973952322';
const ENVIO_DEFAULT = 19;

let COTIZACION_ACTUAL = null;
let ITEMS_ACTUALES = [];
let DATOS_CSV = [];

// ============================================================
// HELPERS
// ============================================================
function fmt2(n) {
  if (n == null || isNaN(n)) return '0.00';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmtFecha(f) {
  if (!f) return '—';
  if (f instanceof Date) {
    return f.toLocaleDateString('es-PE', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }
  const d = parseFechaHora(f);
  if (d) {
    return d.toLocaleDateString('es-PE', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }
  return String(f);
}
function getImagenDeltron(codigo) {
  const c = String(codigo || '').trim().toUpperCase();
  return 'https://www.deltron.com.pe/modulos/productos/items/image_ext.php?item=' +
         encodeURIComponent(c) + '&nomenu=1';
}

function parseFechaHora(s) {
  if (!s) return null;
  const str = String(s).trim();
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const d = new Date(
      parseInt(m[3]),
      parseInt(m[2]) - 1,
      parseInt(m[1]),
      parseInt(m[4] || 0),
      parseInt(m[5] || 0)
    );
    return isNaN(d) ? null : d;
  }
  return null;
}

function parseFechaDDMMYYYY(s) {
  const d = parseFechaHora(s);
  if (!d) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function estaCaducada(caducaStr) {
  const caduca = parseFechaDDMMYYYY(caducaStr);
  if (!caduca) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return caduca < hoy;
}

// ============================================================
// DETECCIÓN DE CATEGORÍA (por nombre de producto + código)
// ============================================================
function detectarCategoria(codigo, producto) {
  const c = String(codigo || '').toUpperCase().trim();
  const p = String(producto || '').toUpperCase().trim();

  // ============================================================
  // PASO 1: Por NOMBRE del producto (más confiable)
  // ============================================================
  if (p) {
    // Audio
    if (p.includes('AUDIFONO') || p.includes('AURICULAR') || p.includes('HEADSET') ||
        p.includes('PARLANTE') || p.includes('SPEAKER') || p.includes('MICROFONO') ||
        p.includes('EARBUD') || p.includes('TWS') || p.includes('SOUNDBAR') ||
        p.includes('BOCINA')) {
      return 'audio';
    }

    // Notebook
    if (p.includes('NOTEBOOK') || p.includes('LAPTOP') || p.includes('ULTRABOOK')) {
      return 'nb';
    }

    // Monitor
    if (p.includes('MONITOR') && !p.includes('MONITOREO')) {
      return 'mon';
    }

    // Mouse
    if (p.includes('MOUSE ') || p.includes('MOUSEPAD') || p.includes('MOUSE PAD') ||
        p.includes('RATON')) {
      return 'mouse';
    }

    // Teclado
    if (p.includes('TECLADO') || p.includes('KEYBOARD')) {
      return 'kb';
    }

    // Cámara / Webcam
    if (p.includes('WEBCAM') || p.includes('CAMARA WEB') || p.includes('CAMARA IP') ||
        (p.includes('CAMARA') && !p.includes('CAMARA DE FOTOS'))) {
      return 'cam';
    }

    // Impresora / Multifuncional
    if (p.includes('IMPRESORA') || p.includes('MULTIFUNCIONAL') || p.includes('PLOTTER') ||
        p.includes('TICKETERA')) {
      return 'print';
    }

    // Suministros
    if (p.includes('TINTA') || p.includes('TONER') || p.includes('CARTUCHO') ||
        p.includes('BOTELLA DE TINTA') || p.includes('CINTA') || p.includes('RIBBON')) {
      return 'sumin';
    }

    // Memoria RAM
    if ((p.includes('MEMORIA') && (p.includes('DDR') || p.includes('RAM'))) ||
        p.includes('SODIMM')) {
      return 'ram';
    }

    // Discos
    if (p.includes('DISCO DURO') || p.includes('SSD') || p.includes('HDD') ||
        p.includes('DISCO SOLIDO') || p.includes('DISCO EXTERNO')) {
      return 'disk';
    }

    // USB / Flash
    if (p.includes('USB DRIVE') || p.includes('PENDRIVE') || p.includes('FLASH') ||
        p.includes('MEMORIA USB') || p.includes('MICRO SD') || p.includes('MEMORIA SD')) {
      return 'usb';
    }

    // Fuentes
    if (p.includes('FUENTE') && (p.includes('PODER') || p.includes('POWER') ||
        p.includes('ATX') || p.includes('PSU'))) {
      return 'psu';
    }

    // Cases
    if (p.includes('CASE ') || p.includes('GABINETE') || p.includes('CHASIS')) {
      return 'case';
    }

    // Placa madre
    if (p.includes('MOTHERBOARD') || p.includes('PLACA MADRE') ||
        (p.includes('MAINBOARD') && !p.includes('NOTEBOOK'))) {
      return 'mb';
    }

    // Procesador
    if (p.includes('PROCESADOR') || p.includes('CPU ')) {
      return 'cpu';
    }

    // GPU
    if (p.includes('TARJETA DE VIDEO') || p.includes('GPU') || p.includes('VIDEO CARD')) {
      return 'gpu';
    }

    // Cooler
    if (p.includes('COOLER') || p.includes('VENTILADOR') || p.includes('FAN ')) {
      return 'cooler';
    }

    // Redes
    if (p.includes('SWITCH') || p.includes('ROUTER') || p.includes('ACCESS POINT') ||
        p.includes('WIFI') || p.includes('ETHERNET')) {
      return 'net';
    }

    // Tablet
    if (p.includes('TABLET') || p.includes('IPAD')) {
      return 'tablet';
    }

    // Celular
    if (p.includes('SMARTPHONE') || p.includes('CELULAR') || p.includes('IPHONE') ||
        p.includes('TELEFONO CELULAR')) {
      return 'cel';
    }

    // UPS
    if (p.includes('UPS') || p.includes('ESTABILIZADOR')) {
      return 'ups';
    }

    // Mochila
    if (p.includes('MOCHILA') || p.includes('BACKPACK') || p.includes('MALETIN') ||
        p.includes('BRIEFCASE') || p.includes('CARTUCHERA')) {
      return 'mochila';
    }

    // Software
    if (p.includes('ANTIVIRUS') || p.includes('LICENCIA') || p.includes('SOFTWARE')) {
      return 'soft';
    }

    // Servidor
    if (p.includes('SERVIDOR') || p.includes('SERVER')) {
      return 'server';
    }
  }

  // ============================================================
  // PASO 2: Por CÓDIGO (fallback)
  // ============================================================
  if (!c) return 'gen';

  if (c.startsWith('NB')) return 'nb';
  if (c.startsWith('MON') || c.startsWith('MOL')) return 'mon';
  if (c.startsWith('MM') || c.startsWith('AUD') || c.startsWith('PARL')) return 'audio';
  if (c.startsWith('CAM') || c.startsWith('CMR') || c.startsWith('WEBCAM')) return 'cam';
  if (c.startsWith('STPR') || c.startsWith('STEP') || c.startsWith('STP')) return 'sumin';
  if (c.startsWith('PR') && !c.startsWith('PRH')) return 'print';
  if (c.startsWith('MOU')) return 'mouse';
  if (c.startsWith('TEC') || c.startsWith('KB')) return 'kb';
  if (c.startsWith('MI')) return 'mouse';
  if (c.startsWith('MEM') || c.startsWith('ME ')) return 'ram';
  if (c.startsWith('SSD') || c.startsWith('DIS')) return 'disk';
  if (c.startsWith('MC')) return 'usb';
  if (c.startsWith('PSU') || c.startsWith('FUENTE')) return 'psu';
  if (c.startsWith('CSE') || c.startsWith('CAS')) return 'case';
  if (c.startsWith('MB')) return 'mb';
  if (c.startsWith('CPU')) return 'cpu';
  if (c.startsWith('VID') || c.startsWith('VDP')) return 'gpu';
  if (c.startsWith('CPX') || c.startsWith('FAN') || c.startsWith('COO')) return 'cooler';
  if (c.startsWith('NW') || c.startsWith('RED') || c.startsWith('ROUT')) return 'net';
  if (c.startsWith('TAB') || c.startsWith('TB') || c.startsWith('PDA')) return 'tablet';
  if (c.startsWith('CEL') || c.startsWith('TC') || c.startsWith('SM')) return 'cel';
  if (c.startsWith('UPS')) return 'ups';
  if (c.startsWith('MAV')) return 'mochila';
  if (c.startsWith('SW') || c.startsWith('MS') || c.startsWith('KAS')) return 'soft';
  if (c.startsWith('SRV') || c.startsWith('SERV')) return 'serv';
  if (c.startsWith('SV')) return 'server';
  if (c.startsWith('AC')) return 'acc';

  return 'gen';
}

// ============================================================
// PARSEAR CSV
// ============================================================
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
  return filas;
}

function csvAFilas(texto) {
  const filas = parsearCSV(texto);
  if (filas.length < 2) return [];
  const headers = filas[0].map(h => h.trim().toUpperCase());
  const idx = (name) => headers.indexOf(name);

  const iID = idx('ID');
  const iFecha = idx('FECHA');
  const iCaduca = idx('CADUCA');
  const iCliente = idx('CLIENTE');
  const iSede = idx('SEDE');
  const iTC = idx('TC');
  const iEnvio = idx('ENVIO');
  const iEstado = idx('ESTADO');
  const iCodigo = idx('CODIGO');
  const iProducto = idx('PRODUCTO');
  const iMarca = idx('MARCA');
  const iPrecioUSD = idx('PRECIO_USD');
  const iPrecioPen = idx('PRECIO_PEN');
  const iPrecioPub = idx('PRECIO_PUBLICO');
  const iCantidad = idx('CANTIDAD');
  const iSubtotal = idx('SUBTOTAL');
  const iFoto = idx('FOTO_URL');

  const COL_SPECS = 17;
  const COL_SPECS_ESTADO = 18;
  const COL_SPECS_UPDATED = 19;
  const COL_STOCK = 20;

  return filas.slice(1).filter(f => f[iID]).map(f => ({
    id: String(f[iID] || '').trim(),
    fecha: f[iFecha] || '',
    caduca: iCaduca >= 0 ? f[iCaduca] : '',
    cliente: f[iCliente] || 'Cliente',
    sede: String(f[iSede] || '').trim(),
    tc: Number(f[iTC]) || 0,
    envio: Number(f[iEnvio]) || 0,
    estado: f[iEstado] || 'ACTIVA',
    codigo: String(f[iCodigo] || '').trim(),
    producto: f[iProducto] || '',
    marca: f[iMarca] || '',
    precio_usd: Number(f[iPrecioUSD]) || 0,
    precio_pen: Number(f[iPrecioPen]) || 0,
    precio: Number(f[iPrecioPub]) || 0,
    cantidad: iCantidad >= 0 ? (Number(f[iCantidad]) || 1) : 1,
    subtotal: iSubtotal >= 0 ? (Number(f[iSubtotal]) || 0) : 0,
    foto_url: iFoto >= 0 ? String(f[iFoto] || '') : '',
    specs_json: String(f[COL_SPECS] || '').trim(),
    specs_estado: String(f[COL_SPECS_ESTADO] || '').trim(),
    specs_updated: String(f[COL_SPECS_UPDATED] || '').trim(),
    stock: String(f[COL_STOCK] || '').trim()
  }));
}

// ============================================================
// AGRUPAR POR ID
// ============================================================
function agruparPorID(filas) {
  const porID = {};
  for (const item of filas) {
    if (!porID[item.id]) porID[item.id] = { meta: item, items: [] };
    porID[item.id].items.push(item);
  }
  return porID;
}

// ============================================================
// CARGAR TODO
// ============================================================
async function cargarTodo() {
  document.getElementById('contenido').innerHTML = `
    <div class="estado">
      <div class="spinner"></div>
      <p>Cargando cotizaciones...</p>
    </div>
  `;

  try {
    const r = await fetch(URL_CSV_COTIZACIONES + '&t=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const texto = await r.text();
    DATOS_CSV = csvAFilas(texto);

    if (DATOS_CSV.length === 0) {
      mostrarVacio('Aún no hay cotizaciones', 'Cuando generes una desde el catálogo, aparecerá aquí automáticamente.');
      return;
    }

    const porID = agruparPorID(DATOS_CSV);

    const idsVigentes = Object.keys(porID).filter(id => {
      const meta = porID[id].meta;
      return !estaCaducada(meta.caduca);
    });

    idsVigentes.sort((a, b) => {
      const da = parseFechaHora(porID[a].meta.fecha) || new Date(0);
      const db = parseFechaHora(porID[b].meta.fecha) || new Date(0);
      return db - da;
    });

    if (idsVigentes.length === 0) {
      mostrarVacio('La última cotización ya expiró', 'Genera una nueva desde el catálogo.');
      return;
    }

    cargarCotizacionPorId(idsVigentes[0], porID);

  } catch (e) {
    mostrarVacio('Error al cargar', e.message);
  }
}

// ============================================================
// BUSCAR POR CÓDIGO
// ============================================================
async function buscarCotizacion() {
  const input = document.getElementById('codigoInput');
  let codigo = input.value.trim().toUpperCase();

  if (!codigo) {
    Swal.fire('Campo vacío', 'Ingresa tu código de cotización.', 'warning');
    return;
  }

  if (!codigo.startsWith('COT-') && /^[A-Z0-9]{6,12}$/.test(codigo)) {
    codigo = 'COT-' + codigo;
  }

  const btn = document.getElementById('btnBuscar');
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> BUSCANDO...';

  try {
    const r = await fetch(URL_CSV_COTIZACIONES + '&t=' + Date.now());
    const texto = await r.text();
    DATOS_CSV = csvAFilas(texto);
    const porID = agruparPorID(DATOS_CSV);

    if (!porID[codigo]) {
      Swal.fire('No encontrada', 'No existe una cotización con ese código.', 'error');
      return;
    }

    const meta = porID[codigo].meta;
    if (estaCaducada(meta.caduca)) {
      Swal.fire({
        title: 'Cotización expirada',
        text: 'Esta cotización venció el ' + meta.caduca + '. Pide una actualización.',
        icon: 'warning'
      });
      return;
    }

    cargarCotizacionPorId(codigo, porID);

    Swal.fire({
      title: '✓ Cotización cargada',
      text: porID[codigo].items.length + ' producto(s) encontrados.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });

  } catch (e) {
    Swal.fire('Error', e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

// ============================================================
// CARGAR COTIZACIÓN POR ID
// ============================================================
function cargarCotizacionPorId(id, porID) {
  const grupo = porID[id];
  if (!grupo) return;

  const meta = grupo.meta;
  const items = grupo.items;

  COTIZACION_ACTUAL = {
    id: meta.id,
    fecha: meta.fecha,
    caduca: meta.caduca,
    cliente: meta.cliente,
    sede: meta.sede,
    tc: meta.tc,
    envio: meta.envio
  };
  ITEMS_ACTUALES = items;

  const sedeDisplay = document.getElementById('sedeDisplay');
  if (meta.sede) {
    sedeDisplay.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + esc(meta.sede);
  } else {
    sedeDisplay.innerHTML = '<i class="fa-solid fa-location-dot"></i> —';
  }

  document.getElementById('tcDisplay').textContent = meta.tc > 0
    ? 'S/ ' + meta.tc.toFixed(2)
    : '—';

  renderCotizacion(COTIZACION_ACTUAL, items);
}

// ============================================================
// STOCK
// ============================================================
function renderStock(stockStr) {
  const s = String(stockStr || '').trim();
  if (!s || s === '') return '<span class="stock-badge stock-vacio">—</span>';

  const match = s.match(/-?\d+/);
  const num = match ? parseInt(match[0]) : null;

  if (num === null) return `<span class="stock-badge stock-vacio">${esc(s)}</span>`;
  if (num === 0) return '<span class="stock-badge stock-bajo">0</span>';
  if (num <= 10) return `<span class="stock-badge stock-medio">${num}</span>`;
  return `<span class="stock-badge stock-alto">${num}+</span>`;
}

// ============================================================
// RENDER SPECS
// ============================================================
function renderSpecs(specsJson) {
  if (!specsJson || specsJson === '[]' || specsJson === '') {
    return '<div class="specs-vacio"><i class="fa-regular fa-circle-xmark"></i> Especificaciones no disponibles para este producto</div>';
  }

  let specs;
  try {
    specs = JSON.parse(specsJson);
  } catch (e) {
    return '<div class="specs-vacio"><i class="fa-solid fa-triangle-exclamation"></i> Error al leer especificaciones</div>';
  }

  if (!Array.isArray(specs) || specs.length === 0) {
    return '<div class="specs-vacio"><i class="fa-regular fa-circle-xmark"></i> Especificaciones no disponibles para este producto</div>';
  }

  const grupos = {};
  for (const s of specs) {
    const cat = s.categoria || 'GENERAL';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(s);
  }

  const html = Object.entries(grupos).map(([cat, arr]) => `
    <div class="specs-grupo">
      <div class="specs-grupo-header">${esc(cat)}</div>
      <table class="specs-tabla">
        ${arr.map(s => {
          const tieneAtributo = s.atributo && s.atributo !== s.categoria && s.atributo !== '';
          if (!tieneAtributo) {
            return `<tr><td colspan="2" class="specs-valor-solo">${esc(s.valor || '')}</td></tr>`;
          }
          return `<tr><td>${esc(s.atributo)}</td><td>${esc(s.valor || '')}</td></tr>`;
        }).join('')}
      </table>
    </div>
  `).join('');

  return html;
}

function specsATexto(specsJson) {
  if (!specsJson || specsJson === '[]' || specsJson === '') return '';
  let specs;
  try { specs = JSON.parse(specsJson); } catch (e) { return ''; }
  if (!Array.isArray(specs)) return '';

  const grupos = {};
  for (const s of specs) {
    const cat = s.categoria || 'GENERAL';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(s);
  }

  return Object.entries(grupos).map(([cat, arr]) => {
    const lineas = arr.map(s => {
      const tieneAtributo = s.atributo && s.atributo !== s.categoria && s.atributo !== '';
      return tieneAtributo
        ? `  ${s.atributo}: ${s.valor || ''}`
        : `  ${s.valor || ''}`;
    }).join('\n');
    return `${cat}\n${lineas}`;
  }).join('\n\n');
}

// ============================================================
// TOGGLE SPECS
// ============================================================
function toggleSpecs(uid, btn) {
  const fila = document.querySelector(`.specs-fila[data-uid="${uid}"]`);
  if (!fila) return;
  const abierto = fila.classList.toggle('abierto');
  btn.classList.toggle('abierto', abierto);
  btn.innerHTML = abierto
    ? '<i class="fa-solid fa-chevron-right"></i> Ocultar'
    : '<i class="fa-solid fa-chevron-right"></i> Ver especificaciones';
}

// ============================================================
// COPIAR SPECS
// ============================================================
function copiarSpecs(specsJson, codigo) {
  const texto = specsATexto(specsJson);
  if (!texto) {
    Swal.fire('Sin especificaciones', 'Este producto no tiene specs para copiar.', 'info');
    return;
  }
  const contenido = `📋 ${codigo}\n\n${texto}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(contenido).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copiado',
        text: 'Las especificaciones están en el portapapeles.',
        timer: 1400,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }).catch(() => copiarFallback(contenido));
  } else {
    copiarFallback(contenido);
  }
}

function copiarFallback(texto) {
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    Swal.fire({
      icon: 'success',
      title: 'Copiado',
      timer: 1400,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  } catch (e) {
    Swal.fire('Error', 'No se pudo copiar.', 'error');
  }
  document.body.removeChild(ta);
}

// ============================================================
// RENDER COTIZACIÓN
// ============================================================
function renderCotizacion(cot, items) {
  const envio = (typeof cot.envio === 'number' && cot.envio >= 0) ? cot.envio : ENVIO_DEFAULT;
  let subtotal = 0;

  const filas = items.map((p, idx) => {
    const precio = Number(p.precio) || 0;
    const cant = Number(p.cantidad) || 1;
    const totalLinea = Number(p.subtotal) || (precio * cant);
    subtotal += totalLinea;
    const imgUrl = p.foto_url || getImagenDeltron(p.codigo);

    const uid = `${cot.id}__${p.codigo}__${idx}`;
    const tieneSpecs = p.specs_json && p.specs_json !== '[]' && p.specs_json.trim() !== '';
    const specsHtml = tieneSpecs
      ? renderSpecs(p.specs_json)
      : '<div class="specs-vacio"><i class="fa-regular fa-circle-xmark"></i> Especificaciones no disponibles para este producto</div>';

    const btnToggle = tieneSpecs
      ? `<button class="specs-toggle" onclick="toggleSpecs('${uid}', this)" title="Ver especificaciones">
           <i class="fa-solid fa-chevron-right"></i> Ver especificaciones
         </button>`
      : `<span class="specs-toggle sin-specs" title="Sin especificaciones">
           <i class="fa-regular fa-circle-xmark"></i> Sin specs
         </span>`;

    const btnCopiar = tieneSpecs
      ? `<button class="specs-btn-copiar" onclick="copiarSpecs(${JSON.stringify(p.specs_json).replace(/"/g, '&quot;')}, '${esc(p.codigo)}')">
           <i class="fa-regular fa-copy"></i> Copiar
         </button>`
      : '';

    return `
      <tr>
        <td class="foto-cell cat-${detectarCategoria(p.codigo, p.producto)}">
          <a href="${imgUrl}" target="_blank" rel="noopener noreferrer" class="foto-link" title="Ver foto">
            <img src="${imgUrl}" alt="${esc(p.codigo)}" loading="lazy"
                 onerror="var td=this.closest('.foto-cell'); if(td) td.classList.add('sin-foto'); this.remove();">
          </a>
        </td>
        <td>
          <div class="producto-codigo">${esc(p.codigo)}</div>
          <div>${btnToggle}</div>
        </td>
        <td>
          <div class="producto-nombre">${esc(p.producto)}</div>
          ${p.marca ? `<div class="producto-marca">${esc(p.marca)}</div>` : ''}
        </td>
        <td class="num">S/ ${fmt2(precio)}</td>
        <td class="centro">${renderStock(p.stock)}</td>
        <td class="centro">${cant}</td>
        <td class="num">S/ ${fmt2(totalLinea)}</td>
      </tr>
      <tr class="specs-fila" data-uid="${uid}">
        <td colspan="7" class="specs-celda">
          <div class="specs-wrapper">
            ${specsHtml}
            <div class="specs-acciones no-print">
              ${btnCopiar}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const total = subtotal + envio;

  document.getElementById('cotNumero').textContent = cot.id;
  document.getElementById('fechaDisplay').textContent = fmtFecha(cot.fecha);
  document.getElementById('clienteNombre').textContent = cot.cliente || 'Cliente';

  document.getElementById('contenido').innerHTML = `
    <div class="tabla-productos">
      <table>
        <thead>
          <tr>
            <th style="width:54px;"></th>
            <th style="width:180px;">Código</th>
            <th>Producto</th>
            <th class="num">Precio</th>
            <th class="centro">Stock</th>
            <th class="centro">Cant.</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>

    <div class="resumen">
      <div class="fila">
        <span class="label">Subtotal</span>
        <span class="valor">S/ ${fmt2(subtotal)}</span>
      </div>
      <div class="fila">
        <span class="label"><i class="fa-solid fa-truck"></i> Envío</span>
        <span class="valor">S/ ${fmt2(envio)}</span>
      </div>
      <div class="fila total">
        <span class="label">TOTAL</span>
        <span class="valor">S/ ${fmt2(total)}</span>
      </div>
    </div>

    <div class="acciones no-print">
      <button class="btn-wsp" onclick="enviarWhatsApp()">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </button>
      <button class="btn-pdf" onclick="exportarPDF()">
        <i class="fa-regular fa-file-pdf"></i> PDF
      </button>
      <button class="btn-print" onclick="window.print()">
        <i class="fa-regular fa-print"></i> Imprimir
      </button>
    </div>
  `;

  document.title = 'Cotización ' + cot.id + ' - ServiComp+';
}

// ============================================================
// VACÍO
// ============================================================
function mostrarVacio(titulo, detalle) {
  document.getElementById('contenido').innerHTML = `
    <div class="estado">
      <i class="fa-solid fa-file-invoice"></i>
      <h3>${esc(titulo)}</h3>
      <p>${esc(detalle)}</p>
    </div>
  `;
}

// ============================================================
// WHATSAPP
// ============================================================
function enviarWhatsApp() {
  const cot = COTIZACION_ACTUAL;
  const items = ITEMS_ACTUALES;
  if (!cot || !items.length) return;

  const envio = (typeof cot.envio === 'number' && cot.envio >= 0) ? cot.envio : ENVIO_DEFAULT;
  let subtotal = 0;
  const lineas = items.map(p => {
    const cant = Number(p.cantidad) || 1;
    const totalLinea = Number(p.subtotal) || (Number(p.precio) * cant);
    subtotal += totalLinea;
    return `• ${cant}x ${p.producto} — S/ ${fmt2(totalLinea)}`;
  }).join('\n');

  const total = subtotal + envio;

  const texto =
    `¡Hola ServiComp+! 👋\n\n` +
    `Acepto la cotización *${cot.id}*\n` +
    `Sede: *${cot.sede || '—'}*\n` +
    `Cliente: *${cot.cliente || 'Cliente'}*\n\n` +
    `*Productos:*\n${lineas}\n\n` +
    `*Subtotal:* S/ ${fmt2(subtotal)}\n` +
    `*Envío:* S/ ${fmt2(envio)}\n` +
    `*TOTAL:* S/ ${fmt2(total)}\n\n` +
    `Quedo atento para coordinar. ¡Gracias!`;

  window.open('https://wa.me/' + WHATSAPP_CONTACTO + '?text=' + encodeURIComponent(texto), '_blank');
}

// ============================================================
// PDF
// ============================================================
function exportarPDF() {
  const cot = COTIZACION_ACTUAL;
  if (!cot) return;

  document.querySelectorAll('.specs-fila').forEach(f => f.classList.add('abierto'));
  document.querySelectorAll('.specs-toggle').forEach(b => {
    if (!b.classList.contains('sin-specs')) {
      b.classList.add('abierto');
      b.innerHTML = '<i class="fa-solid fa-chevron-right"></i> Ocultar';
    }
  });

  const elemento = document.getElementById('documento');
  const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');

  Swal.fire({
    title: 'Generando PDF...',
    text: 'Espera un momento',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  setTimeout(() => {
    html2pdf()
      .set({
        margin: 0.4,
        filename: 'Cotizacion_' + cot.id + '_' + fecha + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(elemento)
      .save()
      .then(() => {
        Swal.close();
        document.querySelectorAll('.specs-fila').forEach(f => f.classList.remove('abierto'));
        document.querySelectorAll('.specs-toggle').forEach(b => {
          if (!b.classList.contains('sin-specs')) {
            b.classList.remove('abierto');
            b.innerHTML = '<i class="fa-solid fa-chevron-right"></i> Ver especificaciones';
          }
        });
      })
      .catch((e) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo generar el PDF: ' + e.message, 'error');
      });
  }, 300);
}

// ============================================================
// LIMPIAR
// ============================================================
function limpiarBusqueda() {
  document.getElementById('codigoInput').value = '';
  mostrarVacio('Esperando código de cotización', 'Ingresa tu código arriba para ver los productos.');
  document.getElementById('cotNumero').textContent = '—';
  document.getElementById('fechaDisplay').textContent = '—';
  document.getElementById('clienteNombre').textContent = '—';
  document.getElementById('sedeDisplay').innerHTML = '<i class="fa-solid fa-location-dot"></i> —';
  document.title = 'ServiComp+ | Consulta tu Cotización';
  COTIZACION_ACTUAL = null;
  ITEMS_ACTUALES = [];
}

// ============================================================
// INICIO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('codigoInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarCotizacion();
    }
  });

  cargarTodo();
});
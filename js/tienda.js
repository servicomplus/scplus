/* ============================================================
   CONFIG
   ============================================================ */
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=329818076&single=true&output=csv';

const CSV_THUMB_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=1886951424&single=true&output=csv';

const CSV_URL_FINAL   = CSV_URL   + '&_=' + Date.now();
const CSV_THUMB_FINAL = CSV_THUMB_URL + '&_=' + Date.now();

/* ============================================================
   CSVs DE REPORTES
   - Reportes_Nuevos  → columna TIPO    = "NUEVO"
   - Reportes_Precios → columna SUBTIPO = "PRECIO_BAJA_FUERTE" | "PRECIO_BAJA"
   ============================================================ */
const CSV_REPORTES_NUEVOS_URL  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=936196408&single=true&output=csv';
const CSV_REPORTES_PRECIOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=1940346287&single=true&output=csv';

const CSV_REPORTES_NUEVOS_FINAL  = CSV_REPORTES_NUEVOS_URL  + '&_=' + Date.now();
const CSV_REPORTES_PRECIOS_FINAL = CSV_REPORTES_PRECIOS_URL + '&_=' + Date.now();

/* Sets globales de códigos */
const SET_NUEVOS  = new Set();
const SET_OFERTAS = new Set();

const PER_PAGE = 24;
const ORDEN_DEFAULT = 'precio_asc';
const SEDE_DEFAULT = 'LIMA';

const WHATSAPP_NUM = '51973952322';
const KEY_CARRITO  = 'servicomp_tienda_carrito_v4';

/* ============================================================
   CATEGORÍAS POR DEFECTO
   ============================================================ */
const CATEGORIAS_DEFAULT = [
  'NOTEBOOK CELERON','NOTEBOOK CORE 3','NOTEBOOK CORE 5','NOTEBOOK CORE 7',
  'NOTEBOOK CORE 9','NOTEBOOK CORE i3','NOTEBOOK CORE i5','NOTEBOOK CORE i7',
  'NOTEBOOK CORE ULTRA 5','NOTEBOOK CORE ULTRA 5 AI','NOTEBOOK CORE ULTRA 7',
  'NOTEBOOK CORE ULTRA 7 AI','NOTEBOOK CORE ULTRA 9','NOTEBOOK GAM CORE ULTRA 9',
  'NOTEBOOK GAMING CORE 5','NOTEBOOK GAMING CORE 7','NOTEBOOK GAMING CORE i5',
  'NOTEBOOK GAMING CORE i7','NOTEBOOK GAMING CORE i9','NOTEBOOK GM CORE ULT 9 AI',
  'NOTEBOOK WORKSTATION'
];

function esCategoriaDefault(cat){
  if(!cat) return false;
  return CATEGORIAS_DEFAULT.includes(cat.trim());
}

/* ============================================================
   EXCLUSIONES
   ============================================================ */
const CATEGORIAS_EXCLUIDAS = [
  'SERVICIO TECNICO','SERVICIOS OTROS','SERVICIOS VENTAS','ACCESORIOS',
  'DELTRON','DELTRON PC','MERCHANDISING'
];
const MARCAS_EXCLUIDAS = ['ZZ OTRAS MARCAS','DELTRON'];

const norm = s => String(s || '').trim().toUpperCase();
const esCategoriaExcluida = cat => CATEGORIAS_EXCLUIDAS.some(x => norm(x) === norm(cat));
const esMarcaExcluida = marca => MARCAS_EXCLUIDAS.some(x => norm(x) === norm(marca));

/* ============================================================
   COLORES POR MARCA
   ============================================================ */
const COLORES_MARCA = {
  'HP':'#0096d6','Lenovo':'#e2231a','Dell':'#007db8','Asus':'#00539b',
  'Acer':'#83b81a','Apple':'#555555','Logitech':'#00b8fc','Razer':'#44d62c',
  'Samsung':'#1428a0','Kingston':'#d40000','AMD':'#ed1c24','Intel':'#0071c5',
  'MSI':'#ff0000','Gigabyte':'#f60','Epson':'#003399','Western Digital':'#005197',
  'Seagate':'#6eb43f','Toshiba':'#ff0000','TeamGroup':'#e60012','Hiksemi':'#0072ce',
  'Corsair':'#ffcc00','Noctua':'#7c3aed','Cooler Master':'#6f2da8','D-Link':'#0073a8',
  'Microsoft':'#00a4ef','Kaspersky':'#006d5c','Bitdefender':'#ed1c24','Eset':'#009fe3',
  'Canon':'#cc0000','Teros':'#6366f1','Advance':'#f59e0b'
};
const FALLBACK_COLOR = '#0f2b47';

/* ============================================================
   ICONOS POR CATEGORÍA
   ============================================================ */
const ICONOS_CAT = {
  'ACCESORIOS USB':'fa-usb',
  'AUDIO, AURICULAR C/MIC':'fa-headphones','AUDIO, AURICULAR C/MIC GM':'fa-headset',
  'AUDIO, AURICULAR INALAM':'fa-headphones-simple','AUDIO, MICROFONO USB':'fa-microphone',
  'AUDIO, PARLANTE INALAMBRC':'fa-volume-high','AUDIO, ACCESORIOS DE':'fa-headphones',
  'CAMARA, WEBCAM':'fa-video','CARTUCHERA / PORTACABLES':'fa-briefcase',
  'CASES ATX VER2.0':'fa-computer','CASES MICRO ATX':'fa-computer',
  'CASES SIN FUENTE P/GAMERS':'fa-computer','CASES, FUENTE PARA':'fa-bolt',
  'CASES, FUENTE PARA GAMING':'fa-bolt','CASES, FUENTE CERTIFICADA':'fa-bolt',
  'COMERCIAL LASER':'fa-print','COMERCIAL MATRICIAL':'fa-print',
  'COMERCIAL TANQUE TINTA':'fa-print','CONSUMO TANQUE TINTA MULT':'fa-print',
  'COOLER LIQUIDO CPU 240':'fa-fan','COOLER LIQUIDO CPU 360':'fa-fan',
  'DISCO DURO 3.5 SATA':'fa-hard-drive','DISCO DURO EXTERNO 2.5':'fa-hard-drive',
  'DISCO SOLIDO EXTERNO(SSD)':'fa-hard-drive','DVD-WRITER EXTERNO':'fa-compact-disc',
  'ESTABILIZADOR DE TENSION':'fa-bolt','FAN COOLER CPU':'fa-fan',
  'IMAGENES, ACCESORIOS DISP':'fa-image','IMAGENES, PROYECTOR':'fa-video',
  'IMPRESORA TERMICA':'fa-receipt','IMPRESORA, ACCESORIOS DE':'fa-print',
  'MOCHILA / BACKPACK':'fa-bag-shopping',
  'MOUSE INALAMBRICO':'fa-computer-mouse','MOUSE PAD/MAT, ACCESORIOS':'fa-computer-mouse',
  'MOUSE PARA GAMERS':'fa-computer-mouse','MOUSE USB':'fa-computer-mouse',
  'NOTEBOOK, ACCESORIOS DE':'fa-laptop','NOTEBOOK, MALETIN/MOCHILA':'fa-briefcase',
  'RED WIFI ACCESORIOS':'fa-wifi','RED WIFI ADAPTADORES USB':'fa-wifi',
  'RED WIFI ROUTER-ADSL':'fa-wifi','RED WIFI TARJETAS PCI':'fa-wifi',
  'RED, ACCESORIOS':'fa-network-wired','RED, CAMARAS IP':'fa-video',
  'RED, SWITCH ACCESO':'fa-network-wired','RED, SWITCH BASICO':'fa-network-wired',
  'SILLAS GAMER':'fa-chair','SOFTWARE, ANTIVIRUS':'fa-shield-virus',
  'SSD 2.5 SATA':'fa-hard-drive','SSD M.2 NVMe':'fa-hard-drive',
  'SUMINIST P/IMPR, BOTELLAS':'fa-droplet','SUMINIST P/IMPRES, TINTAS':'fa-droplet',
  'T CELULARES, ACCESORIOS':'fa-mobile-screen','TABLET ANDROID':'fa-tablet',
  'TECLADO INALAMBRICO':'fa-keyboard','TECLADO PARA GAMERS':'fa-keyboard',
  'TECLADO USB':'fa-keyboard','TECLADO+MOUSE COMBO KIT':'fa-keyboard',
  'TECLADO+MOUSE KIT INALAMB':'fa-keyboard','TELEVISORES, RACKS PARA':'fa-tv',
  'UPS INTERACTIVO':'fa-battery-full','VIDEO, PCI EXP NVIDIA GAM':'fa-microchip',
  'VIDEO, PCI EXP RADEON GAM':'fa-microchip'
};
const FALLBACK_ICON = 'fa-box';

/* ============================================================
   ESTADO
   ============================================================ */
let TODOS = [];
let FILTRADOS = [];
let PAGINA = 1;

const FILTROS = { 
  sede: new Set([SEDE_DEFAULT]), 
  cat: new Set(), 
  marca: new Set(),
  soloNuevos: false,
  soloOfertas: false
};

let ORDEN = ORDEN_DEFAULT;
let EXCLUIDOS_TOTAL = 0;

const THUMB_MAP = new Map();

let CARRITO = [];

const OPCIONES_ORDEN = [
  { value: 'precio_asc', label: 'Precio: Menor a Mayor', icon: 'fa-arrow-up-1-9' },
  { value: 'precio_desc', label: 'Precio: Mayor a Menor', icon: 'fa-arrow-down-9-1' },
  { value: 'nombre_asc', label: 'Ascendente (A-Z)', icon: 'fa-arrow-down-a-z' },
  { value: 'nombre_desc', label: 'Descendente (Z-A)', icon: 'fa-arrow-up-z-a' },
  { value: 'stock_desc', label: 'Stock: Mayor a Menor', icon: 'fa-arrow-down-wide-short' },
  { value: 'stock_asc', label: 'Stock: Menor a Mayor', icon: 'fa-arrow-up-wide-short' }
];

/* ============================================================
   HELPERS
   ============================================================ */
const $ = id => document.getElementById(id);
const fmt = n => 'S/ ' + Math.round(Number(n) || 0).toLocaleString('es-PE');
const fmt2 = n => (Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function copiarTexto(texto){
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(texto);
    } else {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch(e){
    console.warn('No se pudo copiar:', e);
    return false;
  }
}

function getColor(marca){
  if(!marca) return FALLBACK_COLOR;
  const key = marca.toLowerCase().trim();
  for(const k in COLORES_MARCA){
    if(key === k.toLowerCase() || key.includes(k.toLowerCase()) || k.toLowerCase().includes(key)){
      return COLORES_MARCA[k];
    }
  }
  return FALLBACK_COLOR;
}

function getIcon(cat){
  if(!cat) return FALLBACK_ICON;
  if(ICONOS_CAT[cat]) return ICONOS_CAT[cat];
  const c = cat.toUpperCase();
  if(c.includes('AUDIO') || c.includes('PARLANTE') || c.includes('AURICULAR')) return 'fa-headphones';
  if(c.includes('MONITOR')) return 'fa-display';
  if(c.includes('MOUSE')) return 'fa-computer-mouse';
  if(c.includes('TECLADO')) return 'fa-keyboard';
  if(c.includes('NOTEBOOK') || c.includes('LAPTOP')) return 'fa-laptop';
  if(c.includes('COMPUTADORA') || c.includes('PC ') || c.includes('CPU')) return 'fa-desktop';
  if(c.includes('MEM')) return 'fa-memory';
  if(c.includes('DISCO') || c.includes('SSD') || c.includes('HD')) return 'fa-hard-drive';
  if(c.includes('CASE')) return 'fa-computer';
  if(c.includes('IMPRESORA') || c.includes('PRINT')) return 'fa-print';
  if(c.includes('RED') || c.includes('WIFI')) return 'fa-wifi';
  if(c.includes('FUENTE') || c.includes('UPS') || c.includes('ESTABILIZADOR')) return 'fa-bolt';
  if(c.includes('MOCHILA') || c.includes('MALETIN') || c.includes('CARTUCHERA')) return 'fa-bag-shopping';
  if(c.includes('SOFTWARE') || c.includes('KASPERSKY') || c.includes('ESD')) return 'fa-shield-virus';
  if(c.includes('PROYECTOR') || c.includes('IMAGENES')) return 'fa-video';
  if(c.includes('TABLET')) return 'fa-tablet';
  return FALLBACK_ICON;
}

function esUrlValida(u){
  if(!u) return false;
  const s = String(u).trim();
  if(!s) return false;
  if(s === 'TIMESTAMP' || s.endsWith('_TIMESTAMP.jpg')) return false;
  return /^https?:\/\//i.test(s);
}

function getImagen(p){
  const original = String(p.url_thumbnail || '').trim();
  const codigo = String(p.CODIGO || '').trim().toLowerCase();
  if(codigo && THUMB_MAP.has(codigo)){
    const url = THUMB_MAP.get(codigo);
    if(esUrlValida(url)) return url;
  }
  if(esUrlValida(original)) return original;
  return original || null;
}

function getModelo(p){
  const desc = p.DESCRIPCION_CORTA || '';
  const partes = desc.split(',').map(s => s.trim());
  if(partes[0]){
    const palabras = partes[0].split(' ');
    return palabras.slice(0, 4).join(' ').substring(0, 40);
  }
  return p.MARCA || '';
}

/* ============================================================
   CARGA THUMBNAILS
   ============================================================ */
function cargarThumbnails(){
  return new Promise((resolve) => {
    if(!CSV_THUMB_URL){ return resolve(); }

    Papa.parse(CSV_THUMB_FINAL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: h => String(h || '').trim().toLowerCase(),
      complete: function(results){
        results.data.forEach(row => {
          const codigoRaw = row['codigo'] || row['code'] || row['sku'] || '';
          const urlRaw = row['url_thumbnail'] || row['url_thumb'] || row['thumbnail'] || row['url'] || '';
          const codigo = String(codigoRaw).trim().toLowerCase();
          const url = String(urlRaw).trim();
          if(codigo && url && esUrlValida(url)){
            THUMB_MAP.set(codigo, url);
          }
        });
        console.log(`🖼️ Thumbnails cargados: ${THUMB_MAP.size}`);
        resolve();
      },
      error: function(err){
        console.warn('⚠️ Error thumbnails:', err);
        resolve();
      }
    });
  });
}

/* ============================================================
   CARGA DE REPORTES (Reportes_Nuevos / Reportes_Precios)
   ------------------------------------------------------------
   - Reportes_Nuevos  → solo filas con TIPO    === "NUEVO"
   - Reportes_Precios → solo filas con SUBTIPO === "PRECIO_BAJA_FUERTE"
                                                 o "PRECIO_BAJA"
   ============================================================ */
function cargarReportes(){

  /* Normaliza texto: trim + mayúsculas + sin tildes */
  const normTxt = s => String(s || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const parsear = (url, setDestino, nombreHoja, filtroFn) => {
    return new Promise((resolve) => {
      if(!url) return resolve();

      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        transformHeader: h => String(h || '').trim().toUpperCase(),
        complete: function(results){
          let leidos = 0, agregados = 0;

          results.data.forEach(row => {
            const codigo = String(row['CODIGO'] || row['CÓDIGO'] || '').trim();
            if(!codigo) return;
            leidos++;

            // Filtro por columna específica (TIPO / SUBTIPO)
            if(typeof filtroFn === 'function' && !filtroFn(row)) return;

            setDestino.add(codigo);
            agregados++;
          });

          console.log(`📊 [${nombreHoja}] leídos: ${leidos} · agregados: ${agregados}`);
          resolve();
        },
        error: function(err){
          console.warn(`⚠️ Error al cargar [${nombreHoja}]:`, err);
          resolve();
        }
      });
    });
  };

  return Promise.all([

    /* ---------- Reportes_Nuevos → TIPO = "NUEVO" ---------- */
    parsear(
      CSV_REPORTES_NUEVOS_FINAL,
      SET_NUEVOS,
      'Reportes_Nuevos',
      row => normTxt(row['TIPO']) === 'NUEVO'
    ),

    /* ---------- Reportes_Precios → SUBTIPO = PRECIO_BAJA_FUERTE | PRECIO_BAJA ---------- */
    parsear(
      CSV_REPORTES_PRECIOS_FINAL,
      SET_OFERTAS,
      'Reportes_Precios',
      row => {
        const s = normTxt(row['SUBTIPO']);
        return s === 'PRECIO_BAJA_FUERTE' || s === 'PRECIO_BAJA';
      }
    )
  ]);
}

/* ============================================================
   CARGA CATÁLOGO
   ============================================================ */
function cargarCatalogo(){
  Papa.parse(CSV_URL_FINAL, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results){
      const totalOriginal = results.data.length;

      TODOS = results.data
        .filter(p => p && p.CODIGO && String(p.CODIGO).trim() !== '')
        .filter(p => !esCategoriaExcluida(p.CATEGORIA))
        .filter(p => !esMarcaExcluida(p.MARCA))
        .filter(p => (Number(p.PRECIO_PUBLICO) || Number(p.PRECIO_PEN) || 0) > 0)
        .filter(p => (Number(p.STOCK) || 0) > 0)
        .map(p => ({
          codigo: String(p.CODIGO).trim(),
          nombre: (p.DESCRIPCION_CORTA || p.DESCRIPCION_LARGA || 'Sin descripción').trim().toUpperCase(),
          nombreLargo: (p.DESCRIPCION_LARGA || p.DESCRIPCION_CORTA || '').trim().toUpperCase(),
          marca: (p.MARCA || 'Genérico').trim(),
          modelo: getModelo(p).toUpperCase(),
          categoria: (p.CATEGORIA || 'Sin categoría').trim(),
          sede: (p.SEDE || '').trim(),
          stock: Number(p.STOCK) || 0,
          precio: Number(p.PRECIO_PEN) || 0,
          precioUSD: Number(p.PRECIO_USD) || 0,
          precioPublico: Number(p.PRECIO_PUBLICO) || 0,
          sku: (p.SKU || '').trim(),
          garantia: (p.GARANTIA || '').trim(),
          imagen: getImagen(p),
          urlModal: (p.url_modal || '').trim(),
          fecha: p.FECHA_ACTUALIZACION || '',
          tc: Number(p.TC_AJUSTADO) || 0
        }));

      EXCLUIDOS_TOTAL = totalOriginal - TODOS.length;
      console.log(`✅ Disponibles: ${TODOS.length} · 🚫 Excluidos: ${EXCLUIDOS_TOTAL}`);

      if(!TODOS.length){
        $('loader').innerHTML = '<div class="error-box">No se encontraron productos válidos.</div>';
        return;
      }
      inicializar();
    },
    error: function(err){
      console.error('❌ Error CSV:', err);
      $('loader').innerHTML = `<div class="error-box">Error al cargar el CSV.</div>`;
    }
  });
}

(async function init(){
  cargarCarritoDeStorage();
  pintarCarrito();
  bindCarrito();

  await Promise.all([
    cargarThumbnails(),
    cargarReportes()
  ]);

  cargarCatalogo();
})();

/* ============================================================
   INICIALIZAR
   ============================================================ */
function inicializar(){
  TODOS.forEach(p => {
    if(esCategoriaDefault(p.categoria)) FILTROS.cat.add(p.categoria);
  });

  poblarFiltros();

  const primera = TODOS[0];
  $('fecha').textContent = primera.fecha || new Date().toLocaleDateString('es-PE');
  $('tc').textContent = primera.tc ? Number(primera.tc).toFixed(2) : '—';

  $('search').addEventListener('input', () => { PAGINA = 1; filtrar(); });
  $('btnClear').addEventListener('click', limpiarFiltros);

  configurarDropdowns();

  /* Toggle Nuevos */
  const tgNuevos = $('toggleNuevos');
  if(tgNuevos){
    tgNuevos.addEventListener('click', () => {
      FILTROS.soloNuevos = !FILTROS.soloNuevos;
      tgNuevos.classList.toggle('active', FILTROS.soloNuevos);
      if(FILTROS.soloNuevos){
        FILTROS.soloOfertas = false;
        $('toggleOfertas')?.classList.remove('active');
      }
      PAGINA = 1;
      filtrar();
    });

  }

  /* Toggle Ofertas */
  const tgOfertas = $('toggleOfertas');
  if(tgOfertas){
    tgOfertas.addEventListener('click', () => {
      FILTROS.soloOfertas = !FILTROS.soloOfertas;
      tgOfertas.classList.toggle('active', FILTROS.soloOfertas);
      if(FILTROS.soloOfertas){
        FILTROS.soloNuevos = false;
        $('toggleNuevos')?.classList.remove('active');
      }
      PAGINA = 1;
      filtrar();
    });
  }

  $('loader').style.display = 'none';
  $('app').style.display = 'block';

  filtrar();
}

/* ============================================================
   POBLAR FILTROS
   ============================================================ */
function poblarFiltros(){
  const sedes = [...new Set(TODOS.map(p => p.sede).filter(Boolean))].sort();
  const cats = [...new Set(TODOS.map(p => p.categoria).filter(Boolean))].sort();
  const marcas = [...new Set(TODOS.map(p => p.marca).filter(Boolean))].sort();

  construirDropdown('sede', sedes, 'Todas las sedes');
  construirDropdown('cat', cats, 'Todas las categorías');
  construirDropdown('marca', marcas, 'Todas las marcas');

  const listOrden = document.querySelector('[data-dd-list-orden]');
  listOrden.innerHTML = OPCIONES_ORDEN.map(o => `
    <div class="dd-item" data-orden="${o.value}">
      <i class="fa-solid ${o.icon}" style="width:16px;color:var(--ink-soft);font-size:12px"></i>
      <label>${o.label}</label>
      ${o.value === ORDEN ? '<i class="fa-solid fa-check" style="color:var(--brand);margin-left:auto"></i>' : ''}
    </div>
  `).join('');

  listOrden.querySelectorAll('[data-orden]').forEach(el => {
    el.addEventListener('click', () => {
      ORDEN = el.dataset.orden;
      const op = OPCIONES_ORDEN.find(o => o.value === ORDEN);
      document.querySelector('[data-dd="orden"] .label').textContent = op.label;
      document.querySelector('[data-dd="orden"] .dd-panel').classList.remove('open');
      document.querySelector('[data-dd="orden"] .dd-trigger').classList.remove('open');
      listOrden.querySelectorAll('[data-orden]').forEach(e => {
        const ico = e.querySelector('.fa-check');
        if(ico) ico.remove();
      });
      el.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-check" style="color:var(--brand);margin-left:auto"></i>');
      PAGINA = 1;
      filtrar();
    });
  });
}

function construirDropdown(tipo, items, placeholder){
  const dd = document.querySelector(`[data-dd="${tipo}"]`);
  const list = dd.querySelector('[data-dd-list]');

  list.innerHTML = items.map((item, idx) => `
    <div class="dd-item">
      <input type="checkbox" id="chk-${tipo}-${idx}" value="${item}" ${FILTROS[tipo].has(item) ? 'checked' : ''}>
      <label for="chk-${tipo}-${idx}">${item}</label>
    </div>
  `).join('');

  actualizarLabelDropdown(tipo, placeholder);

  list.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', () => {
      if(chk.checked) FILTROS[tipo].add(chk.value);
      else FILTROS[tipo].delete(chk.value);
      actualizarLabelDropdown(tipo, placeholder);
      PAGINA = 1;
      filtrar();
    });
  });

  dd.querySelector('[data-dd-all]').onclick = () => {
    list.querySelectorAll('input[type="checkbox"]').forEach(c => {
      c.checked = true;
      FILTROS[tipo].add(c.value);
    });
    actualizarLabelDropdown(tipo, placeholder);
    PAGINA = 1;
    filtrar();
  };

  dd.querySelector('[data-dd-none]').onclick = () => {
    list.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    FILTROS[tipo].clear();
    actualizarLabelDropdown(tipo, placeholder);
    PAGINA = 1;
    filtrar();
  };

  const search = dd.querySelector('[data-dd-search]');
  if(search){
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      list.querySelectorAll('.dd-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

function actualizarLabelDropdown(tipo, placeholder){
  const dd = document.querySelector(`[data-dd="${tipo}"]`);
  const label = dd.querySelector('.label');
  const badge = dd.querySelector('.count-badge');
  const n = FILTROS[tipo].size;

  if(n === 0){
    label.textContent = placeholder;
    badge.style.display = 'none';
  } else if(n === 1){
    label.textContent = [...FILTROS[tipo]][0];
    badge.style.display = 'none';
  } else {
    label.textContent = `${n} seleccionados`;
    badge.textContent = n;
    badge.style.display = 'inline-block';
  }
}

/* ============================================================
   DROPDOWNS
   ============================================================ */
function configurarDropdowns(){
  document.querySelectorAll('.dd-trigger').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const dd = trigger.closest('.dropdown');
      const panel = dd.querySelector('.dd-panel');
      const isOpen = panel.classList.contains('open');

      document.querySelectorAll('.dd-panel').forEach(p => p.classList.remove('open'));
      document.querySelectorAll('.dd-trigger').forEach(t => t.classList.remove('open'));

      if(!isOpen){
        panel.classList.add('open');
        trigger.classList.add('open');
        const s = panel.querySelector('[data-dd-search]');
        if(s) setTimeout(() => s.focus(), 50);
      }
    });
  });

  document.addEventListener('click', e => {
    if(!e.target.closest('.dropdown')){
      document.querySelectorAll('.dd-panel').forEach(p => p.classList.remove('open'));
      document.querySelectorAll('.dd-trigger').forEach(t => t.classList.remove('open'));
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.dd-panel').forEach(p => p.classList.remove('open'));
      document.querySelectorAll('.dd-trigger').forEach(t => t.classList.remove('open'));
    }
  });
}

/* ============================================================
   LIMPIAR FILTROS
   ============================================================ */
function limpiarFiltros(){
  FILTROS.sede.clear();
  FILTROS.cat.clear();
  FILTROS.marca.clear();
  FILTROS.soloNuevos  = false;
  FILTROS.soloOfertas = false;
  $('search').value = '';
  PAGINA = 1;

  document.querySelectorAll('.dd-list input[type="checkbox"]').forEach(c => c.checked = false);

  const tgN = $('toggleNuevos');
  const tgO = $('toggleOfertas');
  if(tgN) tgN.classList.remove('active');
  if(tgO) tgO.classList.remove('active');

  actualizarLabelDropdown('sede', 'Todas las sedes');
  actualizarLabelDropdown('cat', 'Todas las categorías');
  actualizarLabelDropdown('marca', 'Todas las marcas');

  filtrar();
}

/* ============================================================
   FILTRAR
   ============================================================ */
function filtrar(){
  const q = $('search').value.trim().toLowerCase();

  FILTRADOS = TODOS.filter(p => {
    if(FILTROS.sede.size && !FILTROS.sede.has(p.sede)) return false;
    if(FILTROS.cat.size && !FILTROS.cat.has(p.categoria)) return false;
    if(FILTROS.marca.size && !FILTROS.marca.has(p.marca)) return false;
    if(q){
      const texto = `${p.nombre} ${p.nombreLargo} ${p.codigo} ${p.marca} ${p.sku} ${p.categoria} ${p.modelo}`.toLowerCase();
      if(!texto.includes(q)) return false;
    }

    if(FILTROS.soloNuevos && !SET_NUEVOS.has(p.codigo)) return false;
    if(FILTROS.soloOfertas && !SET_OFERTAS.has(p.codigo)) return false;

    return true;
  });

  switch(ORDEN){
    case 'precio_asc': FILTRADOS.sort((a,b) => (a.precioPublico || a.precio) - (b.precioPublico || b.precio)); break;
    case 'precio_desc': FILTRADOS.sort((a,b) => (b.precioPublico || b.precio) - (a.precioPublico || a.precio)); break;
    case 'nombre_asc': FILTRADOS.sort((a,b) => a.nombre.localeCompare(b.nombre)); break;
    case 'nombre_desc': FILTRADOS.sort((a,b) => b.nombre.localeCompare(a.nombre)); break;
    case 'stock_desc': FILTRADOS.sort((a,b) => b.stock - a.stock); break;
    case 'stock_asc': FILTRADOS.sort((a,b) => a.stock - b.stock); break;
  }

  render();
}

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  const grid = $('grid');
  $('count').textContent = FILTRADOS.length;

  if(!FILTRADOS.length){
    grid.innerHTML = `<div class="empty"><i class="fa-regular fa-face-frown"></i><p>No se encontraron productos con esos filtros</p></div>`;
    $('pagination').innerHTML = '';
    return;
  }

  const totalPag = Math.ceil(FILTRADOS.length / PER_PAGE);
  if(PAGINA > totalPag) PAGINA = totalPag;
  if(PAGINA < 1) PAGINA = 1;

  const inicio = (PAGINA - 1) * PER_PAGE;
  const pag = FILTRADOS.slice(inicio, inicio + PER_PAGE);

  grid.innerHTML = pag.map((p, i) => {
    const color = getColor(p.marca);
    const icono = getIcon(p.categoria);
    const tieneFoto = !!p.imagen;
    const enCarrito = CARRITO.find(x => x.codigo === p.codigo && x.sede === p.sede);

    const esNuevo  = SET_NUEVOS.has(p.codigo);
    const esOferta = SET_OFERTAS.has(p.codigo);

    let stockPill = '';
    if(p.stock === 0){
      stockPill = `<span class="stock-pill agotado">Agotado</span>`;
    } else if(p.stock < 10){
      stockPill = `<span class="stock-pill bajo">Stock: ${p.stock}</span>`;
    } else {
      stockPill = `<span class="stock-pill">Stock: ${p.stock}</span>`;
    }

    const imgHTML = tieneFoto
      ? `<img class="thumb"
              src="${p.imagen}"
              alt="${p.nombre}"
              loading="lazy"
              onerror="var v=this.parentElement; this.remove(); if(v) v.classList.remove('con-foto');">`
      : '';

    const descripcion = p.nombreLargo || p.nombre;
    const precioFinal = p.precioPublico > 0 ? p.precioPublico : p.precio;

    return `
      <article class="card" style="animation-delay:${Math.min(i*0.02,0.4)}s">
        <div class="visual ${tieneFoto ? 'con-foto' : ''}" style="--mc:${color}"
             data-codigo="${p.codigo}"
             role="button" tabindex="0"
             aria-label="Ver ${p.nombre}">
          <div class="pattern"></div>
          ${imgHTML}
          ${esNuevo ? `<span class="badge-card badge-nuevo"><i class="fa-solid fa-star"></i> NUEVO</span>` : ''}
          ${esOferta ? `<span class="badge-card badge-oferta"><i class="fa-solid fa-tags"></i> OFERTA</span>` : ''}
          <i class="fa-solid ${icono} icon"></i>
          <div class="content">
            <span class="brand">${p.marca.substring(0,10)}</span>
            <span class="model">${p.modelo}</span>
            <span class="cat-tag">${p.categoria.substring(0,22)}</span>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square cam-hint"></i>
          <span class="tooltip">Clic para ver detalle</span>
        </div>
        <div class="info">
          <h3 class="title">${descripcion}</h3>
          <span class="code" data-code="${p.codigo}" title="Clic para copiar código">
            #${p.codigo} · ${p.sede}
            <i class="fa-regular fa-copy cp-ico"></i>
          </span>
          <div class="row">
            <div>
              <div class="price">${fmt(precioFinal)}</div>
            </div>
            ${stockPill}
          </div>
          <button class="btn-add-card ${enCarrito ? 'added' : ''}" data-add="${p.codigo}" data-sede="${p.sede}">
            <i class="fa-solid fa-${enCarrito ? 'check' : 'plus'}"></i>
            ${enCarrito ? 'En carrito' : 'Agregar'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Clic en la imagen → abrir URL del modal en nueva pestaña
  grid.querySelectorAll('.visual').forEach(el => {
    el.addEventListener('click', () => abrirUrlModal(el.dataset.codigo));
    el.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); abrirUrlModal(el.dataset.codigo); }
    });
  });

  // Copiar código al clic
  grid.querySelectorAll('.code').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const code = el.dataset.code;
      if(!code) return;

      const ok = await copiarTexto(code);
      el.classList.toggle('ok', ok);
      el.classList.toggle('err', !ok);

      const ico = el.querySelector('.cp-ico');
      const original = ico.className;
      ico.className = ok ? 'fa-solid fa-check cp-ico' : 'fa-solid fa-xmark cp-ico';

      setTimeout(() => {
        el.classList.remove('ok','err');
        ico.className = original;
      }, 1200);
    });
  });

  renderPaginacion(totalPag);
}

function renderPaginacion(total){
  const el = $('pagination');
  if(total <= 1){ el.innerHTML = ''; return; }

  let html = '';
  html += `<button ${PAGINA === 1 ? 'disabled' : ''} data-p="${PAGINA-1}">← Anterior</button>`;

  const rango = [];
  const delta = 2;
  for(let i = 1; i <= total; i++){
    if(i === 1 || i === total || (i >= PAGINA - delta && i <= PAGINA + delta)){
      rango.push(i);
    }
  }

  let prev = 0;
  rango.forEach(n => {
    if(prev && n - prev > 1) html += `<span class="dots">…</span>`;
    html += `<button class="${n === PAGINA ? 'active' : ''}" data-p="${n}">${n}</button>`;
    prev = n;
  });

  html += `<button ${PAGINA === total ? 'disabled' : ''} data-p="${PAGINA+1}">Siguiente →</button>`;
  el.innerHTML = html;

  el.querySelectorAll('button[data-p]').forEach(b => {
    b.addEventListener('click', () => {
      PAGINA = parseInt(b.dataset.p);
      render();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
}

/* ============================================================
   ABRIR URL DEL MODAL EN NUEVA PESTAÑA
   ============================================================ */
function abrirUrlModal(codigo){
  const p = TODOS.find(x => x.codigo === codigo);
  if(!p) return;

  if(p.urlModal && esUrlValida(p.urlModal)){
    window.open(p.urlModal, '_blank', 'noopener,noreferrer');
  } else {
    console.warn('⚠️ Sin url_modal para:', codigo);
    alert('Este producto no tiene link de detalle.');
  }
}

/* ============================================================
   CARRITO – ServiComp+ (v5)
   ============================================================ */
let toastTimer = null;

function toast(msg){
  const t = $('toast'); if(!t) return;
  t.querySelector('span').textContent = msg || 'Listo';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function cargarCarritoDeStorage(){
  try{
    const raw = localStorage.getItem(KEY_CARRITO);
    CARRITO = raw ? (JSON.parse(raw) || []) : [];
  } catch(e){ CARRITO = []; }
}

function guardarCarrito(){
  try{ localStorage.setItem(KEY_CARRITO, JSON.stringify(CARRITO)); }catch(e){}
}

/* -------- AGREGAR (con bloqueo/pregunta por sede) -------- */
function agregarAlCarrito(codigo, sede){
  const p = TODOS.find(x => x.codigo === codigo && (!sede || x.sede === sede))
         || TODOS.find(x => x.codigo === codigo);
  if(!p) return;

  const sedeEnCarrito = CARRITO.length ? CARRITO[0].sede : null;
  if(sedeEnCarrito && p.sede !== sedeEnCarrito){
    const ok = confirm(
      'Tu carrito tiene productos de la sede ' + sedeEnCarrito + '.\n\n' +
      '¿Vaciar el carrito y agregar este producto de ' + p.sede + '?'
    );
    if(!ok){
      toast('⚠️ Mantienes el carrito de ' + sedeEnCarrito);
      return;
    }
    CARRITO = [];
    guardarCarrito();
  }

  const ex = CARRITO.find(x => x.codigo === codigo && x.sede === p.sede);
  if(ex) ex.cantidad += 1;
  else CARRITO.push({
    codigo: p.codigo,
    descripcion: p.nombre,
    marca: p.marca,
    precio_publico: p.precioPublico > 0 ? p.precioPublico : p.precio,
    sede: p.sede,
    cantidad: 1
  });

  guardarCarrito();
  pintarCarrito();
  toast('✓ Agregado: ' + codigo);
}

/* -------- CAMBIAR CANTIDAD (por código + sede) -------- */
function cambiarCantidad(codigo, delta, sede){
  const it = CARRITO.find(x => x.codigo === codigo && (!sede || x.sede === sede));
  if(!it) return;
  it.cantidad += delta;
  if(it.cantidad <= 0){
    CARRITO = CARRITO.filter(x => !(x.codigo === codigo && x.sede === it.sede));
  }
  guardarCarrito();
  pintarCarrito();
}

/* -------- ELIMINAR (por código + sede) -------- */
function eliminarDelCarrito(codigo, sede){
  CARRITO = CARRITO.filter(x => !(x.codigo === codigo && (!sede || x.sede === sede)));
  guardarCarrito();
  pintarCarrito();
}

function vaciarCarrito(){
  if(!CARRITO.length) return;
  if(!confirm('¿Vaciar todo el carrito?')) return;
  CARRITO = [];
  guardarCarrito();
  pintarCarrito();
  toast('Carrito vaciado');
}

function calcularTotales(){
  const subtotal = CARRITO.reduce((s,x) => s + x.precio_publico * x.cantidad, 0);
  const envioEl = $('envioInput');
  const envio = parseFloat(envioEl ? envioEl.value : 0) || 0;
  return { subtotal, envio, total: subtotal + envio };
}

function actualizarTotales(){
  const { subtotal, envio, total } = calcularTotales();
  if($('cartSubtotal')) $('cartSubtotal').textContent = 'S/ ' + fmt2(subtotal);
  if($('cartEnvio'))    $('cartEnvio').textContent    = 'S/ ' + fmt2(envio);
  if($('cartTotal'))    $('cartTotal').textContent    = 'S/ ' + fmt2(total);
}

/* -------- PINTAR CARRITO (con data-sede en cada botón) -------- */
function pintarCarrito(){
  const body = $('cartBody');
  const badge = $('cartBadge');
  if(!body || !badge) return;

  const totalItems = CARRITO.reduce((s,x) => s + x.cantidad, 0);
  badge.textContent = totalItems;
  badge.classList.toggle('hidden', totalItems === 0);

  if(!CARRITO.length){
    body.innerHTML = `
      <div class="empty-cart">
        <i class="fa-regular fa-cart-plus"></i>
        Agrega productos desde el catálogo
      </div>`;
  } else {
    body.innerHTML = CARRITO.map(it => `
      <div class="cart-item">
        <div class="item-info">
          <div class="item-code">
            ${esc(it.codigo)}
            ${it.sede ? `<span class="item-sede">· ${esc(it.sede)}</span>` : ''}
          </div>
          <div class="item-name">${esc(it.descripcion)}</div>
          <div class="item-price">S/ ${fmt2(it.precio_publico)}</div>
        </div>
        <div class="item-qty">
          <button data-qty-dec="${esc(it.codigo)}" data-sede="${esc(it.sede)}">−</button>
          <span class="qty-num">${it.cantidad}</span>
          <button data-qty-inc="${esc(it.codigo)}" data-sede="${esc(it.sede)}">+</button>
        </div>
        <button class="item-remove" data-remove="${esc(it.codigo)}" data-sede="${esc(it.sede)}">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>`).join('');
  }

  actualizarTotales();

  document.querySelectorAll('.btn-add-card').forEach(btn => {
    const cod = btn.dataset.add;
    const sed = btn.dataset.sede;
    if(!cod) return;
    const en = CARRITO.find(x => x.codigo === cod && (!sed || x.sede === sed));
    btn.classList.toggle('added', !!en);
    btn.innerHTML = en
      ? '<i class="fa-solid fa-check"></i> En carrito'
      : '<i class="fa-solid fa-plus"></i> Agregar';
  });
}

function abrirCarrito(){
  const panel = $('cartPanel'); const ov = $('cartOverlay');
  if(panel) panel.classList.add('open');
  if(ov) ov.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito(){
  const panel = $('cartPanel'); const ov = $('cartOverlay');
  if(panel) panel.classList.remove('open');
  if(ov) ov.classList.remove('show');
  document.body.style.overflow = '';
}

/* ============================================================
   WHATSAPP
   ============================================================ */
function enviarWhatsApp(){
  if(!CARRITO.length){ toast('Agrega productos primero'); return; }

  const clienteEl = $('clienteNombre');
  const cliente = (clienteEl ? clienteEl.value.trim() : '') || 'Cliente';
  const { subtotal, envio, total } = calcularTotales();

  const lineas = CARRITO.map(x =>
    `• ${x.cantidad}x ${x.descripcion.substring(0,50)} — S/ ${fmt2(x.precio_publico * x.cantidad)}`
  ).join('\n');

  const texto =
    `¡Hola ServiComp+! 👋\n\n` +
    `Soy *${cliente}* y quiero cotizar:\n\n` +
    `*Productos:*\n${lineas}\n\n` +
    `*Subtotal:* S/ ${fmt2(subtotal)}\n` +
    `*Envío:* S/ ${fmt2(envio)}\n` +
    `*TOTAL:* S/ ${fmt2(total)}\n\n` +
    `¿Me confirman disponibilidad y tiempo de entrega?`;

  window.open('https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(texto), '_blank');
}

/* ============================================================
   PDF
   ============================================================ */
function exportarPDF(){
  if(!CARRITO.length){ toast('Agrega productos primero'); return; }

  if(typeof Swal === 'undefined' || typeof html2pdf === 'undefined'){
    alert('Librerías PDF no cargadas');
    return;
  }

  const clienteEl = $('clienteNombre');
  const cliente = (clienteEl ? clienteEl.value.trim() : '') || 'Cliente';
  const { subtotal, envio, total } = calcularTotales();
  const fecha = new Date().toLocaleDateString('es-PE');
  const hora  = new Date().toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });

  const filas = CARRITO.map(x => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eef2f6;font-size:12px;font-family:monospace;color:#0f2b47;font-weight:700;">${esc(x.codigo)}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f6;font-size:12px;color:#334155;">${esc(x.descripcion)}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f6;text-align:center;font-weight:600;">${x.cantidad}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f6;text-align:right;font-family:monospace;">S/ ${fmt2(x.precio_publico)}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f6;text-align:right;font-weight:700;font-family:monospace;color:#0f2b47;">S/ ${fmt2(x.precio_publico * x.cantidad)}</td>
    </tr>`).join('');

  const div = document.createElement('div');
  div.innerHTML = `
    <div style="padding:40px;font-family:Inter,sans-serif;max-width:820px;margin:0 auto;background:#fff;color:#0f172a;">
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0f2b47;padding-bottom:20px;margin-bottom:24px;">
        <div>
          <h2 style="font-size:24px;font-weight:900;color:#0f2b47;margin:0;letter-spacing:-.02em;">ServiComp<span style="color:#ef4444;">+</span></h2>
          <p style="color:#64748b;font-weight:500;font-size:12px;margin:6px 0 0;text-transform:uppercase;letter-spacing:.05em;">Soluciones Informáticas</p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;font-weight:800;">Cotización</div>
          <div style="font-size:14px;font-weight:700;color:#0f2b47;margin-top:4px;">${fecha} · ${hora}</div>
        </div>
      </div>

      <div style="background:#f8fafc;padding:14px 18px;border-radius:8px;margin-bottom:24px;border:1px solid #eef2f6;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:800;">Cliente</div>
        <div style="font-size:15px;font-weight:700;color:#0f172a;">${esc(cliente)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px;text-align:left;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">Código</th>
            <th style="padding:10px;text-align:left;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">Producto</th>
            <th style="padding:10px;text-align:center;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">Cant</th>
            <th style="padding:10px;text-align:right;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">P/U</th>
            <th style="padding:10px;text-align:right;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">Total</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <div style="margin-top:28px;text-align:right;">
        <div style="font-size:13px;color:#475569;padding:4px 0;font-weight:500;">Subtotal: <b style="color:#0f2b47;">S/ ${fmt2(subtotal)}</b></div>
        <div style="font-size:13px;color:#475569;padding:4px 0;font-weight:500;">Envío: <b style="color:#0f2b47;">S/ ${fmt2(envio)}</b></div>
        <div style="font-size:22px;font-weight:900;color:#0f2b47;padding-top:12px;border-top:2px solid #e2e8f0;letter-spacing:-.02em;">TOTAL: S/ ${fmt2(total)}</div>
      </div>

      <div style="margin-top:40px;padding-top:20px;border-top:1px dashed #cbd5e1;font-size:11px;color:#94a3b8;text-align:center;">
        ¡Gracias por tu preferencia! · WhatsApp: +51 973 952 322
      </div>
    </div>`;

  Swal.fire({
    title: 'Generando PDF...',
    text: 'Espera un momento',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  html2pdf()
    .set({
      margin: 0.4,
      filename: 'Cotizacion_ServiComp_' + Date.now() + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .from(div)
    .save()
    .then(() => Swal.close())
    .catch(e => {
      Swal.close();
      Swal.fire('Error', 'No se pudo generar el PDF: ' + e.message, 'error');
    });
}

/* ============================================================
   BIND CARRITO
   ============================================================ */
function bindCarrito(){
  const fab = $('fabCart');       if(fab) fab.addEventListener('click', abrirCarrito);
  const cc  = $('cartCloseBtn');  if(cc) cc.addEventListener('click', cerrarCarrito);
  const ov  = $('cartOverlay');   if(ov) ov.addEventListener('click', cerrarCarrito);
  const bv  = $('btnVaciar');     if(bv) bv.addEventListener('click', vaciarCarrito);
  const bw  = $('btnWhatsApp');   if(bw) bw.addEventListener('click', enviarWhatsApp);
  const bp  = $('btnPDF');        if(bp) bp.addEventListener('click', exportarPDF);
  const bpr = $('btnPrint');      if(bpr) bpr.addEventListener('click', () => window.print());
  const env = $('envioInput');    if(env) env.addEventListener('input', actualizarTotales);

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') cerrarCarrito();
  });

  document.body.addEventListener('click', e => {
    const t = e.target;

    const add = t.closest('[data-add]');
    if(add){ agregarAlCarrito(add.dataset.add, add.dataset.sede); return; }

    const dec = t.closest('[data-qty-dec]');
    if(dec){ cambiarCantidad(dec.dataset.qtyDec, -1, dec.dataset.sede); return; }

    const inc = t.closest('[data-qty-inc]');
    if(inc){ cambiarCantidad(inc.dataset.qtyInc, 1, inc.dataset.sede); return; }

    const rem = t.closest('[data-remove]');
    if(rem){ eliminarDelCarrito(rem.dataset.remove, rem.dataset.sede); return; }
  });
}

/* ================================================================ */
/* SERVICOMP+ - TIENDA.JS                                           */
/* Versión 3.2 - Colores por categoría (badge + botón +)            */
/* ================================================================ */

(function () {
  'use strict';

  // ================================================================
  // CONFIGURACIÓN
  // ================================================================
  const CONFIG = {
    URL_SHEET: 'URL_SHEET: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=329818076&single=true&output=csv',',
    WHATSAPP: '51973952322',
    POR_TANDA: 30,
    SEDE_DEFAULT: 'LIMA',
    KEY_CARRITO: 'servicomp_tienda_carrito_v3',
    CATEGORIAS_EXCLUIDAS: ['SERVICIO TECNICO', 'SERVICIOS OTROS', 'SERVICIOS VENTAS', 'ACCESORIOS', 'DELTRON', 'DELTRON PC'],
    MARCAS_EXCLUIDAS: ['ZZ OTRAS MARCAS', 'DELTRON'],
    COMPONENTES: [
      { selector: '#header-placeholder', file: 'components/header.html' },
      { selector: '#footer-placeholder', file: 'components/footer.html' },
      { selector: '#whatsapp-placeholder', file: 'components/whatsapp.html' }
    ]
  };

  // ================================================================
  // PALETA DE COLORES POR CATEGORÍA (10 colores + default)
  // ================================================================
  const COLORES_CATEGORIA = {
    'LAPTOPS':          { bg: '#dbeafe', text: '#1d4ed8' },
    'LAPTOP':           { bg: '#dbeafe', text: '#1d4ed8' },
    'COMPUTADORAS':     { bg: '#dbeafe', text: '#1d4ed8' },
    'PC':               { bg: '#dbeafe', text: '#1d4ed8' },
    'ALL IN ONE':       { bg: '#dbeafe', text: '#1d4ed8' },

    'MONITORES':        { bg: '#e0e7ff', text: '#4338ca' },
    'MONITOR':          { bg: '#e0e7ff', text: '#4338ca' },

    'COMPONENTES':      { bg: '#e6f7ed', text: '#059669' },
    'HARDWARE':         { bg: '#e6f7ed', text: '#059669' },

    'ALMACENAMIENTO':   { bg: '#f3e8ff', text: '#7c3aed' },
    'DISCOS':           { bg: '#f3e8ff', text: '#7c3aed' },
    'SSD':              { bg: '#f3e8ff', text: '#7c3aed' },

    'REDES':            { bg: '#fee2e2', text: '#b91c1c' },
    'NETWORKING':       { bg: '#fee2e2', text: '#b91c1c' },

    'PERIFERICOS':      { bg: '#fef3c7', text: '#b45309' },
    'MOUSE':            { bg: '#fef3c7', text: '#b45309' },
    'TECLADOS':         { bg: '#fef3c7', text: '#b45309' },

    'IMPRESORAS':       { bg: '#cffafe', text: '#0891b2' },
    'IMPRESORA':        { bg: '#cffafe', text: '#0891b2' },
    'TINTAS':           { bg: '#cffafe', text: '#0891b2' },
    'TONER':            { bg: '#cffafe', text: '#0891b2' },

    'AUDIO':            { bg: '#ffe4e6', text: '#be123c' },
    'PARLANTES':        { bg: '#ffe4e6', text: '#be123c' },

    'SOFTWARE':         { bg: '#ede9fe', text: '#6d28d9' },
    'LICENCIAS':        { bg: '#ede9fe', text: '#6d28d9' },

    'ACCESORIOS':       { bg: '#fce7f3', text: '#be185d' },
    'CABLES':           { bg: '#fce7f3', text: '#be185d' },

    'DEFAULT':          { bg: '#eef3f9', text: '#0f2b47' }
  };

  function getColorCategoria(categoria) {
    if (!categoria) return COLORES_CATEGORIA.DEFAULT;
    const cat = String(categoria).trim().toUpperCase();
    if (COLORES_CATEGORIA[cat]) return COLORES_CATEGORIA[cat];
    // Búsqueda parcial
    for (const key in COLORES_CATEGORIA) {
      if (key !== 'DEFAULT' && cat.includes(key)) {
        return COLORES_CATEGORIA[key];
      }
    }
    return COLORES_CATEGORIA.DEFAULT;
  }

  // ================================================================
  // ESTADO
  // ================================================================
  let DATA = [];
  let DATA_FILTRADA = [];
  let VISIBLES = 0;
  let CARRITO = [];
  let observerLoadMore = null;
  let debounceTimer = null;
  let toastTimer = null;

  // ================================================================
  // HELPERS
  // ================================================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const fmt2 = (n) => (n == null || isNaN(n)) ? '0.00'
    : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (n) => (n == null || isNaN(n)) ? '0'
    : Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ================================================================
  // 1. CARGA DE COMPONENTES
  // ================================================================
  async function cargarComponentes() {
    const promesas = CONFIG.COMPONENTES.map(({ selector, file }) => {
      const el = $(selector);
      if (!el) return Promise.resolve();
      return fetch(file)
        .then((res) => res.ok ? res.text() : Promise.reject('HTTP ' + res.status))
        .then((html) => { el.innerHTML = html; })
        .catch(() => { el.innerHTML = ''; });
    });
    await Promise.all(promesas);
  }

  // ================================================================
  // 2. CARGA DE DATOS
  // ================================================================
  async function cargarDatos() {
    const lista = $('#productsList');
    lista.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando catálogo premium...</p>
      </div>`;

    try {
      const r = await fetch(CONFIG.URL_SHEET + '&t=' + Date.now());
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buffer = await r.arrayBuffer();
      const texto = new TextDecoder('utf-8').decode(buffer);
      DATA = parsearCSV(texto);

      llenarFiltros();
      pintarFechaYTC();
      render();

    } catch (e) {
      lista.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Error al cargar: ${esc(e.message)}</p>
        </div>`;
    }
  }

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

    const headers = filas[0].map((h) => h.trim().toUpperCase());
    const idx = (name) => headers.indexOf(name);

    return filas.slice(1)
      .filter((f) => f.length >= 20 && f[idx('CODIGO')])
      .map((f) => ({
        sede: f[idx('SEDE')] || '',
        codigo: f[idx('CODIGO')] || '',
        categoria: f[idx('CATEGORIA')] || '',
        descripcion: (f[idx('DESCRIPCION_CORTA')] || '').toUpperCase(),
        stock: f[idx('STOCK')] || '',
        marca: f[idx('MARCA')] || '',
        tc_real: parseFloat(f[idx('TC_REAL')]) || 0,
        precio_publico: parseFloat(f[idx('PRECIO_PUBLICO')]) || null
      }))
      .filter((d) => !esStockCero(d.stock))
      .filter((d) => !esCategoriaExcluida(d.categoria))
      .filter((d) => !esMarcaExcluida(d.marca))
      .filter((d) => !empiezaConZZ(d.codigo))
      .filter((d) => d.precio_publico && d.precio_publico > 0);
  }

  const esStockCero = (stock) => {
    if (!stock) return true;
    const s = String(stock).trim();
    return s === '' || s === '0';
  };
  const esCategoriaExcluida = (cat) => {
    if (!cat) return false;
    const c = String(cat).trim().toUpperCase();
    return CONFIG.CATEGORIAS_EXCLUIDAS.some((ex) => c === ex);
  };
  const esMarcaExcluida = (marca) => {
    if (!marca) return false;
    const m = String(marca).trim().toUpperCase();
    return CONFIG.MARCAS_EXCLUIDAS.some((ex) => m === ex);
  };
  const empiezaConZZ = (codigo) => codigo
    ? String(codigo).trim().toLowerCase().startsWith('zz')
    : false;

  const normalizaStock = (s) => {
    if (!s) return { txt: '—', cls: 'stock-critical' };
    if (/^>\d+$/.test(s)) return { txt: s.slice(1) + '+', cls: 'stock-available' };
    if (/^\d+\+$/.test(s)) return { txt: s, cls: 'stock-available' };
    const n = parseInt(s);
    if (isNaN(n)) return { txt: s, cls: 'stock-available' };
    if (n === 0) return { txt: '0', cls: 'stock-critical' };
    if (n <= 2) return { txt: n, cls: 'stock-critical' };
    if (n <= 5) return { txt: n, cls: 'stock-low' };
    return { txt: n, cls: 'stock-available' };
  };

  function pintarFechaYTC() {
    const ahora = new Date();
    const fechaFmt = ahora.toLocaleDateString('es-PE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const el = $('#fechaDisplay');
    if (el) el.textContent = fechaFmt.charAt(0).toUpperCase() + fechaFmt.slice(1);

    const tc = $('#tcDisplay');
    if (tc && DATA[0] && DATA[0].tc_real > 0) {
      tc.textContent = 'S/ ' + DATA[0].tc_real.toFixed(2);
    }
  }

  // ================================================================
  // 3. FILTROS
  // ================================================================
  function llenarFiltros() {
    const sedes = [...new Set(DATA.map((d) => d.sede).filter(Boolean))].sort();
    const cats = [...new Set(DATA.map((d) => d.categoria).filter(Boolean))].sort();
    const marcas = [...new Set(DATA.map((d) => d.marca).filter(Boolean))].sort();

    const sedeSel = $('#sedeSelect');
    sedeSel.innerHTML = sedes.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
    const opcionLima = [...sedeSel.options].find((o) => o.value.toUpperCase() === CONFIG.SEDE_DEFAULT);
    if (opcionLima) sedeSel.value = opcionLima.value;

    $('#catSelect').innerHTML = '<option value="">Todas las categorías</option>' +
      cats.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
    $('#marcaSelect').innerHTML = '<option value="">Todas las marcas</option>' +
      marcas.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  }

  function renderDebounced() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 150);
  }

  function render() {
    const q = $('#searchInput').value.toLowerCase().trim();
    const fSede = $('#sedeSelect').value;
    const fCat = $('#catSelect').value;
    const fMarca = $('#marcaSelect').value;
    const orden = $('#ordenSelect').value;

    const terminos = q ? q.split(/\s+/).filter(Boolean) : [];

    DATA_FILTRADA = DATA.filter((d) => {
      if (fSede && d.sede !== fSede) return false;
      if (fCat && d.categoria !== fCat) return false;
      if (fMarca && d.marca !== fMarca) return false;
      if (terminos.length > 0) {
        const txt = (d.codigo + ' ' + d.descripcion + ' ' + d.marca + ' ' + d.categoria).toLowerCase();
        if (!terminos.every((t) => txt.includes(t))) return false;
      }
      return true;
    });

    if (orden === 'precio_desc') {
      DATA_FILTRADA.sort((a, b) => (b.precio_publico ?? -1) - (a.precio_publico ?? -1));
    } else if (orden === 'codigo_az') {
      DATA_FILTRADA.sort((a, b) => a.codigo.localeCompare(b.codigo));
    } else {
      DATA_FILTRADA.sort((a, b) => (a.precio_publico ?? 1e18) - (b.precio_publico ?? 1e18));
    }

    $('#resultsCount').textContent = DATA_FILTRADA.length;

    VISIBLES = 0;
    $('#productsList').innerHTML = '';

    if (DATA_FILTRADA.length === 0) {
      $('#productsList').innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>No encontramos productos con esos filtros.</p>
        </div>`;
      return;
    }

    $('#productsList').innerHTML = `
      <div class="products-table-wrap">
        <table class="products-table">
          <thead>
            <tr>
              <th style="width:56px;"></th>
              <th>Código</th>
              <th>Producto</th>
              <th>Marca</th>
              <th class="centro">Stock</th>
              <th class="num">Precio</th>
              <th class="centro">Agregar</th>
            </tr>
          </thead>
          <tbody id="tbodyProducts"></tbody>
        </table>
      </div>
      <div class="products-cards-mobile" id="cardsProducts"></div>`;

    cargarMas();
  }

  function cargarMas() {
    if (VISIBLES >= DATA_FILTRADA.length) return;
    const tbody = $('#tbodyProducts');
    const cards = $('#cardsProducts');
    if (!tbody || !cards) return;

    const limite = Math.min(VISIBLES + CONFIG.POR_TANDA, DATA_FILTRADA.length);
    const batch = DATA_FILTRADA.slice(VISIBLES, limite);

    tbody.insertAdjacentHTML('beforeend', batch.map(renderFila).join(''));
    cards.insertAdjacentHTML('beforeend', batch.map(renderCardMobile).join(''));

    VISIBLES = limite;
    if (VISIBLES < DATA_FILTRADA.length) setTimeout(observarLoadMore, 80);
  }

  // ================================================================
  // 4. RENDER FILA (DESKTOP)
  // ================================================================
  function renderFila(d) {
    const st = normalizaStock(d.stock);
    const enCarrito = CARRITO.find((x) => x.codigo === d.codigo);
    const img = getImagenDeltron(d.codigo);
    const color = getColorCategoria(d.categoria);

    return `
      <tr data-codigo="${esc(d.codigo)}">
        <td class="thumb-cell">
          <a href="${img}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="Ver foto">
            <i class="fa-solid fa-camera thumb-placeholder"></i>
            <img src="${img}" alt="${esc(d.codigo)}" loading="lazy"
                 onload="this.classList.add('loaded')"
                 onerror="this.classList.add('error'); this.style.display='none';">
          </a>
        </td>
        <td>
          <span class="code-cell" data-copy="${esc(d.codigo)}" title="Copiar código">
            ${esc(d.codigo)} <i class="fa-regular fa-copy"></i>
          </span>
        </td>
        <td class="desc-cell">${esc(d.descripcion)}</td>
        <td>
          <span class="brand-badge" style="background:${color.bg}; color:${color.text}; border-color:${color.text}33;">
            <i class="fa-solid fa-tag"></i> ${esc(d.marca || '—')}
          </span>
        </td>
        <td class="centro">
          <span class="stock-pill ${st.cls}">${st.txt}</span>
        </td>
        <td class="num">
          <span class="price-cell"><span class="currency">S/</span>${fmt0(d.precio_publico)}</span>
        </td>
        <td class="centro">
          <button class="btn-add-row ${enCarrito ? 'added' : ''}"
                  data-add="${esc(d.codigo)}"
                  style="${enCarrito ? '' : `background: linear-gradient(135deg, ${color.text} 0%, ${color.text}cc 100%); box-shadow: 0 3px 8px ${color.text}40;`}"
                  title="${enCarrito ? 'Agregar otra unidad' : 'Agregar al carrito'}">
            <i class="fa-solid fa-${enCarrito ? 'check' : 'plus'}"></i>
          </button>
        </td>
      </tr>`;
  }

  function getImagenDeltron(codigo) {
    const c = String(codigo).trim().toUpperCase();
    return 'https://www.deltron.com.pe/modulos/productos/items/image_ext.php?item=' +
      encodeURIComponent(c) + '&nomenu=1';
  }

  // ================================================================
  // 5. RENDER CARD (MÓVIL)
  // ================================================================
  function renderCardMobile(d) {
    const st = normalizaStock(d.stock);
    const enCarrito = CARRITO.find((x) => x.codigo === d.codigo);
    const img = getImagenDeltron(d.codigo);
    const color = getColorCategoria(d.categoria);

    return `
      <div class="product-card-mobile" data-codigo="${esc(d.codigo)}">
        <div class="pcm-main">
          <a href="${img}" target="_blank" rel="noopener noreferrer" class="pcm-thumb" title="Ver foto">
            <i class="fa-solid fa-camera pcm-thumb-placeholder"></i>
            <img src="${img}" alt="${esc(d.codigo)}" loading="lazy"
                 onload="this.classList.add('loaded')"
                 onerror="this.classList.add('error'); this.style.display='none';">
          </a>
          <div class="pcm-info">
            <div class="pcm-top">
              <span class="pcm-code" data-copy="${esc(d.codigo)}">
                ${esc(d.codigo)} <i class="fa-regular fa-copy"></i>
              </span>
              <span class="stock-pill ${st.cls} pcm-stock">${st.txt}</span>
            </div>
            <div class="pcm-desc">${esc(d.descripcion)}</div>
          </div>
        </div>
        <div class="pcm-footer">
          <span class="pcm-brand" style="color:${color.text};">
            <i class="fa-solid fa-tag"></i> ${esc(d.marca || '—')}
          </span>
          <span class="pcm-price"><span class="currency">S/</span>${fmt0(d.precio_publico)}</span>
          <button class="pcm-add ${enCarrito ? 'added' : ''}"
                  data-add="${esc(d.codigo)}"
                  style="${enCarrito ? '' : `background: linear-gradient(135deg, ${color.text} 0%, ${color.text}cc 100%); box-shadow: 0 3px 10px ${color.text}40;`}">
            <i class="fa-solid fa-${enCarrito ? 'check' : 'plus'}"></i>
          </button>
        </div>
      </div>`;
  }

  // ================================================================
  // 6. SCROLL INFINITO
  // ================================================================
  function observarLoadMore() {
    if (observerLoadMore) observerLoadMore.disconnect();
    const trigger = $('#loadMoreTrigger');
    if (!trigger) return;
    observerLoadMore = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && VISIBLES < DATA_FILTRADA.length) cargarMas();
    }, { rootMargin: '500px' });
    observerLoadMore.observe(trigger);
  }

  // ================================================================
  // 7. COPIAR CÓDIGO
  // ================================================================
  function copiarCodigo(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => mostrarToast('Código copiado: ' + texto))
        .catch(() => fallbackCopiar(texto));
    } else fallbackCopiar(texto);
  }
  function fallbackCopiar(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); mostrarToast('Código copiado: ' + texto); } catch (e) {}
    ta.remove();
  }
  function mostrarToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.querySelector('span').textContent = msg || 'Copiado';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // ================================================================
  // 8. CARRITO
  // ================================================================
  function cargarCarritoDeStorage() {
    try {
      const raw = localStorage.getItem(CONFIG.KEY_CARRITO);
      if (raw) CARRITO = JSON.parse(raw) || [];
    } catch (e) { CARRITO = []; }
  }
  function guardarCarrito() {
    try { localStorage.setItem(CONFIG.KEY_CARRITO, JSON.stringify(CARRITO)); } catch (e) {}
  }

  function agregarAlCarrito(codigo) {
    const prod = DATA.find((d) => d.codigo === codigo);
    if (!prod) { mostrarToast('Producto no encontrado'); return; }

    const existe = CARRITO.find((x) => x.codigo === codigo);
    if (existe) existe.cantidad += 1;
    else CARRITO.push({
      codigo: prod.codigo,
      descripcion: prod.descripcion,
      marca: prod.marca,
      precio_publico: prod.precio_publico,
      cantidad: 1
    });

    guardarCarrito();
    actualizarCarritoUI();
    mostrarToast('✓ Agregado: ' + codigo);
  }

  function cambiarCantidad(codigo, delta) {
    const item = CARRITO.find((x) => x.codigo === codigo);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) CARRITO = CARRITO.filter((x) => x.codigo !== codigo);
    guardarCarrito();
    actualizarCarritoUI();
  }

  function eliminarDelCarrito(codigo) {
    CARRITO = CARRITO.filter((x) => x.codigo !== codigo);
    guardarCarrito();
    actualizarCarritoUI();
  }

  function vaciarCarrito() {
    if (CARRITO.length === 0) return;
    if (!confirm('¿Vaciar todo el carrito?')) return;
    CARRITO = [];
    guardarCarrito();
    actualizarCarritoUI();
    mostrarToast('Carrito vaciado');
  }

  function calcularTotales() {
    const subtotal = CARRITO.reduce((s, x) => s + (x.precio_publico * x.cantidad), 0);
    const envioEl = $('#envioInput');
    const envio = parseFloat(envioEl ? envioEl.value : 0) || 0;
    return { subtotal, envio, total: subtotal + envio };
  }

  function actualizarTotales() {
    const { subtotal, envio, total } = calcularTotales();
    const s = $('#cartSubtotal'); if (s) s.textContent = 'S/ ' + fmt2(subtotal);
    const e = $('#cartEnvio'); if (e) e.textContent = 'S/ ' + fmt2(envio);
    const t = $('#cartTotal'); if (t) t.textContent = 'S/ ' + fmt2(total);
  }

  function actualizarCarritoUI() {
    const body = $('#cartBody');
    const badge = $('#cartBadge');
    if (!body || !badge) return;

    const totalItems = CARRITO.reduce((s, x) => s + x.cantidad, 0);
    badge.textContent = totalItems;
    badge.classList.toggle('hidden', totalItems === 0);

    if (CARRITO.length === 0) {
      body.innerHTML = `
        <div class="empty-cart">
          <i class="fa-regular fa-cart-plus"></i>
          Agrega productos desde el catálogo
        </div>`;
    } else {
      body.innerHTML = CARRITO.map((item) => `
        <div class="cart-item">
          <div class="item-info">
            <div class="item-code">${esc(item.codigo)}</div>
            <div class="item-name">${esc(item.descripcion)}</div>
            <div class="item-price">S/ ${fmt2(item.precio_publico)}</div>
          </div>
          <div class="item-qty">
            <button data-qty-dec="${esc(item.codigo)}">−</button>
            <span class="qty-num">${item.cantidad}</span>
            <button data-qty-inc="${esc(item.codigo)}">+</button>
          </div>
          <button class="item-remove" data-remove="${esc(item.codigo)}">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>`).join('');
    }

    actualizarTotales();

    // Refrescar botones "+" en tabla y cards (respetando color de categoría)
    $$('.products-table tbody tr, .product-card-mobile').forEach((el) => {
      const cod = el.dataset.codigo;
      if (!cod) return;
      const enC = CARRITO.find((x) => x.codigo === cod);
      const btn = el.querySelector('.btn-add-row, .pcm-add');
      if (btn) {
        btn.classList.toggle('added', !!enC);
        if (enC) {
          // Si está en carrito: verde
          btn.style.background = '';
          btn.style.boxShadow = '';
        } else {
          // Si no está: color de categoría
          const prod = DATA.find((d) => d.codigo === cod);
          if (prod) {
            const color = getColorCategoria(prod.categoria);
            btn.style.background = `linear-gradient(135deg, ${color.text} 0%, ${color.text}cc 100%)`;
            btn.style.boxShadow = `0 3px 8px ${color.text}40`;
          }
        }
        btn.innerHTML = `<i class="fa-solid fa-${enC ? 'check' : 'plus'}"></i>`;
      }
    });
  }

  function abrirCarrito() {
    $('#cartPanel').classList.add('open');
    $('#cartOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function cerrarCarrito() {
    $('#cartPanel').classList.remove('open');
    $('#cartOverlay').classList.remove('show');
    document.body.style.overflow = '';
  }

  // ================================================================
  // 9. WHATSAPP
  // ================================================================
  function enviarWhatsApp() {
    if (CARRITO.length === 0) { mostrarToast('Agrega productos primero'); return; }

    const clienteEl = $('#clienteNombre');
    const cliente = (clienteEl ? clienteEl.value.trim() : '') || 'Cliente';
    const { subtotal, envio, total } = calcularTotales();

    const lineas = CARRITO.map((x) =>
      `• ${x.cantidad}x ${x.descripcion.substring(0, 50)} — S/ ${fmt2(x.precio_publico * x.cantidad)}`
    ).join('\n');

    const texto =
      `¡Hola ServiComp+! 👋\n\n` +
      `Soy *${cliente}* y quiero cotizar:\n\n` +
      `*Productos:*\n${lineas}\n\n` +
      `*Subtotal:* S/ ${fmt2(subtotal)}\n` +
      `*Envío:* S/ ${fmt2(envio)}\n` +
      `*TOTAL:* S/ ${fmt2(total)}\n\n` +
      `¿Me confirman disponibilidad y tiempo de entrega?`;

    window.open('https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank');
  }

  // ================================================================
  // 10. PDF
  // ================================================================
  function exportarPDF() {
    if (CARRITO.length === 0) { mostrarToast('Agrega productos primero'); return; }

    const clienteEl = $('#clienteNombre');
    const cliente = (clienteEl ? clienteEl.value.trim() : '') || 'Cliente';
    const { subtotal, envio, total } = calcularTotales();
    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const filas = CARRITO.map((x) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eef2f6;font-size:12px;font-family:monospace;color:#0f2b47;font-weight:700;">${esc(x.codigo)}</td>
        <td style="padding:10px;border-bottom:1px solid #eef2f6;font-size:12px;color:#334155;">${esc(x.descripcion)}</td>
        <td style="padding:10px;border-bottom:1px solid #eef2f6;text-align:center;font-size:12px;font-weight:600;">${x.cantidad}</td>
        <td style="padding:10px;border-bottom:1px solid #eef2f6;text-align:right;font-size:12px;font-family:monospace;">S/ ${fmt2(x.precio_publico)}</td>
        <td style="padding:10px;border-bottom:1px solid #eef2f6;text-align:right;font-size:12px;font-weight:700;font-family:monospace;color:#0f2b47;">S/ ${fmt2(x.precio_publico * x.cantidad)}</td>
      </tr>`).join('');

    const printDiv = document.createElement('div');
    printDiv.innerHTML = `
      <div style="padding:40px;font-family:'Inter',sans-serif;max-width:820px;margin:0 auto;background:#fff;color:#0f172a;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f2b47;padding-bottom:20px;margin-bottom:24px;">
          <div>
            <h2 style="font-size:24px;font-weight:900;color:#0f2b47;margin:0;letter-spacing:-0.02em;">ServiComp<span style="color:#dc3545;">+</span></h2>
            <p style="color:#64748b;font-weight:500;font-size:12px;margin:6px 0 0;letter-spacing:0.05em;text-transform:uppercase;">Soluciones Informáticas</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;font-weight:800;">Cotización</div>
            <div style="font-size:14px;font-weight:700;color:#0f2b47;margin-top:4px;">${fecha} · ${hora}</div>
          </div>
        </div>

        <div style="background:#f8fafc;padding:14px 18px;border-radius:8px;margin-bottom:24px;border:1px solid #eef2f6;">
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:800;margin-bottom:4px;">Cliente</div>
          <div style="font-size:15px;font-weight:700;color:#0f172a;">${esc(cliente)}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:12px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;font-weight:800;border-bottom:2px solid #e2e8f0;">Código</th>
              <th style="padding:12px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;font-weight:800;border-bottom:2px solid #e2e8f0;">Producto</th>
              <th style="padding:12px 10px;text-align:center;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;font-weight:800;border-bottom:2px solid #e2e8f0;">Cant</th>
              <th style="padding:12px 10px;text-align:right;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;font-weight:800;border-bottom:2px solid #e2e8f0;">P/U</th>
              <th style="padding:12px 10px;text-align:right;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:0.08em;font-weight:800;border-bottom:2px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>

        <div style="margin-top:28px;text-align:right;padding-top:16px;">
          <div style="font-size:13px;color:#475569;padding:5px 0;font-weight:500;">Subtotal: <b style="color:#0f2b47;">S/ ${fmt2(subtotal)}</b></div>
          <div style="font-size:13px;color:#475569;padding:5px 0;font-weight:500;">Envío: <b style="color:#0f2b47;">S/ ${fmt2(envio)}</b></div>
          <div style="font-size:24px;font-weight:900;color:#0f2b47;padding-top:14px;border-top:2px solid #e2e8f0;margin-top:10px;letter-spacing:-0.02em;">TOTAL: S/ ${fmt2(total)}</div>
        </div>

        <div style="margin-top:40px;padding-top:24px;border-top:1px dashed #cbd5e1;font-size:11px;color:#94a3b8;text-align:center;letter-spacing:0.04em;">
          ¡Gracias por tu preferencia! · WhatsApp: +51 973 952 322
        </div>
      </div>`;

    if (typeof Swal === 'undefined' || typeof html2pdf === 'undefined') {
      alert('Error: librerías no cargadas');
      return;
    }

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
      .from(printDiv)
      .save()
      .then(() => Swal.close())
      .catch((e) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo generar el PDF: ' + e.message, 'error');
      });
  }

  // ================================================================
  // 11. EVENTOS
  // ================================================================
  function bindEventos() {
    const search = $('#searchInput');
    if (search) search.addEventListener('input', renderDebounced);
    ['sedeSelect', 'catSelect', 'marcaSelect', 'ordenSelect'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', render);
    });

    const envio = $('#envioInput');
    if (envio) envio.addEventListener('input', actualizarTotales);

    const fabCart = $('#fabCart'); if (fabCart) fabCart.addEventListener('click', abrirCarrito);
    const cartClose = $('#cartCloseBtn'); if (cartClose) cartClose.addEventListener('click', cerrarCarrito);
    const overlay = $('#cartOverlay'); if (overlay) overlay.addEventListener('click', cerrarCarrito);
    const btnPrint = $('#btnPrint'); if (btnPrint) btnPrint.addEventListener('click', () => window.print());
    const btnVaciar = $('#btnVaciar'); if (btnVaciar) btnVaciar.addEventListener('click', vaciarCarrito);
    const btnWsp = $('#btnWhatsApp'); if (btnWsp) btnWsp.addEventListener('click', enviarWhatsApp);
    const btnPDF = $('#btnPDF'); if (btnPDF) btnPDF.addEventListener('click', exportarPDF);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarCarrito(); });

    document.body.addEventListener('click', (e) => {
      const t = e.target;

      const copyEl = t.closest('[data-copy]');
      if (copyEl) { copiarCodigo(copyEl.dataset.copy); return; }

      const addEl = t.closest('[data-add]');
      if (addEl) { agregarAlCarrito(addEl.dataset.add); return; }

      const qtyDec = t.closest('[data-qty-dec]');
      if (qtyDec) { cambiarCantidad(qtyDec.dataset.qtyDec, -1); return; }
      const qtyInc = t.closest('[data-qty-inc]');
      if (qtyInc) { cambiarCantidad(qtyInc.dataset.qtyInc, 1); return; }
      const rem = t.closest('[data-remove]');
      if (rem) { eliminarDelCarrito(rem.dataset.remove); return; }
    });
  }

  // ================================================================
  // 12. INIT
  // ================================================================
  async function init() {
    cargarCarritoDeStorage();
    actualizarCarritoUI();
    bindEventos();

    await cargarComponentes();

    const activeLink = document.querySelector('.nav-desktop a[data-page="tienda"]');
    if (activeLink) activeLink.classList.add('active');

    await cargarDatos();

    console.log('✅ ServiComp+ Tienda inicializada');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

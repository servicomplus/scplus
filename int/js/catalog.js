// ============================================================
// CATALOG · render de tabla/cards, filtros, scroll
// ============================================================

function llenarSedeDropdown(filas) {
  const sedes = [...new Set(filas.map(d => d.sede).filter(Boolean))].sort();
  const sel = document.getElementById('sedeHeader');
  sel.innerHTML = sedes.map(s =>
    `<option value="${esc(s)}">${esc(s)}</option>`
  ).join('');

  // Re-asignar el valor actual (evita que el navegador resetee al primer <option>)
  if (SEDE_ACTUAL && sedes.includes(SEDE_ACTUAL)) {
    sel.value = SEDE_ACTUAL;
  }
}

function cambiarSede(nuevaSede) {
  if (!nuevaSede || nuevaSede === SEDE_ACTUAL) return;

  if (CARRITO.length > 0) {
    const ok = confirm(
      'Al cambiar a la sede ' + nuevaSede + ' se vaciará el carrito.\n\n' +
      '¿Continuar?'
    );
    if (!ok) {
      document.getElementById('sedeHeader').value = SEDE_ACTUAL;
      return;
    }
    CARRITO = [];
    guardarCarritoEnStorage();
  }

  SEDE_ACTUAL = nuevaSede;
  localStorage.setItem(KEY_SEDE, SEDE_ACTUAL);
  actualizarCarritoUI();
  actualizarSedeTags();
  cargarDatos();
}

function actualizarSedeTags() {
  document.getElementById('cartSedeTag').textContent = SEDE_ACTUAL || '—';
}

function llenarFiltros() {
  const cats = [...new Set(DATA.map(d => d.categoria).filter(Boolean))].sort();
  const marcas = [...new Set(DATA.map(d => d.marca).filter(Boolean))].sort();

  document.getElementById('cat').innerHTML = '<option value="">Todas las categorías</option>' +
    cats.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  document.getElementById('marca').innerHTML = '<option value="">Todas las marcas</option>' +
    marcas.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  document.getElementById('s_total').textContent = DATA.length;
  document.getElementById('s_cat').textContent = cats.length;
  document.getElementById('s_marca').textContent = marcas.length;
}

const renderDebounced = debounce(() => render(), 150);

function render() {
  const q = norm(document.getElementById('q').value.trim());
  const fCat = document.getElementById('cat').value;
  const fMarca = document.getElementById('marca').value;
  const orden = document.getElementById('orden').value;

  const terminos = q ? q.split(/\s+/).filter(Boolean) : [];

  DATA_FILTRADA = DATA.filter(d => {
    if (fCat && d.categoria !== fCat) return false;
    if (fMarca && d.marca !== fMarca) return false;
    if (MOSTRAR_SOLO_FAVORITOS && !esFavorito(d.codigo)) return false;
    if (terminos.length > 0) {
      const txt = norm(d.codigo + ' ' + d.descripcion + ' ' + d.marca + ' ' + d.categoria);
      if (!terminos.every(t => txt.includes(t))) return false;
    }
    if (!pasaFiltroBadge(d)) return false;
    return true;
  });

  if (orden === 'favoritos_primero') {
    DATA_FILTRADA.sort((a, b) => {
      const fa = esFavorito(a.codigo) ? 1 : 0;
      const fb = esFavorito(b.codigo) ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return a.codigo.localeCompare(b.codigo);
    });
  } else if (orden === 'precio_desc') {
    DATA_FILTRADA.sort((a, b) => (b.precio_publico ?? -1) - (a.precio_publico ?? -1));
  } else if (orden === 'codigo_az') {
    DATA_FILTRADA.sort((a, b) => a.codigo.localeCompare(b.codigo));
  } else {
    DATA_FILTRADA.sort((a, b) => (a.precio_publico ?? 1e18) - (b.precio_publico ?? 1e18));
  }

  VISIBLES = 0;
  document.getElementById('tbody').innerHTML = '';
  document.getElementById('cardsWrap').innerHTML = '';
  document.getElementById('s_show').textContent = DATA_FILTRADA.length;

  if (DATA_FILTRADA.length === 0) {
    document.getElementById('empty').style.display = 'block';
    document.getElementById('loader').classList.add('hidden');
    return;
  }
  document.getElementById('empty').style.display = 'none';
  cargarMas();
}

function cargarMas() {
  if (VISIBLES >= DATA_FILTRADA.length) {
    document.getElementById('loader').classList.add('hidden');
    return;
  }

  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');

  const tb = document.getElementById('tbody');
  const cards = document.getElementById('cardsWrap');
  const fragT = document.createDocumentFragment();
  const fragC = document.createDocumentFragment();
  const limite = Math.min(VISIBLES + POR_TANDA, DATA_FILTRADA.length);

  for (let i = VISIBLES; i < limite; i++) {
    const d = DATA_FILTRADA[i];
    const st = normalizaStock(d.stock);
    const imgUrl = getImagenPHP(d.codigo);
    const fichaUrl = getFichaPHP(d.codigo);

    const usdEnSoles = d.precio_usd * d.tc_real;
    const usdConIvg = usdEnSoles * 1.18;

    const tooltipUSD = `
      <span class="label">USD:</span> <span class="value">$ ${fmt2(d.precio_usd)}</span><br>
      <span class="label">TC real:</span> <span class="value">${d.tc_real.toFixed(2)}</span><br>
      <span class="label">PEN (USD × TC):</span> <span class="value">S/ ${fmt2(usdEnSoles)}</span><br>
      <span class="label">PEN + IGV (18%):</span> <span class="total">S/ ${fmt2(usdConIvg)}</span>
    `;
    const tooltipMargen = `
      <span class="label">SKU:</span> <span class="sku">${esc(d.sku)}</span><br>
      <span class="label">Ganancia:</span> <span class="value">S/ ${fmt2(d.ganancia_soles)}</span>
    `;
    const tooltipPublico = `
      <span class="label">Valor venta:</span> <span class="value">S/ ${fmt2(d.valor_venta)}</span><br>
      <span class="label">IGV (18%):</span> <span class="value">S/ ${fmt2(d.igv)}</span><br>
      <span class="label">Total:</span> <span class="total">S/ ${fmt2(d.precio_publico)}</span>
    `;

    const enCarrito = CARRITO.find(x => x.codigo === d.codigo && x.sede === d.sede);
    const prodJson = encodeURIComponent(JSON.stringify({
      codigo: d.codigo,
      descripcion: d.descripcion,
      marca: d.marca,
      precio_publico: d.precio_publico,
      sede: d.sede
    }));

    const esFav = esFavorito(d.codigo);

    // Botón ☆/⭐ (siempre visible) — alterna favorito
    const btnFavHtml = `<button class="btn-fav ${esFav ? 'active' : ''}"
      data-fav-toggle="${esc(d.codigo)}"
      title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
        <i class="fa-${esFav ? 'solid' : 'regular'} fa-star"></i>
      </button>`;

    const btnAddHtml = `<button class="btn-add" data-prod="${prodJson}" title="Agregar al carrito">
        <i class="fa-solid ${enCarrito ? 'fa-check' : 'fa-plus'}"></i> ${enCarrito ? 'En carrito (' + enCarrito.cantidad + ')' : 'Agregar'}
      </button>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="thumb-cell">
        <a class="icon-btn" href="${imgUrl}" target="_blank" rel="noopener noreferrer" title="Ver foto">
          <i class="fa-solid fa-camera"></i>
        </a>
        <a class="icon-btn" href="${fichaUrl}" target="_blank" rel="noopener noreferrer" title="Ver especificaciones">
          <i class="fa-solid fa-magnifying-glass"></i>
        </a>
      </td>
      <td class="code">
        <span class="code-click" data-copy="${esc(d.codigo)}" data-copy-msg="Código copiado">
          ${esc(d.codigo)} <i class="fa-regular fa-copy"></i>
        </span>
      </td>
      <td class="desc">${esc(d.descripcion)}${renderBadges(d)}</td>
      <td class="${st.cls}">${esc(st.txt)}</td>
      <td class="price">
        <span class="tooltip-trigger" data-tooltip="${encodeTooltip(tooltipUSD)}">$ ${fmt2(d.precio_usd)}</span>
      </td>
      <td class="valor-venta">
        <span class="valor-venta-click" data-copy="${fmt2(d.valor_venta)}" data-copy-msg="Valor copiado">
          S/ ${fmt2(d.valor_venta)} <i class="fa-regular fa-copy"></i>
        </span>
      </td>
      <td class="margen">
        <span class="tooltip-trigger" data-tooltip="${encodeTooltip(tooltipMargen)}">${esc(d.ganancia_real)}</span>
      </td>
      <td class="price-public">
        <span class="tooltip-trigger" data-tooltip="${encodeTooltip(tooltipPublico)}">S/ ${fmt0(d.precio_publico)}</span>
      </td>
      <td>${esc(d.marca)}</td>
      <td style="white-space:nowrap;">
        ${btnFavHtml} ${btnAddHtml}
      </td>
    `;
    fragT.appendChild(tr);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-code" data-copy="${esc(d.codigo)}" data-copy-msg="Código copiado">
          ${esc(d.codigo)} <i class="fa-regular fa-copy"></i>
        </span>
        <div class="card-icons">
          <a class="icon-btn" href="${imgUrl}" target="_blank" rel="noopener noreferrer" title="Ver foto">
            <i class="fa-solid fa-camera"></i>
          </a>
          <a class="icon-btn" href="${fichaUrl}" target="_blank" rel="noopener noreferrer" title="Ver especificaciones">
            <i class="fa-solid fa-magnifying-glass"></i>
          </a>
        </div>
      </div>
      <div class="card-desc">${esc(d.descripcion)}${renderBadges(d)}</div>
      <div class="card-prices">
        <div class="card-price-item">
          <span class="label">USD</span>
          <span class="value usd tooltip-trigger" data-tooltip="${encodeTooltip(tooltipUSD)}">$ ${fmt2(d.precio_usd)}</span>
        </div>
        <div class="card-price-item">
          <span class="label">Margen</span>
          <span class="value margen tooltip-trigger" data-tooltip="${encodeTooltip(tooltipMargen)}">${esc(d.ganancia_real)}</span>
        </div>
        <div class="card-price-item">
          <span class="label">Valor Venta</span>
          <span class="value venta" data-copy="${fmt2(d.valor_venta)}" data-copy-msg="Valor copiado">
            S/ ${fmt2(d.valor_venta)} <i class="fa-regular fa-copy"></i>
          </span>
        </div>
        <div class="card-price-item">
          <span class="label">P. Público</span>
          <span class="value publico tooltip-trigger" data-tooltip="${encodeTooltip(tooltipPublico)}">S/ ${fmt0(d.precio_publico)}</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="card-marca" title="${esc(d.marca)}">${esc(d.marca)}</span>
        <span class="card-stock ${st.cls.replace('stock ', '')}">${esc(st.txt)}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        ${btnFavHtml}
        <div style="flex:1;">${btnAddHtml}</div>
      </div>
    `;
    fragC.appendChild(card);
  }
  tb.appendChild(fragT);
  cards.appendChild(fragC);
  VISIBLES = limite;

  if (VISIBLES >= DATA_FILTRADA.length) {
    loader.classList.add('hidden');
  }
}

function normalizaStock(s) {
  if (!s) return { txt: '—', cls: 'stock out' };
  if (/^>\d+$/.test(s)) return { txt: s.slice(1) + '+', cls: 'stock' };
  if (/^\d+\+$/.test(s)) return { txt: s, cls: 'stock' };
  const n = parseInt(s);
  if (isNaN(n)) return { txt: s, cls: '' };
  if (n === 0) return { txt: '0', cls: 'stock out' };
  if (n <= 3) return { txt: String(n), cls: 'stock low' };
  return { txt: String(n), cls: 'stock' };
}

// ------------------------------------------------------------
// SCROLL INFINITO
// ------------------------------------------------------------
function initScrollListeners() {
  const tw = document.getElementById('tableWrap');
  const cw = document.getElementById('cardsWrap');
  if (tw) tw.addEventListener('scroll', function () {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 100) cargarMas();
  });
  if (cw) cw.addEventListener('scroll', function () {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 100) cargarMas();
  });
}

// ------------------------------------------------------------
// TOGGLE VISTA
// ------------------------------------------------------------
function toggleVista() {
  const body = document.body;
  const label = document.getElementById('btnVistaLabel');
  if (body.classList.contains('vista-cards')) {
    body.classList.remove('vista-cards');
    label.textContent = 'Tarjetas';
  } else {
    body.classList.add('vista-cards');
    label.textContent = 'Tabla';
  }
}

// ------------------------------------------------------------
// TOOLTIP GENÉRICO
// ------------------------------------------------------------
function initTooltipGlobal() {
  const tooltipGlobal = document.getElementById('tooltip-global');
  if (!tooltipGlobal) return;

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('.tooltip-trigger');
    if (!el) return;
    const html = decodeURIComponent(el.dataset.tooltip || '');
    tooltipGlobal.innerHTML = html;
    tooltipGlobal.classList.add('visible');
    const rect = el.getBoundingClientRect();
    const tipRect = tooltipGlobal.getBoundingClientRect();
    let top = rect.top - tipRect.height - 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;
    tooltipGlobal.style.top = top + 'px';
    tooltipGlobal.style.left = left + 'px';
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.tooltip-trigger')) tooltipGlobal.classList.remove('visible');
  });
}
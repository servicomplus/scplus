// ============================================================
// BADGES · construir índice, render, tooltips
// ============================================================

function construirBadges() {
  BADGES = {};
  const ahora = Date.now();
  const corteNuevo  = ahora - BADGE_DIAS_NUEVO  * 86400000;
  const corteCambio = ahora - BADGE_DIAS_CAMBIO * 86400000;

  // --- PRECIOS ---
  const ultimoCambio = {};
  for (const row of DATA_PRECIOS) {
    const sede = String(row.SEDE || '').toUpperCase().trim();
    const codigo = String(row.CODIGO || '').trim();
    if (!sede || !codigo) continue;

    const fecha = parsearFechaReporte(row.FECHA_HORA);
    if (!fecha || fecha.getTime() < corteCambio) continue;

    const subtipo = String(row.SUBTIPO || '').toUpperCase();
    if (!subtipo.startsWith('PRECIO_')) continue;

    const antes = parseFloat(row.PRECIO_ANTES) || 0;
    const ahora2 = parseFloat(row.PRECIO_AHORA) || 0;
    if (antes <= 0 || ahora2 <= 0) continue;
    if (antes > 9999999 || ahora2 > 9999999) continue;

    const delta = ahora2 - antes;
    const pct = antes > 0 ? (delta / antes) * 100 : 0;
    if (Math.abs(pct) < BADGE_PCT_MINIMO) continue;

    const key = sede + '|' + codigo;
    if (!ultimoCambio[key] || fecha > ultimoCambio[key].fecha) {
      ultimoCambio[key] = {
        fecha, antes, ahora: ahora2, delta, pct,
        dir: delta < 0 ? 'down' : 'up'
      };
    }
  }
  for (const key in ultimoCambio) {
    if (!BADGES[key]) BADGES[key] = {};
    BADGES[key].precio = ultimoCambio[key];
  }

  // --- STOCK (solo cambios reales del lote) ---
  const ultimoStock = {};
  for (const row of DATA_STOCK) {
    const sede = String(row.SEDE || '').toUpperCase().trim();
    const codigo = String(row.CODIGO || '').trim();
    if (!sede || !codigo) continue;

    const fecha = parsearFechaReporte(row.FECHA_HORA);
    if (!fecha || fecha.getTime() < corteCambio) continue;

    const subtipo = String(row.SUBTIPO || '').toUpperCase();
    if (!subtipo.startsWith('STOCK_')) continue;

    const antes = parseFloat(row.VALOR_ANTES) || 0;
    const ahora2 = parseFloat(row.VALOR_AHORA) || 0;
    const delta = ahora2 - antes;
    const pct = antes > 0 ? (delta / antes) * 100 : 0;

    let dir = 'danger';
    if (subtipo === 'STOCK_SUBE') dir = 'ok';
    else if (subtipo === 'STOCK_BAJA') dir = 'danger';
    else if (subtipo === 'STOCK_BAJO') dir = 'warn';
    else if (subtipo === 'STOCK_CERO') dir = 'danger';

    const key = sede + '|' + codigo;
    if (!ultimoStock[key] || fecha > ultimoStock[key].fecha) {
      ultimoStock[key] = { fecha, antes, ahora: ahora2, delta, pct, dir, subtipo };
    }
  }
  for (const key in ultimoStock) {
    if (!BADGES[key]) BADGES[key] = {};
    BADGES[key].stock_chg = ultimoStock[key];
  }

  // --- NUEVOS ---
  for (const row of DATA_NUEVOS) {
    const sede = String(row.SEDE || '').toUpperCase().trim();
    const codigo = String(row.CODIGO || '').trim();
    if (!sede || !codigo) continue;

    const tipo = String(row.TIPO || '').toUpperCase();
    if (tipo !== 'NUEVO') continue;

    const fecha = parsearFechaReporte(row.FECHA_HORA);
    if (!fecha || fecha.getTime() < corteNuevo) continue;

    const key = sede + '|' + codigo;
    if (!BADGES[key]) BADGES[key] = {};
    if (!BADGES[key].nuevo || fecha > BADGES[key].nuevo.fecha) {
      BADGES[key].nuevo = {
        fecha,
        dias: Math.floor((ahora - fecha.getTime()) / 86400000)
      };
    }
  }
}

function badgeDe(d) {
  const key = String(d.sede || '').toUpperCase().trim() + '|' + String(d.codigo || '').trim();
  return BADGES[key] || null;
}

function renderBadges(d) {
  const b = badgeDe(d);
  const esFav = (typeof esFavorito === 'function') && esFavorito(d.codigo);

  // Si no hay nada que mostrar, salir
  if (!b && !esFav) return '';

  const iconos = [];

  // ⭐ Favorito SIEMPRE primero
  if (esFav) iconos.push(iconFavorito(d.codigo));

  // Resto de badges (nuevo, precio, stock)
  if (b) {
    if (b.nuevo && iconos.length < BADGE_MAX_ICONOS) iconos.push(iconNuevo(b.nuevo));
    if (b.precio && iconos.length < BADGE_MAX_ICONOS) iconos.push(iconPrecio(b.precio));
    if (b.stock_chg && iconos.length < BADGE_MAX_ICONOS) iconos.push(iconStockChange(b.stock_chg));
  }

  if (iconos.length === 0) return '';
  return '<span class="badges">' + iconos.join('') + '</span>';
}

// ------------------------------------------------------------
// ⭐ FAVORITO
// ------------------------------------------------------------
function iconFavorito(codigo) {
  const fav = (typeof getFavorito === 'function') ? getFavorito(codigo) : null;
  const notaTxt = (fav && fav.nota) ? fav.nota : 'Sin nota';
  let fechaTxt = '—';
  if (fav && fav.fecha) {
    try {
      const d = (fav.fecha instanceof Date) ? fav.fecha : new Date(fav.fecha);
      if (!isNaN(d.getTime())) fechaTxt = d.toLocaleDateString('es-PE');
    } catch (e) {}
  }
  const tt = `
    <div class="tt-title">⭐ FAVORITO</div>
    <div><span class="label">Nota:</span> <span class="value">${esc(notaTxt)}</span></div>
    <div><span class="label">Agregado:</span> ${esc(fechaTxt)}</div>
    <div><span class="label">Click:</span> quitar de favoritos</div>`;
  return `<span class="badge badge-fav active" data-fav="${esc(codigo)}" data-tt="${encodeURIComponent(tt)}" title="Quitar de favoritos"><i class="fa-solid fa-star"></i></span>`;
}

// ------------------------------------------------------------
// NUEVO
// ------------------------------------------------------------
function iconNuevo(n) {
  const fechaTxt = n.fecha.toLocaleDateString('es-PE');
  const diasTxt = n.dias === 0 ? 'hoy' : 'hace ' + n.dias + ' día' + (n.dias !== 1 ? 's' : '');
  const tt = `
    <div class="tt-title">● NUEVO</div>
    <div><span class="label">Ingresó:</span> ${esc(fechaTxt)}</div>
    <div><span class="label">Hace:</span> ${esc(diasTxt)}</div>`;
  return `<span class="badge badge-new" data-tt="${encodeURIComponent(tt)}">●</span>`;
}

// ------------------------------------------------------------
// PRECIO
// ------------------------------------------------------------
function iconPrecio(p) {
  const cls = p.dir === 'down' ? 'down' : 'up';
  const ico = p.dir === 'down' ? 'fa-arrow-down' : 'fa-arrow-up';
  const signo = p.delta > 0 ? '+' : '';
  const tt = `
    <div class="tt-title">● PRECIO ${p.dir === 'down' ? '↓' : '↑'}</div>
    <div><span class="label">Antes:</span> <span class="value">$ ${fmt2(p.antes)}</span></div>
    <div><span class="label">Ahora:</span> <span class="value">$ ${fmt2(p.ahora)}</span></div>
    <div><span class="label">Δ:</span> <span class="${p.delta < 0 ? 'good' : 'warn'}">${signo}$${fmt2(p.delta)} (${signo}${p.pct.toFixed(2)}%)</span></div>
    <div><span class="label">Fecha:</span> ${esc(p.fecha.toLocaleString('es-PE'))}</div>`;
  return `<span class="badge badge-price ${cls}" data-tt="${encodeURIComponent(tt)}"><i class="fa-solid ${ico}"></i></span>`;
}

// ------------------------------------------------------------
// STOCK (solo cambios)
// ------------------------------------------------------------
function iconStockChange(s) {
  let dir = s.dir;
  if (s.subtipo === 'STOCK_CERO') dir = 'danger';
  if (s.subtipo === 'STOCK_BAJO') dir = 'warn';
  if (s.subtipo === 'STOCK_SUBE') dir = 'ok';
  if (s.subtipo === 'STOCK_BAJA') dir = 'danger';

  const map = {
    danger: ['fa-triangle-exclamation', 'danger'],
    warn:   ['fa-triangle-exclamation', 'warn'],
    ok:     ['fa-circle-check', 'ok']
  };
  const [ico, cls] = map[dir] || ['fa-triangle-exclamation', 'danger'];
  const signo = s.delta > 0 ? '+' : '';

  let titulo = 'STOCK ⚠';
  if (dir === 'ok') titulo = 'STOCK ✓';
  else if (dir === 'warn') titulo = 'STOCK BAJO ⚠';

  const tt = `
    <div class="tt-title">● ${titulo}</div>
    <div><span class="label">Antes:</span> <span class="value">${s.antes}</span></div>
    <div><span class="label">Ahora:</span> <span class="value">${s.ahora}</span></div>
    <div><span class="label">Δ:</span> <span class="${s.delta < 0 ? 'bad' : 'good'}">${signo}${s.delta} (${signo}${s.pct.toFixed(1)}%)</span></div>
    <div><span class="label">Fecha:</span> ${esc(s.fecha.toLocaleString('es-PE'))}</div>`;
  return `<span class="badge badge-stock ${cls}" data-tt="${encodeURIComponent(tt)}"><i class="fa-solid ${ico}"></i></span>`;
}

// ------------------------------------------------------------
// CONTADORES
// ------------------------------------------------------------
function actualizarContadoresBadges() {
  const cnt = { nuevo: 0, precioBaja: 0, precioSube: 0, stockBaja: 0, stockSube: 0 };
  for (const d of DATA) {
    const b = badgeDe(d);
    if (b && b.nuevo) cnt.nuevo++;
    if (b && b.precio) {
      if (b.precio.dir === 'down') cnt.precioBaja++;
      else cnt.precioSube++;
    }
    if (b && b.stock_chg) {
      if (b.stock_chg.dir === 'danger' || b.stock_chg.dir === 'warn') cnt.stockBaja++;
      else if (b.stock_chg.dir === 'ok') cnt.stockSube++;
    }
  }
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('cnt-nuevo', cnt.nuevo);
  set('cnt-precio-baja', cnt.precioBaja);
  set('cnt-precio-sube', cnt.precioSube);
  set('cnt-stock-baja', cnt.stockBaja);
  set('cnt-stock-sube', cnt.stockSube);
}

// ------------------------------------------------------------
// FILTROS BADGE
// ------------------------------------------------------------
function toggleFiltroBadge(nombre) {
  FILTROS_BADGE[nombre] = !FILTROS_BADGE[nombre];
  const map = {
    nuevo: 'filtro-nuevo',
    precioBaja: 'filtro-precio-baja',
    precioSube: 'filtro-precio-sube',
    stockBaja: 'filtro-stock-baja',
    stockSube: 'filtro-stock-sube'
  };
  const btn = document.getElementById(map[nombre]);
  if (btn) btn.classList.toggle('active', FILTROS_BADGE[nombre]);
  render();
}

function pasaFiltroBadge(d) {
  const activos = Object.keys(FILTROS_BADGE).filter(k => FILTROS_BADGE[k]);
  if (activos.length === 0) return true;

  const b = badgeDe(d);

  for (const f of activos) {
    if (f === 'nuevo'      && b && b.nuevo) return true;
    if (f === 'precioBaja' && b && b.precio && b.precio.dir === 'down') return true;
    if (f === 'precioSube' && b && b.precio && b.precio.dir === 'up')   return true;
    if (f === 'stockBaja') {
      if (b && b.stock_chg && (b.stock_chg.dir === 'danger' || b.stock_chg.dir === 'warn')) return true;
    }
    if (f === 'stockSube'  && b && b.stock_chg && b.stock_chg.dir === 'ok') return true;
  }
  return false;
}

// ------------------------------------------------------------
// TOOLTIP DE BADGES
// ------------------------------------------------------------
function initBadgeTooltip() {
  BADGE_TOOLTIP_EL = document.getElementById('badge-tooltip');
  if (!BADGE_TOOLTIP_EL) return;

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('.badge[data-tt]');
    if (!el) return;
    BADGE_TOOLTIP_EL.innerHTML = decodeURIComponent(el.dataset.tt || '');
    BADGE_TOOLTIP_EL.classList.add('visible');
    const r = el.getBoundingClientRect();
    const tr = BADGE_TOOLTIP_EL.getBoundingClientRect();
    let top = r.top - tr.height - 8;
    let left = r.left + r.width / 2 - tr.width / 2;
    if (top < 8) top = r.bottom + 8;
    if (left < 8) left = 8;
    if (left + tr.width > window.innerWidth - 8) left = window.innerWidth - tr.width - 8;
    BADGE_TOOLTIP_EL.style.top = top + 'px';
    BADGE_TOOLTIP_EL.style.left = left + 'px';
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.badge[data-tt]')) {
      BADGE_TOOLTIP_EL.classList.remove('visible');
    }
  });
}
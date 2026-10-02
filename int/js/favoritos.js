// ============================================================
// FAVORITOS · global, filtrado por sede, con caché local
// ============================================================
// NOTA: KEY_FAV_CACHE está declarada en config.js — NO repetir aquí.

let FAVORITOS = [];
let MOSTRAR_SOLO_FAVORITOS = false;

// ------------------------------------------------------------
// Cargar (primero cache, luego red)
// ------------------------------------------------------------
async function cargarFavoritos() {
  // 1. Cache instantáneo (pinta rápido)
  try {
    const raw = localStorage.getItem(KEY_FAV_CACHE);
    if (raw) {
      const cache = JSON.parse(raw);
      FAVORITOS = filtrarPorSede(cache);
      console.log('[FAV] cache:', FAVORITOS.length, '/', cache.length, 'sede', SEDE_ACTUAL);
    }
  } catch (e) {
    console.warn('[FAV] cache error:', e);
  }

  // 2. Red (background, actualiza cache)
  try {
    const resp = await jsonpGet(URL_WEBAPP + '?accion=listarFavoritos');
    const todos = (resp && resp.favoritos) ? resp.favoritos : [];
    FAVORITOS = filtrarPorSede(todos);
    localStorage.setItem(KEY_FAV_CACHE, JSON.stringify(todos));
    console.log('[FAV] red:', FAVORITOS.length, '/', todos.length, 'sede', SEDE_ACTUAL);
  } catch (e) {
    console.warn('⚠️ Favoritos: usando solo cache. Motivo:', e.message);
  }
}

// Filtra contra el catálogo actual (DATA)
function filtrarPorSede(lista) {
  const codigosEnSede = new Set(DATA.map(d => d.codigo));
  return lista
    .map(f => ({
      codigo: String(f.codigo || '').trim(),
      fecha: f.fecha,
      nota: f.nota || ''
    }))
    .filter(f => codigosEnSede.has(f.codigo));
}

// ------------------------------------------------------------
// Consultas
// ------------------------------------------------------------
function esFavorito(codigo) {
  const c = String(codigo).trim();
  return FAVORITOS.some(f => f.codigo === c);
}

function getFavorito(codigo) {
  const c = String(codigo).trim();
  return FAVORITOS.find(f => f.codigo === c) || null;
}

// ------------------------------------------------------------
// Toggle
// ------------------------------------------------------------
async function toggleFavorito(codigo, nota) {
  codigo = String(codigo).trim();
  const esFav = esFavorito(codigo);

  try {
    if (esFav) {
      await postViaForm(URL_WEBAPP, { accion: 'quitarFavorito', codigo: codigo });
      FAVORITOS = FAVORITOS.filter(f => f.codigo !== codigo);
      mostrarToast('☆ Quitado: ' + codigo);
    } else {
      await postViaForm(URL_WEBAPP, { accion: 'agregarFavorito', codigo: codigo, nota: nota || '' });
      FAVORITOS.push({ codigo: codigo, fecha: new Date().toISOString(), nota: nota || '' });
      mostrarToast('⭐ Agregado: ' + codigo);
    }

    actualizarCacheFavoritos();
    actualizarBadgeFavorito(codigo, !esFav);
    actualizarContadorFavoritos();

    if (MOSTRAR_SOLO_FAVORITOS && esFav) {
      render();
    } else {
      const orden = document.getElementById('orden')?.value;
      if (!esFav && orden === 'favoritos_primero') render();
    }
  } catch (e) {
    mostrarToast('⚠️ Error: ' + e.message);
  }
}

// Actualiza el badge ⭐ Y el botón ☆/⭐ visualmente
function actualizarBadgeFavorito(codigo, activo) {
  document.querySelectorAll(`.badge-fav[data-fav="${CSS.escape(codigo)}"]`).forEach(badge => {
    badge.classList.toggle('active', activo);
    badge.title = activo ? 'Quitar de favoritos' : 'Agregar a favoritos';
  });

  document.querySelectorAll(`[data-fav-toggle="${CSS.escape(codigo)}"]`).forEach(btn => {
    btn.classList.toggle('active', activo);
    btn.title = activo ? 'Quitar de favoritos' : 'Agregar a favoritos';
    const i = btn.querySelector('i');
    if (i) i.className = `fa-${activo ? 'solid' : 'regular'} fa-star`;
  });
}

// Guarda cache local (merge: no pierde favoritos de otras sedes)
function actualizarCacheFavoritos() {
  try {
    let cache = [];
    try {
      const raw = localStorage.getItem(KEY_FAV_CACHE);
      cache = raw ? JSON.parse(raw) : [];
    } catch (e) {}

    const codigosEnSede = new Set(DATA.map(d => d.codigo));
    cache = cache.filter(f => !codigosEnSede.has(String(f.codigo)));
    cache = cache.concat(FAVORITOS);

    localStorage.setItem(KEY_FAV_CACHE, JSON.stringify(cache));
  } catch (e) {}
}

// ------------------------------------------------------------
// Filtro rápido
// ------------------------------------------------------------
function toggleFiltroFavoritos() {
  MOSTRAR_SOLO_FAVORITOS = !MOSTRAR_SOLO_FAVORITOS;
  const btn = document.getElementById('filtro-favoritos');
  if (btn) btn.classList.toggle('active', MOSTRAR_SOLO_FAVORITOS);
  render();
}

function actualizarContadorFavoritos() {
  const el = document.getElementById('cnt-favoritos');
  if (el) el.textContent = FAVORITOS.length;
}

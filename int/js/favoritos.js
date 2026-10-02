// ============================================================
// FAVORITOS · global, filtrado por sede, con caché local
// ============================================================

let FAVORITOS = [];              // [{ codigo, fecha, nota }] válidos para la sede actual
let MOSTRAR_SOLO_FAVORITOS = false;
const KEY_FAV_CACHE = 'servicomp_favoritos_cache_v1';

// ------------------------------------------------------------
// Cargar (primero cache, luego red)
// ------------------------------------------------------------
async function cargarFavoritos() {
  // 1. Cache instantáneo
  try {
    const raw = localStorage.getItem(KEY_FAV_CACHE);
    if (raw) {
      const cache = JSON.parse(raw);
      FAVORITOS = filtrarPorSede(cache);
    }
  } catch (e) {}

  // 2. Red (background, actualiza cache)
  try {
    const resp = await jsonpGet(URL_WEBAPP + '?accion=listarFavoritos');
    const todos = (resp && resp.favoritos) ? resp.favoritos : [];
    FAVORITOS = filtrarPorSede(todos);
    localStorage.setItem(KEY_FAV_CACHE, JSON.stringify(todos));
    log('✅ Favoritos (' + SEDE_ACTUAL + '): ' + FAVORITOS.length + ' / total ' + todos.length);
  } catch (e) {
    warn('⚠️ Error cargando favoritos:', e.message);
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

    // Actualizar cache
    actualizarCacheFavoritos();

    // Actualizar visualmente badge Y botón
    actualizarBadgeFavorito(codigo, !esFav);

    // Actualizar contador y filtro
    actualizarContadorFavoritos();

    // Si estamos en modo "solo favoritos" y quitamos → re-render
    if (MOSTRAR_SOLO_FAVORITOS && esFav) {
      render();
    } else {
      // Si agregamos un favorito y estamos viendo favoritos primero, re-ordenar
      const orden = document.getElementById('orden')?.value;
      if (!esFav && orden === 'favoritos_primero') render();
    }
  } catch (e) {
    mostrarToast('⚠️ Error: ' + e.message);
  }
}

// Actualiza el badge ⭐ Y el botón ☆/⭐ visualmente
function actualizarBadgeFavorito(codigo, activo) {
  // Badge ⭐ (que aparece al lado de la descripción cuando es favorito)
  document.querySelectorAll(`.badge-fav[data-fav="${CSS.escape(codigo)}"]`).forEach(badge => {
    badge.classList.toggle('active', activo);
    badge.title = activo ? 'Quitar de favoritos' : 'Agregar a favoritos';
  });

  // Botón ☆/⭐ (siempre visible, al lado de Agregar)
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

    // Quita todos los de la sede actual
    const codigosEnSede = new Set(DATA.map(d => d.codigo));
    cache = cache.filter(f => !codigosEnSede.has(String(f.codigo)));

    // Agrega los actuales
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
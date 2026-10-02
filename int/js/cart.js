// ============================================================
// CART · carrito, totales, storage, UI
// ============================================================

function cargarCarritoDeStorage() {
  try {
    const raw = localStorage.getItem(KEY_CARRITO);
    if (raw) CARRITO = JSON.parse(raw) || [];
  } catch (e) { CARRITO = []; }
}

function guardarCarritoEnStorage() {
  try { localStorage.setItem(KEY_CARRITO, JSON.stringify(CARRITO)); } catch (e) {}
}

function agregarAlCarrito(prod) {
  if (String(prod.sede || '').trim().toUpperCase() !== SEDE_ACTUAL) {
    mostrarToast('⚠️ Este producto no pertenece a ' + SEDE_ACTUAL);
    return;
  }

  const existe = CARRITO.find(x => x.codigo === prod.codigo && x.sede === prod.sede);
  if (existe) {
    existe.cantidad += 1;
  } else {
    CARRITO.push({
      codigo: prod.codigo,
      descripcion: prod.descripcion,
      marca: prod.marca,
      precio_publico: prod.precio_publico,
      sede: prod.sede,
      cantidad: 1
    });
  }
  guardarCarritoEnStorage();
  actualizarCarritoUI();
  mostrarToast('✓ Agregado: ' + prod.codigo);
}

function cambiarCantidad(codigo, delta) {
  const item = CARRITO.find(x => x.codigo === codigo);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) CARRITO = CARRITO.filter(x => x.codigo !== codigo);
  guardarCarritoEnStorage();
  actualizarCarritoUI();
}

function setCantidad(codigo, valor) {
  const item = CARRITO.find(x => x.codigo === codigo);
  if (!item) return;
  let n = parseInt(valor);
  if (isNaN(n) || n <= 0) n = 1;
  item.cantidad = n;
  guardarCarritoEnStorage();
  actualizarCarritoUI();
}

function eliminarDelCarrito(codigo) {
  CARRITO = CARRITO.filter(x => x.codigo !== codigo);
  guardarCarritoEnStorage();
  actualizarCarritoUI();
}

function vaciarCarrito() {
  if (CARRITO.length === 0) return;
  if (!confirm('¿Vaciar todo el carrito?')) return;
  CARRITO = [];
  guardarCarritoEnStorage();
  actualizarCarritoUI();
  mostrarToast('Carrito vaciado');
}

function calcularTotales() {
  const subtotal = CARRITO.reduce((s, x) => s + (x.precio_publico * x.cantidad), 0);
  const envio = parseFloat(document.getElementById('envioInput').value) || 0;
  const total = subtotal + envio;
  return { subtotal, envio, total };
}

function actualizarTotales() {
  const { subtotal, envio, total } = calcularTotales();
  document.getElementById('cartSubtotal').textContent = 'S/ ' + fmt2(subtotal);
  document.getElementById('cartEnvio').textContent = 'S/ ' + fmt2(envio);
  document.getElementById('cartTotal').textContent = 'S/ ' + fmt2(total);
}

function actualizarCarritoUI() {
  const body = document.getElementById('cartBody');
  const fab = document.getElementById('cartFab');
  const badge = document.getElementById('cartBadge');

  const totalItems = CARRITO.reduce((s, x) => s + x.cantidad, 0);
  badge.textContent = totalItems;
  if (totalItems === 0) fab.classList.add('empty');
  else fab.classList.remove('empty');

  if (CARRITO.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-box-open"></i>
        Tu carrito está vacío.<br>
        Agrega productos del catálogo.
      </div>
    `;
  } else {
    body.innerHTML = CARRITO.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-code">${esc(item.codigo)} · <span style="color:#4ade80">${esc(item.sede)}</span></div>
          <div class="cart-item-desc">${esc(item.descripcion)}</div>
          <div class="cart-item-price">S/ ${fmt2(item.precio_publico)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" data-codigo="${esc(item.codigo)}" data-delta="-1">−</button>
            <input type="number" min="1" value="${item.cantidad}"
                   data-codigo="${esc(item.codigo)}" class="qty-input">
            <button class="qty-btn" data-codigo="${esc(item.codigo)}" data-delta="1">+</button>
          </div>
          <button class="cart-item-remove" data-remove="${esc(item.codigo)}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  actualizarTotales();

  // Refresca solo los botones "agregar" del catálogo (sin re-render completo)
  document.querySelectorAll('.btn-add').forEach(btn => {
    try {
      const prod = JSON.parse(decodeURIComponent(btn.dataset.prod));
      const enCarrito = CARRITO.find(x => x.codigo === prod.codigo && x.sede === prod.sede);
      if (enCarrito) {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> En carrito (${enCarrito.cantidad})`;
      } else {
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
      }
    } catch (e) {}
  });
}

function abrirCarrito() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function cerrarCarrito() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

// ------------------------------------------------------------
// DELEGACIÓN DE EVENTOS (favoritos + carrito + copiar)
// ------------------------------------------------------------
function initDelegacionEventos() {
  document.addEventListener('click', (e) => {
    // ⭐ Favorito: badge (que aparece cuando ya es favorito)
    const favBadge = e.target.closest('.badge-fav[data-fav]');
    if (favBadge) {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorito(favBadge.dataset.fav);
      return;
    }

    // ⭐ Favorito: botón ☆/⭐ (siempre visible, al lado de Agregar)
    const favBtn = e.target.closest('[data-fav-toggle]');
    if (favBtn) {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorito(favBtn.dataset.favToggle);
      return;
    }

    // Agregar al carrito
    const btnAdd = e.target.closest('.btn-add');
    if (btnAdd) {
      try {
        const prod = JSON.parse(decodeURIComponent(btnAdd.dataset.prod));
        agregarAlCarrito(prod);
      } catch (err) { warn('Error agregando al carrito', err); }
      return;
    }

    // Copiar (código o valor)
    const copyEl = e.target.closest('[data-copy]');
    if (copyEl) {
      const txt = copyEl.dataset.copy;
      const msg = copyEl.dataset.copyMsg || 'Copiado';
      copiarAlPortapapeles(txt, msg);
      return;
    }

    // Qty +/-
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      cambiarCantidad(qtyBtn.dataset.codigo, parseInt(qtyBtn.dataset.delta));
      return;
    }

    // Remover item
    const rmBtn = e.target.closest('[data-remove]');
    if (rmBtn) {
      eliminarDelCarrito(rmBtn.dataset.remove);
      return;
    }
  });

  // Input de cantidad
  document.addEventListener('change', (e) => {
    const inp = e.target.closest('.qty-input');
    if (inp) setCantidad(inp.dataset.codigo, inp.value);
  });
}
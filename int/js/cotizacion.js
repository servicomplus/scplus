// ============================================================
// COTIZACIÓN · generar, modal, compartir, imprimir
// ============================================================

// ------------------------------------------------------------
// JSONP helper (evita CORS al leer del Apps Script)
// ------------------------------------------------------------
function jsonpGet(url) {
  return new Promise((resolve, reject) => {
    const cbName = '_jsonp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    let timeout;

    window[cbName] = (data) => {
      clearTimeout(timeout);
      resolve(data);
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      script.remove();
    };

    const sep = url.includes('?') ? '&' : '?';
    script.src = url + sep + 'callback=' + cbName;
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('JSONP falló al cargar: ' + url));
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      script.remove();
    };

    timeout = setTimeout(() => {
      reject(new Error('JSONP timeout (10s)'));
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      script.remove();
    }, 10000);

    document.head.appendChild(script);
  });
}

// ------------------------------------------------------------
// POST vía <form> oculto (evita CORS)
// ------------------------------------------------------------
function postViaForm(url, payload) {
  return new Promise((resolve) => {
    const iframeName = '_iframe_' + Date.now() + '_' + Math.random().toString(36).slice(2);

    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = iframeName;
    form.style.display = 'none';

    // Apps Script lee e.parameter.payload
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // Esperamos un poco y limpiamos
    setTimeout(() => {
      try { form.remove(); } catch (e) {}
      setTimeout(() => {
        try { iframe.remove(); } catch (e) {}
        resolve();
      }, 500);
    }, 800);
  });
}

// ------------------------------------------------------------
// GENERAR COTIZACIÓN
// ------------------------------------------------------------
async function generarCotizacion() {
  if (CARRITO.length === 0) {
    mostrarToast('Agrega productos primero');
    return;
  }

  const btn = document.getElementById('btnGenerar');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';

  try {
    const cliente = document.getElementById('clienteNombre').value.trim() || 'Cliente';
    const envio = parseFloat(document.getElementById('envioInput').value) || 0;
    const { subtotal, total } = calcularTotales();

    // ID generado en el cliente — así no dependemos del server para tenerlo
    const id = 'COT-' + Date.now().toString(36).toUpperCase().slice(-6) +
               Math.random().toString(36).toUpperCase().slice(2, 5);

    const payload = {
      accion: 'crearCotizacion',
      id: id,
      cliente: cliente,
      sede: SEDE_ACTUAL,
      envio: envio,
      subtotal: subtotal,
      total: total,
      tc: TC_ACTUAL,
      codigos: CARRITO.map(x => x.codigo),
      items: CARRITO.map(x => ({
        codigo: x.codigo,
        descripcion: x.descripcion,
        marca: x.marca,
        precio: x.precio_publico,
        cantidad: x.cantidad,
        sede: x.sede,
        subtotal: x.precio_publico * x.cantidad
      }))
    };

    // 1️⃣ POST sin CORS
    await postViaForm(URL_WEBAPP, payload);

    // 2️⃣ Verificación vía JSONP (opcional pero útil)
    let verificado = false;
    try {
      const resp = await jsonpGet(
        URL_WEBAPP + '?accion=obtenerCotizacion&id=' + encodeURIComponent(id)
      );
      if (resp && resp.ok && resp.cotizacion && resp.cotizacion.id === id) {
        verificado = true;
        log('✅ Cotización confirmada en el Sheet:', id);
      }
    } catch (e) {
      warn('⚠️ No se pudo verificar por JSONP (pero probablemente sí se guardó):', e.message);
    }

    // 3️⃣ Mostrar modal (con o sin verificación, el flujo continúa)
    ULTIMA_COT = {
      id,
      cliente,
      sede: SEDE_ACTUAL,
      total,
      subtotal,
      envio,
      tc: TC_ACTUAL,
      fecha: new Date().toISOString(),
      items: CARRITO.map(x => ({ ...x })),
      verificado
    };
    window.__ultimaCot = ULTIMA_COT;

    CARRITO = [];
    guardarCarritoEnStorage();
    document.getElementById('clienteNombre').value = '';
    actualizarCarritoUI();
    cerrarCarrito();

    document.getElementById('modalId').textContent = id;
    document.getElementById('modalSede').textContent = SEDE_ACTUAL;
    document.getElementById('modalOverlay').classList.add('open');

  } catch (e) {
    alert('❌ Error al generar cotización:\n' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// ------------------------------------------------------------
// MODAL
// ------------------------------------------------------------
function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function copiarCodigoCotizacion() {
  const id = ULTIMA_COT?.id || '';
  if (!id) return;

  copiarAlPortapapeles(id, 'Código copiado: ' + id);

  const btn = document.getElementById('btnCopiarCodigo');
  if (!btn) return;
  const htmlOriginal = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
  btn.style.background = '#16a34a';
  setTimeout(() => {
    btn.innerHTML = htmlOriginal;
    btn.style.background = '';
  }, 1500);
}

function compartirWhatsApp() {
  const c = ULTIMA_COT;
  if (!c) return;
  const texto = `Hola ${c.cliente}, aquí está tu cotización de ServiComp+:\n\n` +
                `Código: *${c.id}*\n` +
                `Sede: ${c.sede}\n` +
                `Total: S/ ${fmt2(c.total)}\n\n` +
                `Ingresa a https://servicomplus.com/int/cotizador y pega este código para verla.\n\n` +
                `Válida por 24 horas.`;
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}

function compartirEmail() {
  const c = ULTIMA_COT;
  if (!c) return;
  const asunto = `Cotización ${c.id} - ServiComp+`;
  const cuerpo = `Hola ${c.cliente},\n\n` +
                 `Tu cotización está lista:\n\n` +
                 `Código: ${c.id}\n` +
                 `Sede: ${c.sede}\n` +
                 `Total: S/ ${fmt2(c.total)}\n\n` +
                 `Ingresa a cotizacion.html y pega el código.\n\n` +
                 `Válida por 24 horas.\n\n` +
                 `Saludos,\nServiComp+`;
  window.location.href = 'mailto:?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
}

function imprimirDesdeModal() {
  window.print();
}
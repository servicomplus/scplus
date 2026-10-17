/* ============================================================
   NOTAS EFÍMERAS · Lógica
   ============================================================ */

// ============================================================
// CONFIGURACIÓN
// ============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbz-d87XaEATKbTYuxGPB7QhM8VVim2N69dTu59dUy4m1P-JYInry9ImSq5r-71tlVXr/exec';
const SESION_KEY = 'notas_efimeras_sesion';
const SOUND_KEY = 'notas_efimeras_sound';
const FUENTE_KEY = 'notas_efimeras_fuente';
const MAX_NOTAS = 10;

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊',
  '😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜',
  '🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶',
  '😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒',
  '🤕','🤢','🤮','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞',
  '👍','👎','👌','✌️','🤞','🤟','🤘','👏','🙌','🙏','💪','✍️',
  '🔥','⭐','✨','💫','⚡','💥','🎉','🎊','🎁','🏆','🎯','🚀',
  '📝','📌','📎','🖊️','✏️','📖','📚','💡','🔔','⏰','📅','✅'
];

// ============================================================
// ESTADO
// ============================================================
let usuario = null;
let notasActuales = [];
let timerExpiracion = null;
let timerCuenta = null;
let horaExpiracion = null;
let avisoMostrado = false;
let sonidoActivo = sessionStorage.getItem(SOUND_KEY) === '1';
let fuenteActual = sessionStorage.getItem(FUENTE_KEY) || 'Caveat';

// ============================================================
// DOM
// ============================================================
const $ = id => document.getElementById(id);
const vistaUsuarios = $('vistaUsuarios');
const vistaNotas = $('vistaNotas');
const listaUsuarios = $('listaUsuarios');
const lista = $('lista');
const input = $('inputNota');
const contador = $('contador');
const toast = $('toast');
const modalOverlay = $('modalOverlay');
const modalTitulo = $('modalTitulo');
const modalHint = $('modalHint');
const modalNombre = $('modalNombre');
const modalClave = $('modalClave');
const modalConfirmar = $('modalConfirmar');
const campoNombre = $('campoNombre');
const campoConfirmar = $('campoConfirmar');
const modalError = $('modalError');
const toggleClave = $('toggleClave');
const loaderOverlay = $('loaderOverlay');
const loaderTexto = $('loaderTexto');
const avisoExpira = $('avisoExpira');
const panelEmojis = $('panelEmojis');
const panelFuentes = $('panelFuentes');

// ============================================================
// UTILS
// ============================================================
function mostrarToast(msg, tipo = '') {
  toast.textContent = msg;
  toast.className = 'toast show ' + tipo;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.className = 'toast ' + tipo;
  }, 2600);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

// ============================================================
// LOADER
// ============================================================
let loaderContador = 0;
function mostrarLoader(texto = 'cargando') {
  loaderContador++;
  loaderTexto.textContent = texto;
  loaderOverlay.classList.add('show');
}
function ocultarLoader() {
  loaderContador--;
  if (loaderContador <= 0) {
    loaderContador = 0;
    loaderOverlay.classList.remove('show');
  }
}

// ============================================================
// SONIDO
// ============================================================
let audioCtx = null;
function reproducirSonido(tipo = 'escribir') {
  if (!sonidoActivo) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    if (tipo === 'escribir') {
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      source.connect(filter).connect(gain).connect(audioCtx.destination);
      source.start(now);
    } else if (tipo === 'borrar') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (tipo === 'ok') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.08);
      osc.frequency.setValueAtTime(784, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

function actualizarBotonesSonido() {
  [$('btnSound'), $('btnSound2')].forEach(b => {
    if (!b) return;
    const icono = b.querySelector('.btn-icono');
    if (icono) icono.textContent = sonidoActivo ? '🔊' : '🔇';
    b.classList.toggle('on', sonidoActivo);
  });
}
function toggleSonido() {
  sonidoActivo = !sonidoActivo;
  sessionStorage.setItem(SOUND_KEY, sonidoActivo ? '1' : '0');
  actualizarBotonesSonido();
  if (sonidoActivo) reproducirSonido('ok');
}
$('btnSound').addEventListener('click', toggleSonido);
$('btnSound2').addEventListener('click', toggleSonido);
actualizarBotonesSonido();

// ============================================================
// PANEL EMOJIS
// ============================================================
panelEmojis.innerHTML = EMOJIS.map(e => `<button type="button">${e}</button>`).join('');
panelEmojis.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', () => {
    insertarEnCursor(input, b.textContent);
    panelEmojis.classList.remove('show');
    input.focus();
  });
});

// ============================================================
// PANEL FUENTES
// ============================================================
panelFuentes.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', () => {
    fuenteActual = b.dataset.fuente;
    sessionStorage.setItem(FUENTE_KEY, fuenteActual);
    input.style.fontFamily = `'${fuenteActual}', cursive`;
    actualizarPanelFuentes();
    panelFuentes.classList.remove('show');
    input.focus();
  });
});

function actualizarPanelFuentes() {
  panelFuentes.querySelectorAll('button').forEach(b => {
    b.classList.toggle('activa', b.dataset.fuente === fuenteActual);
  });
}
actualizarPanelFuentes();
input.style.fontFamily = `'${fuenteActual}', cursive`;

// ============================================================
// POSICIONAR PANELES
// ============================================================
function posicionarPanel(panel, boton) {
  const rect = boton.getBoundingClientRect();
  const ancho = panel.offsetWidth || 320;
  const alto = panel.offsetHeight || 200;
  const margen = 8;

  let left = rect.left + rect.width / 2 - ancho / 2;
  if (left < margen) left = margen;
  if (left + ancho > window.innerWidth - margen) {
    left = window.innerWidth - ancho - margen;
  }

  let top = rect.bottom + margen;
  if (top + alto > window.innerHeight - margen) {
    top = rect.top - alto - margen;
    if (top < margen) top = margen;
  }

  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
}

$('btnEmoji').addEventListener('click', (e) => {
  e.stopPropagation();
  const estabaAbierto = panelEmojis.classList.contains('show');
  panelFuentes.classList.remove('show');
  if (estabaAbierto) {
    panelEmojis.classList.remove('show');
  } else {
    panelEmojis.classList.add('show');
    posicionarPanel(panelEmojis, $('btnEmoji'));
  }
});

$('btnFuente').addEventListener('click', (e) => {
  e.stopPropagation();
  const estabaAbierto = panelFuentes.classList.contains('show');
  panelEmojis.classList.remove('show');
  if (estabaAbierto) {
    panelFuentes.classList.remove('show');
  } else {
    panelFuentes.classList.add('show');
    posicionarPanel(panelFuentes, $('btnFuente'));
  }
});

document.addEventListener('click', (e) => {
  if (!panelEmojis.contains(e.target) && e.target !== $('btnEmoji')) {
    panelEmojis.classList.remove('show');
  }
  if (!panelFuentes.contains(e.target) && e.target !== $('btnFuente')) {
    panelFuentes.classList.remove('show');
  }
});

window.addEventListener('resize', () => {
  panelEmojis.classList.remove('show');
  panelFuentes.classList.remove('show');
});
window.addEventListener('scroll', () => {
  if (panelEmojis.classList.contains('show')) {
    posicionarPanel(panelEmojis, $('btnEmoji'));
  }
  if (panelFuentes.classList.contains('show')) {
    posicionarPanel(panelFuentes, $('btnFuente'));
  }
}, true);

// ============================================================
// INSERTAR EN CURSOR
// ============================================================
function insertarEnCursor(el, texto) {
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const valor = el.value;
  el.value = valor.slice(0, start) + texto + valor.slice(end);
  el.selectionStart = el.selectionEnd = start + texto.length;
  el.dispatchEvent(new Event('input'));
}

// ============================================================
// JSONP
// ============================================================
let jsonpCounter = 0;
function jsonpGet(params) {
  return new Promise((resolve, reject) => {
    const cbName = '__jsonp_cb_' + (++jsonpCounter) + '_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(() => { cleanup(); reject(new Error('Timeout')); }, 20000);
    window[cbName] = data => {
      cleanup();
      if (!data.ok) reject(new Error(data.error));
      else resolve(data);
    };
    function cleanup() {
      clearTimeout(timeout);
      try { delete window[cbName]; } catch (e) {}
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    const qs = new URLSearchParams({ ...params, callback: cbName });
    script.src = API_URL + '?' + qs.toString();
    script.onerror = () => { cleanup(); reject(new Error('Error de red')); };
    document.body.appendChild(script);
  });
}
async function apiGet(params) { return jsonpGet(params); }
async function apiPost(payload) {
  return jsonpGet({ action: 'post', payload: JSON.stringify(payload) });
}

// ============================================================
// SESIÓN
// ============================================================
function guardarSesion(u) {
  usuario = u;
  sessionStorage.setItem(SESION_KEY, JSON.stringify(u));
}
function limpiarSesion() {
  usuario = null;
  sessionStorage.removeItem(SESION_KEY);
  if (timerExpiracion) clearTimeout(timerExpiracion);
  if (timerCuenta) clearInterval(timerCuenta);
}

// ============================================================
// MODAL
// ============================================================
let modalModo = 'login';
let modalUsuarioSeleccionado = null;

function abrirModalLogin(u) {
  modalModo = 'login';
  modalUsuarioSeleccionado = u;
  modalTitulo.textContent = '🔒 Hola ' + u.nombre;
  modalHint.textContent = 'Ingresa tu clave para ver tus notas';
  campoNombre.style.display = 'none';
  campoConfirmar.style.display = 'none';
  modalClave.value = '';
  modalError.textContent = '';
  modalOverlay.classList.add('show');
  setTimeout(() => modalClave.focus(), 150);
}
function abrirModalCrear() {
  modalModo = 'crear';
  modalTitulo.textContent = '✨ Nuevo usuario';
  modalHint.textContent = 'Elige un nombre y clave (durará 1 hora)';
  campoNombre.style.display = '';
  campoConfirmar.style.display = '';
  modalNombre.value = '';
  modalClave.value = '';
  modalConfirmar.value = '';
  modalError.textContent = '';
  modalOverlay.classList.add('show');
  setTimeout(() => modalNombre.focus(), 150);
}
function cerrarModal() { modalOverlay.classList.remove('show'); }

async function aceptarModal() {
  modalError.textContent = '';
  const clave = modalClave.value;
  const btnAceptar = $('modalAceptar');

  if (modalModo === 'login') {
    if (!clave) { modalError.textContent = 'Falta la clave'; return; }
    btnAceptar.disabled = true;
    btnAceptar.classList.add('loading');
    mostrarLoader('verificando');
    try {
      const data = await apiPost({ action: 'login', nombre: modalUsuarioSeleccionado.nombre, clave });
      ocultarLoader();
      cerrarModal();
      reproducirSonido('ok');
      entrarApp(data.usuario);
    } catch (e) {
      ocultarLoader();
      modalError.textContent = e.message;
    } finally {
      btnAceptar.disabled = false;
      btnAceptar.classList.remove('loading');
    }
  } else {
    const nombre = modalNombre.value.trim();
    const confirmar = modalConfirmar.value;
    if (!nombre) { modalError.textContent = 'Falta el nombre'; return; }
    if (clave.length < 3) { modalError.textContent = 'Clave muy corta (mín 3)'; return; }
    if (clave !== confirmar) { modalError.textContent = 'Las claves no coinciden'; return; }
    btnAceptar.disabled = true;
    btnAceptar.classList.add('loading');
    mostrarLoader('creando usuario');
    try {
      const data = await apiPost({ action: 'crearUsuario', nombre, clave });
      ocultarLoader();
      cerrarModal();
      mostrarToast('✅ Usuario creado', 'success');
      reproducirSonido('ok');
      entrarApp(data.usuario);
    } catch (e) {
      ocultarLoader();
      modalError.textContent = e.message;
    } finally {
      btnAceptar.disabled = false;
      btnAceptar.classList.remove('loading');
    }
  }
}

toggleClave.addEventListener('click', () => {
  const tipo = modalClave.type === 'password' ? 'text' : 'password';
  modalClave.type = tipo;
  toggleClave.textContent = tipo === 'password' ? '👁️' : '🙈';
});

$('modalCancelar').addEventListener('click', cerrarModal);
$('modalAceptar').addEventListener('click', aceptarModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) cerrarModal(); });

[modalClave, modalConfirmar, modalNombre].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); aceptarModal(); }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('show')) cerrarModal();
    panelEmojis.classList.remove('show');
    panelFuentes.classList.remove('show');
  }
});

// ============================================================
// VISTA USUARIOS
// ============================================================
async function cargarUsuarios() {
  listaUsuarios.innerHTML = '<div class="vacio" style="grid-column:1/-1">cargando...</div>';
  mostrarLoader('cargando usuarios');
  try {
    const data = await apiGet({ action: 'listarUsuarios' });
    ocultarLoader();
    renderUsuarios(data.usuarios);
  } catch (e) {
    ocultarLoader();
    listaUsuarios.innerHTML = '<div class="vacio" style="grid-column:1/-1">Error: ' + escapeHtml(e.message) + '</div>';
  }
}

function renderUsuarios(usuarios) {
  if (!usuarios.length) {
    listaUsuarios.innerHTML = '';
  } else {
    listaUsuarios.innerHTML = usuarios.map(u => `
      <button class="btn-usuario" data-id="${u.id}" data-nombre="${escapeHtml(u.nombre)}">
        ${escapeHtml(u.nombre)}
        <span class="mini">click para entrar</span>
      </button>
    `).join('');
    listaUsuarios.querySelectorAll('.btn-usuario').forEach(b => {
      b.addEventListener('click', () => abrirModalLogin({ id: b.dataset.id, nombre: b.dataset.nombre }));
    });
  }
  const btnCrear = document.createElement('button');
  btnCrear.className = 'btn-crear';
  btnCrear.textContent = '+ Crear nuevo usuario';
  btnCrear.addEventListener('click', abrirModalCrear);
  listaUsuarios.appendChild(btnCrear);
}

// ============================================================
// CUENTA REGRESIVA
// ============================================================
function actualizarEstado() {
  if (!horaExpiracion) return;
  const restante = horaExpiracion - Date.now();
  const dot = $('dotEstado');
  const texto = $('estadoTexto');
  if (restante <= 0) {
    texto.textContent = 'Expirado';
    dot.className = 'dot danger';
    return;
  }
  const min = Math.floor(restante / 60000);
  const seg = Math.floor((restante % 60000) / 1000);
  texto.textContent = `Expira en ${min}m ${seg.toString().padStart(2, '0')}s`;
  if (min < 5) dot.className = 'dot danger';
  else if (min < 15) dot.className = 'dot warn';
  else dot.className = 'dot';

  if (min < 5 && !avisoMostrado) {
    avisoMostrado = true;
    avisoExpira.textContent = '⚠️ Tu sesión expira en 5 minutos';
    avisoExpira.classList.add('show');
    setTimeout(() => avisoExpira.classList.remove('show'), 5000);
  }
}

// ============================================================
// ENTRAR / SALIR
// ============================================================
function entrarApp(u) {
  guardarSesion(u);
  $('nombreUsuario').textContent = u.nombre;
  $('avatarUsuario').textContent = u.nombre.charAt(0).toUpperCase();
  vistaUsuarios.style.display = 'none';
  vistaNotas.style.display = '';
  cargarNotas();

  horaExpiracion = Date.now() + 60 * 60 * 1000;
  avisoMostrado = false;
  if (timerExpiracion) clearTimeout(timerExpiracion);
  if (timerCuenta) clearInterval(timerCuenta);
  timerExpiracion = setTimeout(() => {
    mostrarToast('⏳ Tu sesión expiró', 'error');
    salirApp();
  }, 60 * 60 * 1000);
  actualizarEstado();
  timerCuenta = setInterval(actualizarEstado, 1000);

  setTimeout(() => input.focus(), 200);
}

function salirApp() {
  limpiarSesion();
  vistaNotas.style.display = 'none';
  vistaUsuarios.style.display = '';
  notasActuales = [];
  cargarUsuarios();
}

$('btnSalir').addEventListener('click', () => {
  if (!confirm('¿Salir? Podrás volver a entrar con tu clave.')) return;
  salirApp();
});

// ============================================================
// API NOTAS
// ============================================================
async function cargarNotas() {
  mostrarLoader('cargando notas');
  try {
    const data = await apiPost({ action: 'listarNotas', usuarioId: usuario.id });
    ocultarLoader();
    notasActuales = data.notas;
    render();
  } catch (e) {
    ocultarLoader();
    mostrarToast('Error al cargar: ' + e.message, 'error');
  }
}

async function agregarNota() {
  const texto = input.value.trim();
  if (!texto) return mostrarToast('Escribe algo primero', 'error');
  if (texto.length > 100) return mostrarToast('Máximo 100 caracteres', 'error');
  if (notasActuales.length >= MAX_NOTAS) return mostrarToast(`Máximo ${MAX_NOTAS} notas`, 'error');

  const btn = $('btnAgregar');
  btn.disabled = true;
  btn.classList.add('loading');
  mostrarLoader('publicando');
  try {
    const nuevas = [...notasActuales, { nota: texto, fuente: fuenteActual }];
    const data = await apiPost({ action: 'sincronizar', usuarioId: usuario.id, notas: nuevas });
    ocultarLoader();
    notasActuales = data.notas;
    input.value = '';
    contador.textContent = '0 / 100';
    contador.classList.remove('limite');
    render();
    reproducirSonido('escribir');
    mostrarToast('✅ Nota publicada', 'success');
    input.focus();
  } catch (e) {
    ocultarLoader();
    mostrarToast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

async function borrarNota(id, btn) {
  if (!confirm('¿Borrar esta nota? No se puede deshacer.')) return;
  btn.disabled = true;
  btn.classList.add('loading');
  mostrarLoader('borrando');
  try {
    const data = await apiPost({ action: 'eliminarNota', usuarioId: usuario.id, notaId: id });
    ocultarLoader();
    notasActuales = data.notas;
    render();
    reproducirSonido('borrar');
    mostrarToast('🗑️ Nota borrada', 'success');
    input.focus();
  } catch (e) {
    ocultarLoader();
    mostrarToast('Error: ' + e.message, 'error');
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

// ============================================================
// RENDER
// ============================================================
function render() {
  const puedeAgregar = notasActuales.length < MAX_NOTAS;
  $('btnAgregar').disabled = !puedeAgregar;
  input.disabled = !puedeAgregar;

  if (!notasActuales.length) {
    lista.innerHTML = '<div class="vacio">~ aún no tienes notas ~<br>escribe la primera arriba ✍️</div>';
    return;
  }

  lista.innerHTML = notasActuales.map(n => `
    <div class="nota" data-id="${n.id}">
      <div class="nota-texto" style="font-family:'${n.fuente || 'Caveat'}', cursive;">
        ${escapeHtml(n.nota)}
        <span class="nota-fecha">${n.fecha || ''}</span>
      </div>
      <button class="btn-borrar" data-id="${n.id}" title="Borrar nota">✕</button>
    </div>
  `).join('');

  lista.querySelectorAll('.btn-borrar').forEach(b => {
    b.addEventListener('click', () => borrarNota(b.dataset.id, b));
  });
}

// ============================================================
// EVENTOS INPUT
// ============================================================
input.addEventListener('input', () => {
  const len = input.value.length;
  contador.textContent = len + ' / 100';
  contador.classList.toggle('limite', len >= 100);
});
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); agregarNota(); }
  if (e.key === 'Escape') { input.blur(); }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!input.disabled && document.activeElement === input) {
      e.preventDefault();
      agregarNota();
    }
  }
});
$('btnAgregar').addEventListener('click', agregarNota);

// ============================================================
// FOOTER · Botón marca → WhatsApp
// ============================================================
(function initFooterMarca() {
  const btn = document.getElementById('btnMarca');
  if (!btn) return;

  const WHATSAPP_NUMERO = '51973952322';
  const MENSAJE = 'Quiero uno para mi por favor';

  btn.addEventListener('click', () => {
    reproducirSonido('ok');
    const texto = encodeURIComponent(MENSAJE);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
})();

// ============================================================
// ARRANQUE
// ============================================================
(async function init() {
  const sesionGuardada = sessionStorage.getItem(SESION_KEY);
  if (sesionGuardada) {
    try {
      const u = JSON.parse(sesionGuardada);
      const data = await apiGet({ action: 'listarUsuarios' });
      const existe = data.usuarios.find(x => x.id === u.id);
      if (existe) { entrarApp(existe); return; }
    } catch (e) {}
    sessionStorage.removeItem(SESION_KEY);
  }
  cargarUsuarios();
})();

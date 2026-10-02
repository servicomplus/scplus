// ============================================================
// UTILS · helpers puros (sin DOM, sin estado)
// ============================================================

// --- Números ---
function fmt2(n) {
  if (n == null || isNaN(n)) return '0.00';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function fmt0(n) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Parseo numérico robusto (para CSV: quita S/, $, comas de miles)
function num(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const s = String(v).trim()
    .replace(/[S\/\$]/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// --- Strings ---
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Normaliza texto para búsquedas (sin acentos, minúsculas)
function norm(s) {
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// --- Tooltips (encode HTML para data-* attribute) ---
function encodeTooltip(html) {
  return encodeURIComponent(html);
}

// --- Logging condicional ---
function log(...args) {
  if (typeof DEBUG !== 'undefined' && DEBUG) console.log(...args);
}
function warn(...args) {
  if (typeof DEBUG !== 'undefined' && DEBUG) console.warn(...args);
}

// --- Debounce ---
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// --- Copiar al portapapeles ---
function copiarAlPortapapeles(texto, mensaje) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto)
      .then(() => mostrarToast(mensaje))
      .catch(() => fallbackCopiar(texto, mensaje));
  } else {
    fallbackCopiar(texto, mensaje);
  }
}

function fallbackCopiar(texto, mensaje) {
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    mostrarToast(mensaje);
  } catch (e) {}
  document.body.removeChild(ta);
}

// --- Toast ---
let _toastTimer;
function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('span').textContent = mensaje || 'Copiado';
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
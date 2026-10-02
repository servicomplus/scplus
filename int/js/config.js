// ============================================================
// CONFIG · URLs, claves, constantes
// ============================================================

// --- Endpoints ---
const URL_SHEET  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=329818076&single=true&output=csv';
const URL_WEBAPP = 'https://script.google.com/macros/s/AKfycbyvExQLNzzJdYfhyHIF96l5xPTFe7E8r1kGbCt8Lsvrrf37AnLX5BfAaOj3c5RPfBQ/exec';

// --- Reportes (badges) ---
const URL_REP_PRECIOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=1940346287&single=true&output=csv';
const URL_REP_NUEVOS  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=936196408&single=true&output=csv';
const URL_REP_STOCK   = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT--WIefZyyedvTvaFRwXz_1aT0WvqmJbqt7rm1y0Lz-PWkT10IEF1kbbuDxjfpMG9wctAh4_SxzLVe/pub?gid=1393993617&single=true&output=csv';

// --- Storage keys ---
const KEY_SEDE    = 'servicomp_sede_v1';
const KEY_CARRITO = 'servicomp_carrito_v1';

// --- Paginación ---
const POR_TANDA = 24;

// --- Badges ---
const BADGE_DIAS_NUEVO  = 7;
const BADGE_DIAS_CAMBIO = 7;
const BADGE_PCT_MINIMO  = 1;
const BADGE_MAX_ICONOS  = 3;

// --- Exclusiones del catálogo ---
const CATEGORIAS_EXCLUIDAS = [
  'SERVICIO TECNICO', 'SERVICIOS OTROS', 'SERVICIOS VENTAS',
  'ACCESORIOS', 'DELTRON', 'DELTRON PC'
];
const MARCAS_EXCLUIDAS = ['ZZ OTRAS MARCAS', 'DELTRON'];
const PRECIOS_BASURA = [666, 9999999, 9999999.99];

// --- Debug ---
const DEBUG = false;
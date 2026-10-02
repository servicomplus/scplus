// ============================================================
// STATE · estado global de la aplicación
// ============================================================

// --- Catálogo ---
let DATA = [];
let DATA_FILTRADA = [];
let VISIBLES = 0;

// --- Sesión ---
let SEDE_ACTUAL = '';
let TC_ACTUAL = 0;

// --- Carrito ---
let CARRITO = [];

// --- Badges (reportes) ---
let DATA_PRECIOS = [];
let DATA_NUEVOS  = [];
let DATA_STOCK   = [];
let BADGES = {};
let FILTROS_BADGE = {
  nuevo: false,
  precioBaja: false,
  precioSube: false,
  stockBaja: false,
  stockSube: false
};
let BADGE_TOOLTIP_EL = null;

// --- Cotización ---
let ULTIMA_COT = null;
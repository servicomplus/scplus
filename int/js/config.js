// ============================================================
// CONFIG · constantes globales
// ============================================================

// --- URLs ---
const URL_SHEET        = 'https://docs.google.com/spreadsheets/d/e/TU_SHEET_ID/pub?gid=0&single=true&output=csv';
const URL_REP_PRECIOS  = 'https://docs.google.com/spreadsheets/d/e/TU_SHEET_ID/pub?gid=111&single=true&output=csv';
const URL_REP_NUEVOS   = 'https://docs.google.com/spreadsheets/d/e/TU_SHEET_ID/pub?gid=222&single=true&output=csv';
const URL_REP_STOCK    = 'https://docs.google.com/spreadsheets/d/e/TU_SHEET_ID/pub?gid=333&single=true&output=csv';
const URL_WEBAPP       = 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec';

// --- Storage keys ---
const KEY_SEDE         = 'servicomp_sede';
const KEY_CARRITO      = 'servicomp_carrito';
const KEY_FAV_CACHE    = 'servicomp_favoritos_cache_v1';

// --- Filtros de catálogo ---
const CATEGORIAS_EXCLUIDAS = ['SOFTWARE', 'SERVICIOS', 'GARANTIA'];
const MARCAS_EXCLUIDAS     = ['GENÉRICO', 'GENERICO', 'SIN MARCA'];
const PRECIOS_BASURA       = [0.01, 0.1, 1, 9999999];

// --- Badges ---
const BADGE_DIAS_NUEVO   = 7;    // días para considerar "nuevo"
const BADGE_DIAS_CAMBIO  = 7;    // días para considerar cambio de precio/stock
const BADGE_PCT_MINIMO   = 1;    // % mínimo de cambio para mostrar badge
const BADGE_MAX_ICONOS   = 4;    // máximo de iconos por fila

// --- Listado ---
const POR_TANDA = 40;            // productos por tanda (scroll infinito)

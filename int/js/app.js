// ============================================================
// APP · bootstrap de la aplicación
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initBadgeTooltip();
  initTooltipGlobal();
  initScrollListeners();
  initDelegacionEventos();

  cargarCarritoDeStorage();
  actualizarCarritoUI();
  cargarDatos();

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarCarrito();
      cerrarModal();
    }
    // "/" enfoca el buscador (si no está escribiendo ya)
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      document.getElementById('q')?.focus();
    }
  });
});
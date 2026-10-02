// ============================================================
// APP · bootstrap de la aplicación
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initBadgeTooltip();
  initTooltipGlobal();
  initScrollListeners();
  initDelegacionEventos();

  cargarCarritoDeStorage();
  actualizarCarritoUI();

  // 🔥 Esperar a que cargarDatos termine TODO (DATA + reportes + favoritos)
  try {
    await cargarDatos();
  } catch (e) {
    console.error('Fallo bootstrap:', e);
  }

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarCarrito();
      cerrarModal();
    }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      document.getElementById('q')?.focus();
    }
  });
});

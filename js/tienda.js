// ===== RENDER PRODUCT CARDS - MEJORADO =====
function renderProductCards(products) {
    return products.map(p => {
        const encodedCodigo = encodeURIComponent(p.codigo);
        const imgUrl = `https://www.deltron.com.pe/modulos/productos/items/image_ext.php?item=${encodedCodigo}&nomenu=1`;
        const cThumb = String(p.codigo).toLowerCase().trim();
        const sub1Thumb = cThumb.substring(0, 2);
        const sub2Thumb = cThumb.substring(2, 4);
        const thumbUrl = `https://imagenes.deltron.com.pe/images/productos/items/${sub1Thumb}/${sub2Thumb}/${cThumb}.jpg`;

        const stockStatus = getStockStatus(p.stock);
        const isFav = isFavorite(p.mini);
        const hasSpecs = p.specs && p.specs.length > 0;

        return `
        <div class="product-grid-card ${p.isFeatured ? 'featured' : ''}">
            <div class="img-wrapper">
                <a href="${imgUrl}" target="_blank" rel="noopener noreferrer" class="absolute inset-0 flex items-center justify-center">
                    <i class="fa-solid fa-camera placeholder-icon"></i>
                    <img src="${thumbUrl}" class="product-img" alt="${p.descripcion.replace(/"/g, '&quot;')}" loading="lazy"
                         onload="this.classList.add('loaded')"
                         onerror="this.style.display='none'">
                    <span class="view-label"><i class="fa-solid fa-eye mr-1"></i> Ver foto</span>
                </a>
                ${p.isFeatured ? `<span class="badge-featured"><i class="fa-solid fa-star mr-1"></i>${SECTION_NAME}</span>` : ''}
                <button class="favorite-btn ${isFav ? 'active' : ''}" data-mini="${String(p.mini).replace(/'/g, "\\'")}" onclick="toggleFavorite('${String(p.mini).replace(/'/g, "\\'")}')" title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>

            <div class="p-3 flex flex-col flex-1">
                <div class="badge-actions">
                    <span class="badge-brand"><i class="fa-solid fa-tag mr-1"></i>${p.marca}</span>
                    <button onclick="copyToClipboard('${String(p.mini).replace(/'/g, "\\'")}')" class="badge-mini" title="Copiar minicódigo">
                        <i class="fa-regular fa-copy mr-1"></i>${p.mini || '---'}
                    </button>
                    ${hasSpecs ? `<a href="${p.specs}" target="_blank" rel="noopener noreferrer" class="badge-specs" title="Ver especificaciones técnicas"><i class="fa-regular fa-file-lines mr-1"></i>Especificaciones</a>` : ''}
                    <button onclick="addToQuotation('${String(p.mini).replace(/'/g, "\\'")}')" class="badge-add" title="Agregar al carrito">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 min-h-[44px]">${p.descripcion}</h3>
                
                ${p.detalles ? `<p class="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-2">${p.detalles}</p>` : ''}
                
                <div class="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                    <div>
                        <span class="price-label">Precio</span>
                        <div class="price-tag">${formatMoney(p.precio)}</div>
                    </div>
                    <div>
                        <span class="stock-status ${stockStatus.class}">
                            ${stockStatus.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}
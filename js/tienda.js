// ================================================================ //
// TIENDA.JS - LÓGICA COMPLETA DEL CATÁLOGO                       //
// ================================================================ //

// ===== CONFIGURACIÓN =====
const SHEET_ID = "1nJBrtDv-_YS1VHkX6G_Wvc8fDk2YCZWWLelIWuSmFbI";
const SHEET_PRODUCTOS = "productos";
const POSIBLE_SECOND_SHEETS = ["destacados", "COTIZADOR", "OFERTAS", "NUEVOS", "TOP VENTAS", "PROMOCIONES"];
const PRODUCTS_PER_BATCH = 30;

let productsDB = [];
let featuredCodes = [];
let secondSheetName = "";
let SECTION_NAME = "Destacados";
let filters = { search: '', brand: '', sede: '' };
let displayedCount = 0;
let fullList = [];
let currentBatch = 0;

let favorites = JSON.parse(localStorage.getItem('servicomp_favorites') || '[]');

// ===== ESTADO DEL CARRITO =====
let quotationMap = new Map();

// ===== UTILIDADES =====
function formatMoney(amount) {
    return `S/ ${Math.floor(Number(amount) || 0).toLocaleString('en-US')}`;
}

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeNumber(value) {
    const cleaned = String(value ?? '').replace(/,/g, '').replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
}

function normalizeSede(sede) {
    return String(sede || '').trim().toUpperCase();
}

function isSedeAllowed(sede) {
    const sedesPermitidas = ['LIMA', 'HUANCAYO', 'LIMA - STORE', 'HUANCAYO - STORE'];
    const sedeNorm = normalizeSede(sede);
    return sedesPermitidas.some(s => sedeNorm === s || sedeNorm.includes(s));
}

function getStockStatus(stock) {
    if (stock <= 2) return { label: `🔴 ${stock}`, class: 'stock-critical' };
    if (stock <= 5) return { label: `🟡 ${stock}`, class: 'stock-low' };
    return { label: `🟢 ${stock}`, class: 'stock-available' };
}

function getCategory(product) {
    const text = `${product.descripcion} ${product.detalles}`.toLowerCase();
    if (text.includes('laptop')) return 'LAPTOPS';
    if (text.includes('monitor')) return 'MONITORES';
    if (text.includes('procesador')) return 'PROCESADORES';
    if (text.includes('placa')) return 'PLACAS';
    if (text.includes('memoria') || text.includes('ram')) return 'MEMORIAS';
    if (text.includes('ssd') || text.includes('disco')) return 'ALMACENAMIENTO';
    if (text.includes('impresora')) return 'IMPRESORAS';
    return 'GENERAL';
}

function isFavorite(miniCode) {
    return favorites.includes(miniCode);
}

// ===== DETECTAR SEGUNDA HOJA =====
async function detectSecondSheet() {
    for (const sheetName of POSIBLE_SECOND_SHEETS) {
        try {
            const url = `https://opensheet.elk.sh/${SHEET_ID}/${sheetName}`;
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                secondSheetName = sheetName;
                SECTION_NAME = sheetName;
                return secondSheetName;
            }
        } catch (error) {}
    }
    secondSheetName = "destacados";
    SECTION_NAME = "destacados";
    return "destacados";
}

// ===== CARGAR DESTACADOS =====
async function loadFeaturedCodes() {
    try {
        if (!secondSheetName) await detectSecondSheet();
        const url = `https://opensheet.elk.sh/${SHEET_ID}/${secondSheetName}`;
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        const codes = data
            .map(row => {
                const keys = Object.keys(row);
                const miniKey = keys.find(k => k.toLowerCase() === 'mini_codigo');
                if (miniKey) return normalizeText(row[miniKey]);
                if (keys.length > 0) return normalizeText(row[keys[0]]);
                return '';
            })
            .filter(code => code !== '');
        return codes;
    } catch (error) {
        return [];
    }
}

// ===== CARGAR BASE DE DATOS =====
async function loadDatabase() {
    try {
        await detectSecondSheet();
        featuredCodes = await loadFeaturedCodes();

        const urlProductos = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_PRODUCTOS}`;
        const response = await fetch(urlProductos);
        if (!response.ok) throw new Error('No se pudo cargar la hoja de productos');
        const rawProducts = await response.json();

        productsDB = rawProducts
            .map(row => {
                const rawSede = row.sede !== undefined ? row.sede : (row.Sede ? row.Sede : '');
                return {
                    codigo: normalizeText(row.codigo),
                    mini: normalizeText(row.mini_codigo),
                    descripcion: normalizeText(row.descripcion),
                    marca: normalizeText(row.marca) || 'GENÉRICO',
                    detalles: normalizeText(row.detalles),
                    specs: normalizeText(row.specs) || normalizeText(row.O) || '',
                    precio: normalizeNumber(row.precio_soles) || normalizeNumber(row.h),
                    precioDolares: normalizeNumber(row.precio_dolares),
                    precioCompra: normalizeNumber(row.precio_compra),
                    ganancia: normalizeNumber(row.ganancia) || normalizeNumber(row.j),
                    stock: Math.floor(normalizeNumber(row.stock)),
                    tipoCambio: normalizeNumber(row.tipo_cambio) || normalizeNumber(row.k3),
                    categoria: getCategory(row),
                    sede: normalizeSede(rawSede) || '',
                    isFeatured: false
                };
            })
            .filter(p => p.stock > 0 && (p.codigo || p.mini || p.descripcion))
            .filter(p => isSedeAllowed(p.sede));

        productsDB.forEach(p => {
            p.isFeatured = featuredCodes.includes(p.mini);
        });

        const validTC = productsDB.find(p => p.tipoCambio > 0)?.tipoCambio || 0;
        document.getElementById('exchangeRate').textContent = validTC ? `TC: ${validTC.toFixed(2)}` : 'TC: —';

        populateFiltersUI();
        applyFilters();
    } catch (error) {
        console.error('Error cargando base de datos:', error);
        Swal.fire('Error', 'No se pudo conectar con Google Sheets.', 'error');
    }
}

// ===== FILTROS UI =====
function populateFiltersUI() {
    const brandSelect = document.getElementById('brandSelect');
    const sedeSelect = document.getElementById('sedeSelect');

    brandSelect.innerHTML = '<option value="">Todas las Marcas</option>';
    sedeSelect.innerHTML = '<option value="">Todas las Sedes</option>';

    const brands = [...new Set(productsDB.map(p => p.marca).filter(Boolean))].sort();
    const sedes = [...new Set(productsDB.map(p => p.sede).filter(s => s && s.trim() !== ""))].sort();

    brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        brandSelect.appendChild(opt);
    });

    sedes.forEach(sede => {
        const opt = document.createElement('option');
        opt.value = sede;
        opt.textContent = sede;
        sedeSelect.appendChild(opt);
    });
}

// ===== APLICAR FILTROS =====
function applyFilters() {
    filters.brand = document.getElementById('brandSelect').value;
    filters.sede = document.getElementById('sedeSelect').value;
    filters.search = document.getElementById('searchInput').value.toLowerCase();

    let filtered = productsDB.filter(p => {
        if (filters.brand && p.marca !== filters.brand) return false;
        if (filters.sede && p.sede !== filters.sede) return false;
        if (filters.search) {
            const searchText = `${p.descripcion} ${p.detalles} ${p.marca} ${p.mini}`.toLowerCase();
            if (!searchText.includes(filters.search)) return false;
        }
        return true;
    });

    const featured = shuffleArray(filtered.filter(p => p.isFeatured));
    const rest = shuffleArray(filtered.filter(p => !p.isFeatured));

    fullList = [...featured, ...rest];
    
    currentBatch = 0;
    displayedCount = 0;

    document.getElementById('resultCount').textContent = filtered.length;
    document.getElementById('productsList').innerHTML = '';
    loadNextBatch();
}

// ===== LOAD NEXT BATCH =====
function loadNextBatch() {
    const container = document.getElementById('productsList');
    const loadMore = document.getElementById('loadMoreTrigger');

    const start = currentBatch * PRODUCTS_PER_BATCH;
    const end = Math.min(start + PRODUCTS_PER_BATCH, fullList.length);
    const batch = fullList.slice(start, end);

    if (batch.length === 0) {
        if (displayedCount === 0) {
            container.innerHTML = `<div class="text-center py-16 text-gray-400 dark:text-gray-500"><i class="fa-regular fa-magnifying-glass text-3xl mb-3 opacity-20"></i><p class="font-light text-sm">No hay productos con los filtros seleccionados.</p></div>`;
        }
        loadMore.classList.add('hidden');
        return;
    }

    const allFeatured = fullList.filter(p => p.isFeatured).length;
    const isFirstBatch = currentBatch === 0;

    let html = '';

    if (isFirstBatch && allFeatured > 0) {
        const featuredItems = batch.filter(p => p.isFeatured);
        const restItems = batch.filter(p => !p.isFeatured);

        if (featuredItems.length > 0) {
            html += `
                <div class="mb-6">
                    <div class="featured-section-title mb-3">
                        <i class="fa-solid fa-star"></i>
                        ${SECTION_NAME}
                        <span class="text-[9px] font-medium text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full dark:text-gray-500 dark:bg-gray-800/80">${allFeatured}</span>
                        <span class="line"></span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        ${renderProductCards(featuredItems)}
                    </div>
                </div>
            `;
        }

        if (restItems.length > 0) {
            html += `
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-[9px] font-bold text-gray-500 tracking-widest uppercase dark:text-gray-400">
                            <i class="fa-solid fa-grid-2 mr-1.5"></i>Todos los productos
                        </span>
                        <span class="text-[9px] font-medium text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full dark:text-gray-500 dark:bg-gray-800/80">${fullList.length - allFeatured}</span>
                        <span class="flex-1 h-px bg-gray-200/60 dark:bg-gray-800/60"></span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        ${renderProductCards(restItems)}
                    </div>
                </div>
            `;
        }
    } else {
        html = `
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                ${renderProductCards(batch)}
            </div>
        `;
    }

    if (isFirstBatch) {
        container.innerHTML = html;
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        while (tempDiv.firstChild) {
            container.appendChild(tempDiv.firstChild);
        }
    }

    displayedCount += batch.length;
    currentBatch++;

    if (currentBatch * PRODUCTS_PER_BATCH < fullList.length) {
        loadMore.classList.remove('hidden');
        if (!window.loadMoreObserver) {
            window.loadMoreObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadNextBatch();
                }
            }, { rootMargin: '200px' });
        }
        window.loadMoreObserver.observe(loadMore);
    } else {
        loadMore.classList.add('hidden');
        if (window.loadMoreObserver) {
            window.loadMoreObserver.disconnect();
            window.loadMoreObserver = null;
        }
    }
}

// ===== RENDER PRODUCT CARDS =====
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
                ${p.isFeatured ? `<span class="absolute top-1.5 left-1.5 badge-featured"><i class="fa-solid fa-star mr-1"></i>${SECTION_NAME}</span>` : ''}
                <button class="favorite-btn ${isFav ? 'active' : ''}" data-mini="${String(p.mini).replace(/'/g, "\\'")}" onclick="toggleFavorite('${String(p.mini).replace(/'/g, "\\'")}')" title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>

            <div class="p-3 flex flex-col flex-1">
                <div class="badge-actions mb-1.5">
                    <span class="badge-brand"><i class="fa-solid fa-tag mr-1"></i>${p.marca}</span>
                    <button onclick="copyToClipboard('${String(p.mini).replace(/'/g, "\\'")}')" class="badge-mini" title="Copiar minicódigo">
                        <i class="fa-regular fa-copy mr-1"></i>${p.mini || '---'}
                    </button>
                    ${hasSpecs ? `<a href="${p.specs}" target="_blank" rel="noopener noreferrer" class="badge-specs" title="Ver especificaciones técnicas"><i class="fa-regular fa-file-lines mr-1"></i>Especificaciones</a>` : ''}
                    <button onclick="addToQuotation('${String(p.mini).replace(/'/g, "\\'")}')" class="badge-add" title="Agregar al carrito">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <h3 class="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2 min-h-[40px] dark:text-gray-200">${p.descripcion}</h3>
                <p class="text-[10px] text-gray-400 font-light leading-relaxed line-clamp-1 mb-2 dark:text-gray-500">${p.detalles || ''}</p>

                <div class="flex items-center justify-between pt-1.5 border-t border-gray-50 mt-auto dark:border-gray-800">
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

// ===== COPIAR AL PORTAPAPELES =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = document.getElementById('copyFeedback');
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 1500);
    }).catch(() => {
        Swal.fire('Error', 'No se pudo copiar', 'error');
    });
}

// ===== FAVORITOS =====
function toggleFavorite(miniCode) {
    const index = favorites.indexOf(miniCode);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(miniCode);
    }
    localStorage.setItem('servicomp_favorites', JSON.stringify(favorites));
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const code = btn.getAttribute('data-mini');
        if (code === miniCode) {
            const isFav = favorites.includes(miniCode);
            btn.classList.toggle('active', isFav);
            btn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>`;
            btn.title = isFav ? 'Quitar de favoritos' : 'Agregar a favoritos';
        }
    });
}

// ================================================================ //
// CARRITO DE COMPRAS                                              //
// ================================================================ //

function addToQuotation(miniCode) {
    const product = productsDB.find(p => p.mini === miniCode);
    if (!product) {
        Swal.fire('Error', 'Producto no encontrado en el catálogo', 'error');
        return false;
    }
    if (quotationMap.has(miniCode)) {
        let item = quotationMap.get(miniCode);
        item.quantity += 1;
        quotationMap.set(miniCode, item);
    } else {
        quotationMap.set(miniCode, { product: product, quantity: 1 });
    }
    renderQuotationTable();
    updateCartBadge();
    Swal.fire({ title: '✓ Agregado', text: `${product.descripcion.substring(0, 30)} x1`, icon: 'success', toast: true, timer: 800, showConfirmButton: false, position: 'top-end' });
    return true;
}

function removeFromQuotation(miniCode, fullRemove = false) {
    if (quotationMap.has(miniCode)) {
        let item = quotationMap.get(miniCode);
        if (fullRemove || item.quantity <= 1) quotationMap.delete(miniCode);
        else { item.quantity -= 1; quotationMap.set(miniCode, item); }
        renderQuotationTable();
        updateCartBadge();
    }
}

function renderQuotationTable() {
    const container = document.getElementById('quotationItemsContainer');
    if (quotationMap.size === 0) {
        container.innerHTML = `<div class="p-6 text-center text-gray-400 text-xs font-light dark:text-gray-500">🛒 Agrega productos desde el catálogo</div>`;
        updateSummary();
        return;
    }
    let html = `<table class="w-full text-xs"><thead class="text-gray-400 text-[8px] font-medium tracking-widest uppercase dark:text-gray-500"><tr>
        <th class="p-1.5 text-left">Código</th><th class="p-1.5 text-left">Producto</th><th class="p-1.5 text-center">Cant</th><th class="p-1.5 text-right">P/U</th><th class="p-1.5 text-right">Total</th><th></th>
    </tr></thead><tbody>`;
    for (let [mini, item] of quotationMap.entries()) {
        const prod = item.product;
        const total = prod.precio * item.quantity;
        html += `<tr class="qt-row">
            <td class="p-1.5 font-mono text-[10px] font-semibold text-gray-600 dark:text-gray-400">${mini}</td>
            <td class="p-1.5 text-[10px] text-gray-600 truncate max-w-[100px] dark:text-gray-400" title="${prod.descripcion}">${prod.descripcion.substring(0, 25)}</td>
            <td class="p-1.5 text-center"><div class="flex items-center justify-center gap-1.5"><button onclick="removeFromQuotation('${mini}',false)" class="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[10px] font-bold transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">-</button><span class="w-6 text-center text-xs font-bold text-gray-800 dark:text-white">${item.quantity}</span><button onclick="addToQuotation('${mini}')" class="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-[10px] font-bold transition dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400">+</button></div></td>
            <td class="p-1.5 text-right text-[10px] font-mono text-gray-500 dark:text-gray-400">${formatMoney(prod.precio)}</td>
            <td class="p-1.5 text-right font-bold text-blue-600 text-xs dark:text-blue-400">${formatMoney(total)}</td>
            <td class="p-1.5 text-center"><button onclick="removeFromQuotation('${mini}',true)" class="text-gray-300 hover:text-red-500 transition dark:text-gray-600 dark:hover:text-red-400"><i class="fa-regular fa-trash-can"></i></button></td>
        </tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
    updateSummary();
}

function updateSummary() {
    let distinct = quotationMap.size;
    let totalUnits = 0, subtotal = 0;
    for (let item of quotationMap.values()) {
        totalUnits += item.quantity;
        subtotal += item.product.precio * item.quantity;
    }
    let shipping = normalizeNumber(document.getElementById('shippingCost').value);
    let total = subtotal + shipping;
    document.getElementById('summaryDistinct').innerText = distinct;
    document.getElementById('summaryUnits').innerText = totalUnits;
    document.getElementById('summarySubtotal').innerHTML = formatMoney(subtotal);
    document.getElementById('summaryTotal').innerHTML = formatMoney(total);
}

function clearQuotation() { quotationMap.clear(); renderQuotationTable(); updateCartBadge(); }

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    let totalItems = 0;
    for (let item of quotationMap.values()) totalItems += item.quantity;
    if (totalItems > 0) {
        badge.innerText = totalItems > 9 ? '9+' : totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ===== EXPORTAR FUNCIONES =====
function copyWhatsAppMessage() {
    if (quotationMap.size === 0) return Swal.fire('Carrito vacío', 'Agrega productos', 'info');
    let lines = ["📋 *COTIZACIÓN - SERVICOMP+*", "━━━━━━━━━━━━━━━━━━", ""];
    for (let [mini, item] of quotationMap.entries()) {
        lines.push(`*${mini}* - ${item.product.descripcion.substring(0, 50)}`);
        lines.push(`└ Cant: ${item.quantity} | P/U: ${formatMoney(item.product.precio)} | Total: ${formatMoney(item.product.precio * item.quantity)}`);
        lines.push(``);
    }
    let shipping = normalizeNumber(document.getElementById('shippingCost').value);
    let subtotal = 0; for (let i of quotationMap.values()) subtotal += i.product.precio * i.quantity;
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`🚚 *Envío:* ${formatMoney(shipping)}`);
    lines.push(`💰 *TOTAL:* ${formatMoney(subtotal + shipping)}`);
    lines.push(`📅 ${new Date().toLocaleDateString('es-PE')}`);
    lines.push(`✨ ¡Gracias por tu cotización!`);
    navigator.clipboard.writeText(lines.join('\n'));
    const toast = document.getElementById('copyFeedback');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
    Swal.fire('✓ Copiado', 'Texto listo para WhatsApp', 'success');
}

function exportPDF() {
    if (quotationMap.size === 0) return Swal.fire('Vacío', 'No hay productos', 'warning');
    const printDiv = document.createElement('div');
    let subtotalCalc = 0;
    for(let it of quotationMap.values()) subtotalCalc += it.product.precio * it.quantity;
    const shippingVal = normalizeNumber(document.getElementById('shippingCost').value);
    printDiv.innerHTML = `
        <div style="padding:30px;font-family:'Inter',sans-serif;max-width:800px;margin:0 auto;background:#fff;">
            <div style="display:flex;gap:15px;align-items:center;border-bottom:2px solid #1a3a5c;padding-bottom:16px;margin-bottom:20px;">
                <div style="background:#fff;width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #eee;"><img src="img/logo.png" style="height:40px;width:auto;" alt="ServiComp+" onerror="this.style.display='none';this.parentElement.innerHTML='SC'"></div>
                <div><h2 style="font-size:22px;font-weight:800;color:#111;">ServiComp+</h2><p style="color:#666;font-weight:300;font-size:12px;">Cotización generada</p></div>
            </div>
            <p style="color:#444;font-size:13px;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-PE')}</p>
            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <thead><tr style="background:#f8fafc;"><th style="padding:10px;text-align:left;color:#222;font-size:11px;">Código</th><th style="padding:10px;text-align:left;color:#222;font-size:11px;">Producto</th><th style="padding:10px;text-align:center;color:#222;font-size:11px;">Cant</th><th style="padding:10px;text-align:right;color:#222;font-size:11px;">Precio</th><th style="padding:10px;text-align:right;color:#222;font-size:11px;">Total</th></tr></thead>
                <tbody>${Array.from(quotationMap.entries()).map(([mini, item]) => `<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;color:#333;font-size:12px;font-family:monospace;">${mini}</td><td style="padding:8px;color:#333;font-size:12px;">${item.product.descripcion}</td><td style="padding:8px;text-align:center;color:#333;font-size:12px;">${item.quantity}</td><td style="padding:8px;text-align:right;color:#333;font-size:12px;">${formatMoney(item.product.precio)}</td><td style="padding:8px;text-align:right;color:#333;font-size:12px;">${formatMoney(item.product.precio * item.quantity)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="margin-top:30px;text-align:right;border-top:2px solid #eee;padding-top:16px;">
                <p style="color:#444;font-size:13px;"><strong>Subtotal:</strong> ${formatMoney(subtotalCalc)}</p>
                <p style="color:#444;font-size:13px;"><strong>Envío:</strong> ${formatMoney(shippingVal)}</p>
                <h3 style="font-size:24px;color:#1a3a5c;">TOTAL: ${formatMoney(subtotalCalc + shippingVal)}</h3>
            </div>
        </div>`;
    html2pdf().from(printDiv).set({ margin: 0.5, filename: `cotizacion_${Date.now()}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4' } }).save();
}

function printQuotation() { window.print(); }

function addMultipleQuickCodes() {
    let raw = document.getElementById('quickCodeInput').value;
    let codes = raw.split(/[ ,\n]+/).filter(c => c.trim().length > 0);
    if(codes.length === 0) return;
    codes.forEach(code => addToQuotation(code.trim()));
    document.getElementById('quickCodeInput').value = '';
}

// ================================================================ //
// EVENT LISTENERS                                                 //
// ================================================================ //

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CARGAR BASE DE DATOS =====
    loadDatabase();

    // ===== EVENTOS DEL PANEL =====
    document.getElementById('floatingCartBtn').addEventListener('click', () => {
        document.getElementById('quotationPanel').classList.remove('translate-x-full');
    });
    document.getElementById('closePanelBtn').addEventListener('click', () => {
        document.getElementById('quotationPanel').classList.add('translate-x-full');
    });
    document.getElementById('clearQuotationBtn').addEventListener('click', clearQuotation);
    document.getElementById('genWhatsappBtn').addEventListener('click', copyWhatsAppMessage);
    document.getElementById('genPDFBtn').addEventListener('click', exportPDF);
    document.getElementById('printBtn').addEventListener('click', printQuotation);
    document.getElementById('addQuickCodeBtn').addEventListener('click', addMultipleQuickCodes);
    document.getElementById('quickCodeInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') addMultipleQuickCodes(); });
    document.getElementById('shippingCost').addEventListener('input', () => updateSummary());

    // ===== FILTROS =====
    document.getElementById('brandSelect').addEventListener('change', () => {
        applyFilters();
        if (window.loadMoreObserver) {
            window.loadMoreObserver.disconnect();
            window.loadMoreObserver = null;
        }
    });
    document.getElementById('sedeSelect').addEventListener('change', () => {
        applyFilters();
        if (window.loadMoreObserver) {
            window.loadMoreObserver.disconnect();
            window.loadMoreObserver = null;
        }
    });
    document.getElementById('searchInput').addEventListener('input', () => {
        applyFilters();
        if (window.loadMoreObserver) {
            window.loadMoreObserver.disconnect();
            window.loadMoreObserver = null;
        }
    });

    // ===== LOAD MORE OBSERVER =====
    if (!window.loadMoreObserver) {
        window.loadMoreObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadNextBatch();
            }
        }, { rootMargin: '200px' });
    }
});

// ===== EXPONER FUNCIONES GLOBALES =====
window.addToQuotation = addToQuotation;
window.removeFromQuotation = removeFromQuotation;
window.toggleFavorite = toggleFavorite;
window.copyToClipboard = copyToClipboard;
window.clearQuotation = clearQuotation;
window.exportPDF = exportPDF;
window.printQuotation = printQuotation;
window.copyWhatsAppMessage = copyWhatsAppMessage;
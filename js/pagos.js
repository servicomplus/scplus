/* ============================================================
   1. GENERADOR QR NATIVO (Para los que no tienen imagen)
   ============================================================ */
const QR = (() => {
  const CAPACITY_M = [0,14,26,42,62,84,106,122,152,180,213];
  const EC_BLOCKS_M = { 1:[1,10], 2:[1,16], 3:[1,26], 4:[2,18], 5:[2,24], 6:[4,16], 7:[4,18], 8:[4,22], 9:[5,22], 10:[5,26] };
  const EXP = new Uint8Array(512); const LOG = new Uint8Array(256);
  (() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function gfMul(a, b) { if (a === 0 || b === 0) return 0; return EXP[LOG[a] + LOG[b]]; }
  function rsGenerator(degree) { let poly = [1]; for (let i = 0; i < degree; i++) { const next = new Array(poly.length + 1).fill(0); for (let j = 0; j < poly.length; j++) { next[j] ^= poly[j]; next[j + 1] ^= gfMul(poly[j], EXP[i]); } poly = next; } return poly; }
  function rsEncode(data, ecCount) { const gen = rsGenerator(ecCount); const res = new Uint8Array(data.length + ecCount); res.set(data); for (let i = 0; i < data.length; i++) { const factor = res[i]; if (factor === 0) continue; for (let j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], factor); } return res.slice(data.length); }
  function getAlignmentPositions(version) { if (version === 1) return []; const size = version * 4 + 17; const numAlign = Math.floor(version / 7) + 2; const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2; const positions = [6]; let pos = size - 7; for (let i = 1; i < numAlign; i++) { positions.splice(1, 0, pos); pos -= step; } return positions; }
  function maskCondition(mask, r, c) { switch (mask) { case 0: return (r + c) % 2 === 0; case 1: return r % 2 === 0; case 2: return c % 3 === 0; case 3: return (r + c) % 3 === 0; case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; case 5: return ((r * c) % 2) + ((r * c) % 3) === 0; case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; } return false; }
  function getFormatBits(ecLevel, mask) { const ecBits = ecLevel === 1 ? 0 : (ecLevel === 0 ? 1 : (ecLevel === 2 ? 3 : 2)); const data = (ecBits << 3) | mask; let rem = data; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537); return ((data << 10) | rem) ^ 0x5412; }
  function placeFormatInfo(modules, size, formatBits) { const p1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]]; const p2 = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]]; for (let i = 0; i < 15; i++) { const bit = ((formatBits >> i) & 1) === 1; const [r1, c1] = p1[i]; const [r2, c2] = p2[i]; modules[r1][c1] = bit; modules[r2][c2] = bit; } }
  
  function makeMatrix(version, dataBytes, ecLevel) {
    const size = version * 4 + 17; const modules = Array.from({ length: size }, () => new Array(size).fill(false)); const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
    function placeFinder(r, c) { for (let dr = -1; dr <= 7; dr++) { for (let dc = -1; dc <= 7; dc++) { const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue; const inside = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6; const border = dr === 0 || dr === 6 || dc === 0 || dc === 6; const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4; modules[rr][cc] = inside && (border || center); isFunction[rr][cc] = true; } } }
    placeFinder(0, 0); placeFinder(0, size - 7); placeFinder(size - 7, 0);
    for (let i = 8; i < size - 8; i++) { modules[6][i] = i % 2 === 0; modules[i][6] = i % 2 === 0; isFunction[6][i] = true; isFunction[i][6] = true; }
    modules[size - 8][8] = true; isFunction[size - 8][8] = true;
    if (version >= 2) { const alignPos = getAlignmentPositions(version); for (const r of alignPos) { for (const c of alignPos) { if ((r < 8 && c < 8) || (r < 8 && c > size - 9) || (r > size - 9 && c < 8)) continue; for (let dr = -2; dr <= 2; dr++) { for (let dc = -2; dc <= 2; dc++) { const ring = Math.max(Math.abs(dr), Math.abs(dc)); modules[r + dr][c + dc] = ring !== 1; isFunction[r + dr][c + dc] = true; } } } } }
    for (let i = 0; i < 9; i++) { if (!isFunction[8][i]) isFunction[8][i] = true; if (!isFunction[i][8]) isFunction[i][8] = true; }
    for (let i = 0; i < 8; i++) { isFunction[8][size - 1 - i] = true; isFunction[size - 1 - i][8] = true; }
    const totalDataCodewords = CAPACITY_M[version]; const [numBlocks, ecPerBlock] = EC_BLOCKS_M[version];
    const bits = []; const pushBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    pushBits(0b0100, 4); if (version <= 9) pushBits(dataBytes.length, 8); else pushBits(dataBytes.length, 16); for (const b of dataBytes) pushBits(b, 8);
    const totalDataBits = totalDataCodewords * 8; for (let i = 0; i < 4 && bits.length < totalDataBits; i++) bits.push(0); while (bits.length % 8 !== 0) bits.push(0);
    const dataCodewords = []; for (let i = 0; i < bits.length; i += 8) { let byte = 0; for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]; dataCodewords.push(byte); }
    const padBytes = [0xEC, 0x11]; let padIdx = 0; while (dataCodewords.length < totalDataCodewords) dataCodewords.push(padBytes[padIdx++ % 2]);
    const dataPerBlock = Math.floor(totalDataCodewords / numBlocks); const extra = totalDataCodewords % numBlocks; const blocks = []; let offset = 0;
    for (let b = 0; b < numBlocks; b++) { const len = dataPerBlock + (b >= numBlocks - extra ? 1 : 0); blocks.push(dataCodewords.slice(offset, offset + len)); offset += len; }
    const ecBlocks = blocks.map(b => rsEncode(Uint8Array.from(b), ecPerBlock));
    const finalCodewords = []; const maxLen = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < maxLen; i++) { for (const b of blocks) if (i < b.length) finalCodewords.push(b[i]); }
    for (let i = 0; i < ecPerBlock; i++) { for (const ec of ecBlocks) if (i < ec.length) finalCodewords.push(ec[i]); }
    const dataBits = []; for (const cw of finalCodewords) { for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1); }
    let bitIdx = 0; let upward = true;
    for (let col = size - 1; col > 0; col -= 2) { if (col === 6) col--; for (let i = 0; i < size; i++) { const row = upward ? size - 1 - i : i; for (let dc = 0; dc < 2; dc++) { const c = col - dc; if (isFunction[row][c]) continue; modules[row][c] = bitIdx < dataBits.length ? !!dataBits[bitIdx] : false; bitIdx++; } } upward = !upward; }
    const mask = 0; for (let r = 0; r < size; r++) { for (let c = 0; c < size; c++) { if (isFunction[r][c]) continue; if (maskCondition(mask, r, c)) modules[r][c] = !modules[r][c]; } }
    placeFormatInfo(modules, size, getFormatBits(ecLevel, mask)); return modules;
  }
  function draw(text, canvas) {
    const bytes = new TextEncoder().encode(text); let version = 1;
    for (let v = 1; v <= 10; v++) { if (bytes.length <= CAPACITY_M[v] - 3) { version = v; break; } version = v; }
    const modules = makeMatrix(version, bytes, 1); const size = modules.length; const ctx = canvas.getContext('2d');
    const scale = Math.floor(canvas.width / (size + 8)); const offset = Math.floor((canvas.width - size * scale) / 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#0a0906';
    for (let r = 0; r < size; r++) { for (let c = 0; c < size; c++) { if (modules[r][c]) ctx.fillRect(offset + c * scale, offset + r * scale, scale, scale); } }
  }
  return { draw };
})();

/* ============================================================
   2. CONFIGURACIÓN DE MÉTODOS 
   ============================================================ */
const METHODS_CONFIG = [
  // --- BILLETERAS ---
 { key:'yape', category:'Billeteras', label:'Yape', value:'973 952 322', holder:'Adolfo Flores',        
  type:'copy', qr:true,  qrImage:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792248429/qr_yape.webp', 
  enabled:true,  accent:'136, 17, 153',  
  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/yape-1782274064456.webp' },
 
 { key:'sip', category:'Billeteras', label:'Sip', value:'973 952 322', holder:'Adolfo Flores',        
  type:'copy', qr:true,  qrImage:'', 
  enabled:false,  accent:'0, 163, 255',   
  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/sip-1784069516759.webp' },
 
 { key:'lemon', category:'Billeteras', label:'Lemon', value:'973 952 322', holder:'Adolfo Flores',        
  type:'copy', qr:true, qrImage:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792248428/qr_lemon.webp', 
  enabled:true,  accent:'0, 230, 118',   
  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/lemon-1784070174205.webp' },
 
 
 { key:'plin', category:'Billeteras', label:'Plin', value:'973 952 322', holder:'Adolfo Flores',        
  type:'copy', qr:true,  qrImage:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792248429/qr_plin.webp', 
  enabled:true,  accent:'0, 200, 232',   
  icon:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792246781/plin.webp' },
 

 { key:'wayki', category:'Billeteras', label:'Wayki', value:'973 952 322', holder:'Adolfo Flores', 
 type:'copy', qr:true, qrImage:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792248429/qr_wayki.webp',
 enabled:true, accent:'230, 185, 92',  qrImage:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792248429/qr_wayki.webp', 
 icon:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792247145/wayki.webp' }, 

  
// --- BANCOS ---
{ key:'bcp',  category:'Bancos', label:'BCP - Transeferencia app',  value:'35073569498054',   
  holder:'Adolfo Flores', type:'bank', qr:false, enabled:true,  accent:'38, 73, 197',   
  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/bcp-1782273993174.webp', 
  cci:'00235017356949805471' },


{ key:'pichincha',    category:'Bancos',     label:'Banco Pichincha', value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'251, 223, 73',  icon:'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/34/47/ea/3447ea8e-73e3-bebe-cc2b-69b0ba9b3b06/Placeholder.mill/400x400bb-75.webp', cci:'' },
{ key:'interbank',    category:'Bancos',     label:'Interbank',       value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'86, 189, 93',   icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/interbank-1782274025469.webp', cci:'' },
{ key:'bbva',         category:'Bancos',     label:'BBVA Perú',       value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'3, 19, 141',    icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/bbva-pe-1782273985456.webp', cci:'' },
{ key:'scotiabank',   category:'Bancos',     label:'Scotiabank Perú', value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'226, 65, 61',   icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/scotiabank-pe-1782274044189.webp', cci:'' },
{ key:'banbif',       category:'Bancos',     label:'BanBif',          value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'0, 102, 51',    icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/banbif-1782880195127.webp', cci:'' },

// --- CAJAS MUNICIPALES ---
{ key:'caja_cusco',   category:'Cajas Municipales',     label:'Caja Cusco',      value:'10680232100009331',                     
  holder:'Adolfo Flores', type:'bank', qr:false, enabled:true, accent:'227, 30, 36',   
  icon:'https://res.cloudinary.com/s4ffj1rj/image/upload/v1792249203/cusco.webp', 
  cci:'80608032100009331181' }, 

{ key:'caja_arequipa',category:'Cajas Municipales',     label:'Caja Arequipa',   value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'0, 84, 166',    icon:'img/caja-arequipa.png', cci:'' }, // Azul institucional
{ key:'caja_huancayo',category:'Cajas Municipales',     label:'Caja Huancayo',   value:'',                     holder:'Adolfo Flores', type:'bank', qr:false, enabled:false, accent:'227, 30, 36',   icon:'img/caja-huancayo.png', cci:'' }, // Rojo confirmado

// --- CRYPTO ---
{ key:'binance',      category:'Crypto',     label:'Binance Pay',     value:'',                     holder:'Adolfo Flores', type:'copy', qr:false, enabled:false, accent:'243, 186, 47',  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/binance-pay-1782858861541.webp' },
{ key:'usdt_trc20',   category:'Crypto',     label:'USDT (TRC20)',    value:'',                     holder:'Adolfo Flores', type:'copy', qr:false, enabled:false, accent:'38, 161, 123',  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/usdt-trc20-1782858893423.webp' },
{ key:'usdt_erc20',   category:'Crypto',     label:'USDT (ERC20)',    value:'',                     holder:'Adolfo Flores', type:'copy', qr:false, enabled:false, accent:'38, 161, 123',  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/usdt-erc20-1782879655191.webp' },
{ key:'btc',          category:'Crypto',     label:'Bitcoin (BTC)',   value:'',                     holder:'Adolfo Flores', type:'copy', qr:false, enabled:false, accent:'247, 147, 26',  icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/btc-1782879714276.webp' },

// --- INTERNACIONAL ---
{ key:'paypal',       category:'Internacional', label:'PayPal',      value:'servicomp2021@gmail.com',              holder:'digicode', type:'copy', qr:false, enabled:true,  accent:'12, 40, 140',   icon:'https://emwytajmsyzazacbraos.supabase.co/storage/v1/object/public/library/paypal-1782274034669.webp' }];

/* ============================================================
   3. ICONOS Y UTILIDADES
   ============================================================ */
const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_EYE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_QR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`;

const container = document.getElementById('methods');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
let toastTimer = null;

function showToast(msg) {
  toastText.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
    return ok;
  }
}

/* ============================================================
   4. MODAL QR (Con soporte para imágenes oficiales)
   ============================================================ */
const qrOverlay = document.getElementById('qrOverlay');
const qrPanel = document.getElementById('qrPanel');
const qrClose = document.getElementById('qrClose');
const qrTitle = document.getElementById('qrTitle');
const qrValue = document.getElementById('qrValue');
const qrHolder = document.getElementById('qrHolder');
const qrBrandIcon = document.getElementById('qrBrandIcon');
const qrCopy = document.getElementById('qrCopy');
const qrFrame = document.querySelector('.qr-frame');
let currentQrValue = '';

function openQR(method) {
  currentQrValue = method.value;
  qrTitle.textContent = method.label;
  qrValue.textContent = method.value;
  qrHolder.textContent = method.holder; // El nombre específico del método
  qrPanel.style.setProperty('--accent', method.accent);
  qrBrandIcon.innerHTML = `<img src="${method.icon}" alt="" onerror="this.style.display='none'">`;

  // Limpiar el marco del QR
  qrFrame.innerHTML = `
    <span class="qr-corner tl"></span>
    <span class="qr-corner tr"></span>
    <span class="qr-corner bl"></span>
    <span class="qr-corner br"></span>
  `;

  if (method.qrImage) {
    // Si tiene imagen oficial
    const img = document.createElement('img');
    img.src = method.qrImage;
    img.alt = `QR de ${method.label}`;
    qrFrame.appendChild(img);
  } else {
    // Si no tiene imagen, generamos el QR nativo
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 440;
    qrFrame.appendChild(canvas);
    QR.draw(method.value, canvas);
  }

  qrOverlay.classList.add('open');
}

function closeQR() { qrOverlay.classList.remove('open'); }
qrClose.addEventListener('click', closeQR);
qrOverlay.addEventListener('click', (e) => { if (e.target === qrOverlay) closeQR(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && qrOverlay.classList.contains('open')) closeQR(); });

qrCopy.addEventListener('click', async () => {
  if (await copyToClipboard(currentQrValue)) {
    showToast('Copiado');
    qrCopy.innerHTML = ICON_CHECK;
    setTimeout(() => { qrCopy.innerHTML = ICON_COPY; }, 1400);
  }
});

/* ============================================================
   5. RENDERIZADO DINÁMICO
   ============================================================ */
let currentCategory = '';
let animIndex = 0;

METHODS_CONFIG.filter(m => m.enabled).forEach((m) => {
  if (m.category !== currentCategory) {
    currentCategory = m.category;
    animIndex = 0; 
    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = currentCategory;
    container.appendChild(title);
  }

  const card = document.createElement('article');
  card.className = 'method';
  card.style.setProperty('--i', animIndex++);
  card.style.setProperty('--accent', m.accent);
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const isBank = m.type === 'bank';

  let infoHTML = '';
  if (isBank) {
    infoHTML = `
      <div class="m-bank">
        <span class="m-value m-copyable" data-copy="${m.value}" title="Copiar cuenta">Cta: ${m.value}</span>
        ${m.cci ? `<span class="m-sub m-copyable" data-copy="${m.cci}" title="Copiar CCI">CCI: ${m.cci}</span>` : ''}
      </div>
    `;
  } else {
    infoHTML = `<span class="m-value m-copyable" data-copy="${m.value}" title="Copiar número">${m.value}</span>`;
  }
  
  infoHTML += `<span class="m-holder">a nombre de <strong>${m.holder}</strong></span>`;

  let rightBtn = '';
  if (m.qr) {
    rightBtn = `<button class="qr-btn" aria-label="Mostrar QR">${ICON_QR}</button>`;
  } else if (isBank) {
    rightBtn = `<button class="eye-btn" aria-label="Copiar cuenta y CCI">${ICON_EYE}</button>`;
  }

  card.innerHTML = `
    <div class="glow"></div>
    <div class="m-icon">
      <img src="${m.icon}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div class="fallback" style="display:none;">${m.key.slice(0,2).toUpperCase()}</div>
    </div>
    <div class="m-info">
      <span class="m-label">${m.label}</span>
      ${infoHTML}
    </div>
    ${rightBtn}
  `;

  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  card.addEventListener('click', async (e) => {
    if (e.target.closest('.qr-btn')) {
      e.stopPropagation();
      openQR(m);
      return;
    }

    if (e.target.closest('.eye-btn')) {
      e.stopPropagation();
      const text = `${m.value}${m.cci ? ` — CCI: ${m.cci}` : ''}`;
      if (await copyToClipboard(text)) showToast('Cuenta y CCI copiados');
      return;
    }

    if (e.target.closest('.m-copyable')) {
      e.stopPropagation();
      const val = e.target.closest('.m-copyable').getAttribute('data-copy');
      if (val && await copyToClipboard(val)) showToast(`Copiado: ${val}`);
      return;
    }

    if (m.value) {
      if (await copyToClipboard(m.value)) showToast(`Copiado: ${m.value}`);
    }
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (m.value) copyToClipboard(m.value).then(ok => { if(ok) showToast(`Copiado: ${m.value}`); });
    }
  });

  container.appendChild(card);
});

/* ============================================================
   6. TEMA CLARO / OSCURO
   ============================================================ */
const toggle = document.querySelector('.theme-toggle');
let lightMode = false;

toggle.addEventListener('click', () => {
  lightMode = !lightMode;
  document.documentElement.style.setProperty('--bg-deep', lightMode ? '#f4efe4' : '#0a0906');
  document.documentElement.style.setProperty('--text-main', lightMode ? '#1a160e' : '#f7f1e3');
  document.documentElement.style.setProperty('--text-dim', lightMode ? 'rgba(26,22,14,0.6)' : 'rgba(247,241,227,0.55)');
  document.documentElement.style.setProperty('--text-faint', lightMode ? 'rgba(26,22,14,0.4)' : 'rgba(247,241,227,0.35)');
  document.documentElement.style.setProperty('--glass', lightMode ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.045)');
  document.documentElement.style.setProperty('--glass-border', lightMode ? 'rgba(143,106,26,0.22)' : 'rgba(249,226,156,0.14)');

  const frame = document.querySelector('.avatar-frame');
  const inner = document.querySelector('.avatar-inner');
  const name = document.querySelector('.profile-name');
  if (lightMode) {
    frame.style.boxShadow = '0 0 0 1px rgba(143,106,26,0.25), 0 12px 36px rgba(143,106,26,0.22), inset 0 0 24px rgba(0,0,0,0.08)';
    inner.style.background = 'radial-gradient(circle at 32% 28%, #fffaf0, #e8dcc0 78%)';
    name.style.background = 'linear-gradient(180deg, #1a160e 15%, #8f6a1a 85%)';
    name.style.webkitBackgroundClip = 'text';
    name.style.backgroundClip = 'text';
  } else {
    frame.style.boxShadow = '0 0 0 1px rgba(249,226,156,0.18), 0 12px 42px rgba(201,150,47,0.28), inset 0 0 24px rgba(0,0,0,0.4)';
    inner.style.background = 'radial-gradient(circle at 32% 28%, #2a2418, #0e0c08 78%)';
    name.style.background = 'linear-gradient(180deg, #fffaf0 15%, var(--gold-2) 85%)';
    name.style.webkitBackgroundClip = 'text';
    name.style.backgroundClip = 'text';
  }
});
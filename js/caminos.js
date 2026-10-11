/* ============================================================
   CAMINOS DEL INCA · Lógica de la web
   ============================================================ */

const CSV_PILOTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCm2vvFXiiWpZbnksadKb0hkwY0Paqjg65-hqhAOPa8V-E1gCWrsD0J1eG0jzOnY0dn9Ou0p8LhhYd/pub?gid=0&single=true&output=csv";

let pilotos = [];

/* ============================================================
   GANADORES — Histórico completo 1966-2025
   ============================================================ */
const ganadores = [
  { anio: 1966, piloto: "Henry Bradley", copiloto: "César Vidaurre", auto: "Volvo Amazon", marca: "Volvo", nota: "1.º campeón de la historia" },
  { anio: 1967, piloto: "Arnaldo Alvarado", copiloto: "Enrique Alvarado C.", auto: "Ford Mustang", marca: "Ford", nota: "—" },
  { anio: 1968, piloto: "Henry Bradley", copiloto: "César Vidaurre", auto: "Mercedes-Benz", marca: "Mercedes-Benz", nota: "2.° título de Bradley" },
  { anio: 1969, piloto: "Tony Fall", copiloto: "Gunnar Palm", auto: "Ford Escort", marca: "Ford", nota: "1.º ganador extranjero" },
  { anio: 1970, piloto: "Henry Bradley", copiloto: "César Vidaurre", auto: "Ford Escort", marca: "Ford", nota: "3.° título de Bradley" },
  { anio: 1971, piloto: "Teodoro Yangali", copiloto: "Elías Yangali", auto: "Shelby GT 350 H", marca: "Shelby", nota: 'El "Zorro de Huancavelica"' },
  { anio: 1972, piloto: "Teodoro Yangali", copiloto: "Elías Yangali", auto: "Shelby GT 350 H", marca: "Shelby", nota: "Bicampeón consecutivo" },
  { anio: 1973, piloto: "Bratzo Vicich", copiloto: "Luis del Solar", auto: "Shelby GT 350 R", marca: "Shelby", nota: "—" },
  { anio: 1976, piloto: "Henry Bradley", copiloto: "César Vidaurre", auto: "Toyota Corona", marca: "Toyota", nota: "4.° título de Bradley" },
  { anio: 1977, piloto: "Dieter Hubner", copiloto: "Alfredo Méndez", auto: "Ford Escort", marca: "Ford", nota: "—" },
  { anio: 1978, piloto: "Herbert Grimm", copiloto: "Tater Ledgard", auto: "Datsun 160J", marca: "Datsun", nota: "—" },
  { anio: 1979, piloto: "Henry Bradley", copiloto: "César Vidaurre", auto: "Toyota Corona", marca: "Toyota", nota: "5.° título de Bradley" },
  { anio: 1980, piloto: "Henry Bradley", copiloto: "Eduardo Capamadjian", auto: "Toyota Corona", marca: "Toyota", nota: "6.° título de Bradley" },
  { anio: 1981, piloto: "Julio César de las Casas", copiloto: "Francesco Galletti", auto: "Ford Escort", marca: "Ford", nota: "—" },
  { anio: 1985, piloto: "Jorge Koechlin", copiloto: "Miguel Tudela", auto: "Nissan Silvia", marca: "Nissan", nota: "—" },
  { anio: 1986, piloto: "Ricardo Dasso", copiloto: "Carlos Rey", auto: "Toyota Celica", marca: "Toyota", nota: "—" },
  { anio: 1987, piloto: "Pedro Roca", copiloto: "Santiago Echecopar", auto: "Toyota Corona", marca: "Toyota", nota: "—" },
  { anio: 1988, piloto: "Henry Bradley", copiloto: "Miguel Baca", auto: "Toyota Celica", marca: "Toyota", nota: "7.° título · Récord absoluto" },
  { anio: 1989, piloto: "José Camacho", copiloto: "Juan Calizaya", auto: "Toyota Corolla", marca: "Toyota", nota: "—" },
  { anio: 1990, piloto: "Luis Alayza", copiloto: "Enrique Zúñiga", auto: "Nissan Silvia", marca: "Nissan", nota: "Ajustado copiloto" },
  { anio: 1991, piloto: "Ricardo Flores", copiloto: "Ricardo Alayza", auto: "Toyota Celica", marca: "Toyota", nota: "—" },
  { anio: 1992, piloto: "Raúl Orlandini Dibós", copiloto: "Oscar Dávila", auto: "Nissan Silvia", marca: "Nissan", nota: "—" },
  { anio: 1993, piloto: "Raúl Orlandini Dibós", copiloto: "Oscar Dávila", auto: "Nissan Silvia", marca: "Nissan", nota: "Bicampeón" },
  { anio: 1994, piloto: "Raúl Orlandini Dibós", copiloto: "Oscar Dávila", auto: "Nissan Silvia", marca: "Nissan", nota: "Tricampeón consecutivo" },
  { anio: 1995, piloto: "Luis Alayza", copiloto: "Ive Bromberg", auto: "Nissan Silvia", marca: "Nissan", nota: "2.° título de Alayza" },
  { anio: 1996, piloto: "Oscar Dufour", copiloto: "Ricardo Tovar", auto: "Suzuki Vitara", marca: "Suzuki", nota: "—" },
  { anio: 1997, piloto: "Ramón Ferreyros", copiloto: "Gonzalo Sáenz", auto: "Peugeot 306", marca: "Peugeot", nota: "—" },
  { anio: 1998, piloto: "Ernesto Jochamowitz", copiloto: "Luis Miguel Soto", auto: "Ford Escort Gr. A", marca: "Ford", nota: "—" },
  { anio: 1999, piloto: "Ernesto Jochamowitz", copiloto: "Luis Miguel Soto", auto: "Ford Escort WRC", marca: "Ford", nota: "Bicampeón consecutivo" },
  { anio: 2000, piloto: "Eduardo Dibós Silva", copiloto: "Gustavo Medina", auto: "Toyota Celica", marca: "Toyota", nota: "—" },
  { anio: 2001, piloto: "Eduardo Dibós Silva", copiloto: "Gustavo Medina", auto: "Toyota Celica", marca: "Toyota", nota: "Bicampeón" },
  { anio: 2002, piloto: "Eduardo Dibós Silva", copiloto: "Ive Bromberg", auto: "Toyota Celica", marca: "Toyota", nota: "Tricampeón consecutivo" },
  { anio: 2003, piloto: "Raúl Orlandini Dibós", copiloto: "Juan Pedro Cilloniz", auto: "Mitsubishi Lancer", marca: "Mitsubishi", nota: "4.° título de Orlandini Dibós" },
  { anio: 2004, piloto: "Luis Alayza", copiloto: "Reinaldo Delgado", auto: "Subaru Forester", marca: "Subaru", nota: "3.° título · Ajustado copiloto" },
  { anio: 2005, piloto: "Raúl Orlandini Dibós", copiloto: "Ive Bromberg", auto: "Mitsubishi Lancer", marca: "Mitsubishi", nota: "5.° título de Orlandini Dibós" },
  { anio: 2006, piloto: "César Cataño", copiloto: "José Luis Tommasini", auto: "Mitsubishi Lancer", marca: "Mitsubishi", nota: "—" },
  { anio: 2007, piloto: "Ernesto Jochamowitz", copiloto: "Gustavo Medina", auto: "Mitsubishi Outlander", marca: "Mitsubishi", nota: '3.° título de "Neto"' },
  { anio: 2008, piloto: "Roberto Pardo", copiloto: "Giampier Giachetti", auto: "Subaru Impreza", marca: "Subaru", nota: "—" },
  { anio: 2009, piloto: "Nicolás Fuchs", copiloto: "Juan Pedro Cilloniz", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "—" },
  { anio: 2010, piloto: "Raúl Orlandini Griswold", copiloto: "Diego Zuloaga", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: '1.° título del "Mono"' },
  { anio: 2011, piloto: "Raúl Orlandini Griswold", copiloto: "Juan Pedro Cilloniz", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "Bicampeón consecutivo" },
  { anio: 2012, piloto: "Nicolás Fuchs", copiloto: "Ive Bromberg", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "2.° título de Fuchs" },
  { anio: 2013, piloto: "Richard Palomino", copiloto: "José María Rodríguez", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "—" },
  { anio: 2014, piloto: "José Luis Tommasini", copiloto: "Juan Pedro Cilloniz", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "—" },
  { anio: 2015, piloto: "José Luis Tommasini", copiloto: "Juan Pedro Cilloniz", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "Bicampeón consecutivo" },
  { anio: 2016, piloto: "John Navarro Guizado", copiloto: "Raúl Orlandini Griswold", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "Orlandini navega y gana" },
  { anio: 2017, piloto: "Raúl Orlandini Griswold", copiloto: "John Navarro Guizado", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "3.° título como piloto" },
  { anio: 2018, piloto: "Richard Palomino", copiloto: "Augusto Larrea", auto: "Mitsubishi Lancer Evo IX", marca: "Mitsubishi", nota: "Cierre de era Mitsubishi" },
  { anio: 2019, piloto: "Luis Alayza", copiloto: "Carlos Ganoza", auto: "Toyota GT86", marca: "Toyota", nota: "Tracción simple gana la general" },
  { anio: 2022, piloto: "Ronmel Palomino", copiloto: "Guillermo Sierra Ovalle", auto: "Toyota Yaris N5", marca: "Toyota", nota: "Edición 50" },
  { anio: 2023, piloto: "Nicolás Fuchs", copiloto: "Fernando Mussano", auto: "Ford Fiesta Rally3", marca: "Ford", nota: "3.° título de Fuchs" },
  { anio: 2024, piloto: "Eduardo Castro Yangali", copiloto: "Diego Vallejo", auto: "Ford Fiesta Rally3", marca: "Ford", nota: "Retorno del linaje Yangali" },
  { anio: 2025, piloto: "André Martínez", copiloto: "Matías Aranguren", auto: "Ford Fiesta Rally3", marca: "Ford", nota: "Consagración en Rally3" }
];

/* ============================================================
   HERO: PARTÍCULAS
   ============================================================ */
function crearParticulas(cantidad = 40) {
  const cont = document.getElementById('particles');
  if (!cont) return;
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = 0.3 + Math.random() * 0.7;
    const size = 1 + Math.random() * 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    cont.appendChild(p);
  }
}

/* ============================================================
   HERO: PARALLAX MONTAÑAS
   ============================================================ */
function initParallax() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    const l1 = document.querySelector('.layer-1');
    const l2 = document.querySelector('.layer-2');
    const l3 = document.querySelector('.layer-3');
    if (l1) l1.style.transform = `translateY(${y * 0.15}px)`;
    if (l2) l2.style.transform = `translateY(${y * 0.25}px)`;
    if (l3) l3.style.transform = `translateY(${y * 0.35}px)`;
  });
}

/* ============================================================
   HERO: SPOTLIGHT ROTATIVO
   ============================================================ */
function initSpotlight() {
  const spotlights = [
    { nro: "★",   nombre: "Henry Bradley",            meta: "7 Títulos · 1966–1988 · Leyenda" },
    { nro: "44",  nombre: "Eduardo Castro Yangali",   meta: "Campeón 2024 · Ford Fiesta Rally 3" },
    { nro: "742", nombre: "Nicolás Fuchs",            meta: "3 Títulos · Toyota Gr Yaris · TIN" },
    { nro: "716", nombre: "Raúl Orlandini",           meta: "5 Títulos · Mitsubishi Evo X · TIN" },
    { nro: "712", nombre: "Luis Alayza",              meta: "3 Títulos · Toyota Gr Yaris · TIN" },
    { nro: "47",  nombre: "André Martínez",           meta: "Campeón 2025 · Ford Fiesta Rally 3" },
    { nro: "718", nombre: "Richard Palomino",         meta: "2 Títulos · Skoda Fabia · TIN" },
    { nro: "78",  nombre: "José Luis Tommasini",      meta: "2 Títulos · Mitsubishi Evo IX" }
  ];

  let idx = 0;
  const nroEl  = document.querySelector('.spotlight-nro');
  const nameEl = document.querySelector('.spotlight-name');
  const metaEl = document.querySelector('.spotlight-meta');
  if (!nroEl) return;

  setInterval(() => {
    idx = (idx + 1) % spotlights.length;
    const s = spotlights[idx];
    nroEl.style.opacity = 0;
    nameEl.style.opacity = 0;
    metaEl.style.opacity = 0;
    setTimeout(() => {
      nroEl.textContent  = s.nro;
      nameEl.textContent = s.nombre;
      metaEl.textContent = s.meta;
      nroEl.style.opacity = 1;
      nameEl.style.opacity = 1;
      metaEl.style.opacity = 1;
    }, 300);
  }, 4000);
}

/* ============================================================
   PANELES (abrir/cerrar)
   ============================================================ */
function abrirPanel(nombre) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + nombre);
  if (panel) {
    panel.classList.add('active');
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}

function initPaneles() {
  document.querySelectorAll('.badge[data-panel]').forEach(b => {
    b.addEventListener('click', () => abrirPanel(b.dataset.panel));
  });
  document.querySelectorAll('.panel-close').forEach(b => {
    b.addEventListener('click', () => {
      const panel = document.getElementById('panel-' + b.dataset.close);
      if (panel) panel.classList.remove('active');
      document.getElementById('badges')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      abrirPanel(a.dataset.scroll);
    });
  });
}

/* ============================================================
   CSV PARSER
   ============================================================ */
function parseCSV(texto) {
  const lineas = texto.trim().split(/\r?\n/);
  const encabezados = lineas[0].split(',').map(h => h.trim());
  const filas = [];

  for (let i = 1; i < lineas.length; i++) {
    const valores = [];
    let actual = '';
    let dentroComillas = false;
    for (let c of lineas[i]) {
      if (c === '"') dentroComillas = !dentroComillas;
      else if (c === ',' && !dentroComillas) { valores.push(actual); actual = ''; }
      else actual += c;
    }
    valores.push(actual);
    const obj = {};
    encabezados.forEach((h, idx) => obj[h] = (valores[idx] || '').trim());
    filas.push(obj);
  }
  return filas;
}

/* ============================================================
   CARGAR PILOTOS
   ============================================================ */
async function cargarPilotos() {
  const tbody = document.getElementById('tablaBody');
  const estado = document.getElementById('estadoCarga');
  try {
    const res = await fetch(CSV_PILOTOS);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const texto = await res.text();
    const datos = parseCSV(texto);

    pilotos = datos.map((d, i) => ({
      orden: parseInt(d['Orden']) || i + 1,
      nro: d['Nro'] || '',
      piloto: d['Piloto'] || '',
      copiloto: d['Copiloto'] || '',
      vehiculo: d['Vehículo'] || d['Vehiculo'] || '',
      localidad: d['Localidad'] || '',
      clase: d['Clase'] || ''
    })).filter(p => p.piloto);

    if (estado) {
      estado.textContent = '✓ Datos en vivo del Sheet';
      estado.style.color = '#00ff88';
    }

    poblarSelects();
    aplicarFiltros();
  } catch (err) {
    console.error(err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="sin-resultados">⚠️ Error al cargar datos. Verifica el Sheet.</td></tr>`;
    }
    if (estado) {
      estado.textContent = '✕ Error de conexión';
      estado.style.color = '#ff4500';
    }
  }
}

/* ============================================================
   POBLAR SELECTS PILOTOS
   ============================================================ */
function poblarSelects() {
  const selClase = document.getElementById('filtroClase');
  const selLoc = document.getElementById('filtroLocalidad');
  const selNro = document.getElementById('filtroNro');
  if (!selClase || !selLoc) return;

  const clases = [...new Set(pilotos.map(p => p.clase).filter(Boolean))].sort();
  const locs = [...new Set(pilotos.map(p => p.localidad).filter(Boolean))].sort();
  const nros = [...new Set(pilotos.map(p => p.nro).filter(Boolean))]
                 .sort((a, b) => parseInt(a) - parseInt(b));

  clases.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    selClase.appendChild(opt);
  });
  locs.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l;
    selLoc.appendChild(opt);
  });

  if (selNro) {
    nros.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = 'N° ' + n;
      selNro.appendChild(opt);
    });
  }
}

/* ============================================================
   RENDER TABLA PILOTOS
   ============================================================ */
function renderTabla(lista) {
  const tbody = document.getElementById('tablaBody');
  const contador = document.getElementById('contadorResultados');
  if (!tbody) return;
  if (contador) contador.textContent = lista.length;

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="sin-resultados">No se encontraron pilotos con esos filtros</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td><span class="nro-badge">${p.nro}</span></td>
      <td class="piloto-nombre">${p.piloto}</td>
      <td class="piloto-cop">${p.copiloto}</td>
      <td class="vehiculo-cell">${p.vehiculo}</td>
      <td class="localidad-cell">${p.localidad}</td>
      <td><span class="clase-badge">${p.clase}</span></td>
    </tr>
  `).join('');
}

/* ============================================================
   FILTROS PILOTOS
   ============================================================ */
function aplicarFiltros() {
  const busq = document.getElementById('busqueda')?.value.toLowerCase().trim() || '';
  const clase = document.getElementById('filtroClase')?.value || '';
  const loc = document.getElementById('filtroLocalidad')?.value || '';
  const nro = document.getElementById('filtroNro')?.value || '';
  const orden = document.getElementById('ordenar')?.value || 'orden';

  // 🔥 Detecta si lo escrito es solo números → búsqueda EXACTA por N° de auto
  const esSoloNumeros = /^\d+$/.test(busq);

  let resultado = pilotos.filter(p => {
    let okTexto;
    if (!busq) {
      okTexto = true;
    } else if (esSoloNumeros) {
      // Solo dígitos: comparación EXACTA por N° de auto (sin falsos positivos)
      okTexto = (p.nro === busq);
    } else {
      // Texto normal: búsqueda parcial en varios campos
      okTexto =
        p.piloto.toLowerCase().includes(busq) ||
        p.copiloto.toLowerCase().includes(busq) ||
        p.vehiculo.toLowerCase().includes(busq) ||
        p.localidad.toLowerCase().includes(busq) ||
        p.nro.toLowerCase().includes(busq);
    }

    const okClase = !clase || p.clase === clase;
    const okLoc = !loc || p.localidad === loc;
    const okNro = !nro || p.nro === nro;
    return okTexto && okClase && okLoc && okNro;
  });

  const ord = {
    orden: (a,b) => a.orden - b.orden,
    piloto: (a,b) => a.piloto.localeCompare(b.piloto),
    clase: (a,b) => a.clase.localeCompare(b.clase) || a.orden - b.orden,
    localidad: (a,b) => a.localidad.localeCompare(b.localidad) || a.orden - b.orden
  };
  resultado.sort(ord[orden]);
  renderTabla(resultado);
}

/* ============================================================
   POBLAR SELECTS GANADORES
   ============================================================ */
function poblarSelectsGanadores() {
  const selPiloto = document.getElementById('filtroPiloto');
  const selAuto = document.getElementById('filtroAuto');
  if (!selPiloto || !selAuto) return;

  const pilotosUnicos = [...new Set(ganadores.map(g => g.piloto))].sort();
  const marcasUnicas = [...new Set(ganadores.map(g => g.marca))].sort();

  pilotosUnicos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    selPiloto.appendChild(opt);
  });
  marcasUnicas.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    selAuto.appendChild(opt);
  });
}

/* ============================================================
   RENDER TABLA GANADORES
   ============================================================ */
function renderGanadores(lista = ganadores) {
  const tbody = document.getElementById('tablaGanadores');
  const contador = document.getElementById('contadorGanadores');
  if (!tbody) return;
  if (contador) contador.textContent = lista.length;

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="sin-resultados">No se encontraron ediciones con esos filtros</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(g => {
    const record = g.piloto === 'Henry Bradley';
    const triple = ['Eduardo Dibós Silva', 'Raúl Orlandini Dibós', 'Ernesto Jochamowitz', 'Raúl Orlandini Griswold'].includes(g.piloto)
                   && ['2002','1994','2007','2017'].includes(String(g.anio));
    const clase = record ? 'ganador-record' : (triple ? 'ganador-triple' : '');
    return `
      <tr class="${clase}">
        <td class="ganador-anio">${g.anio}</td>
        <td class="piloto-nombre">${g.piloto}</td>
        <td class="piloto-cop">${g.copiloto}</td>
        <td class="vehiculo-cell">${g.auto}</td>
        <td class="localidad-cell">${g.nota}</td>
      </tr>
    `;
  }).join('');
}

/* ============================================================
   FILTROS GANADORES
   ============================================================ */
function aplicarFiltrosGanadores() {
  const busq = document.getElementById('busquedaGanadores')?.value.toLowerCase().trim() || '';
  const piloto = document.getElementById('filtroPiloto')?.value || '';
  const marca = document.getElementById('filtroAuto')?.value || '';
  const decada = document.getElementById('filtroDecada')?.value || '';
  const orden = document.getElementById('ordenarGanadores')?.value || 'anio_desc';

  let resultado = ganadores.filter(g => {
    const okTexto = !busq ||
      g.piloto.toLowerCase().includes(busq) ||
      g.copiloto.toLowerCase().includes(busq) ||
      g.auto.toLowerCase().includes(busq) ||
      g.nota.toLowerCase().includes(busq);
    const okPiloto = !piloto || g.piloto === piloto;
    const okMarca = !marca || g.marca === marca;
    const okDecada = !decada || Math.floor(g.anio / 10) * 10 === parseInt(decada);
    return okTexto && okPiloto && okMarca && okDecada;
  });

  const ordenamientos = {
    anio_desc: (a,b) => b.anio - a.anio,
    anio_asc: (a,b) => a.anio - b.anio,
    piloto: (a,b) => a.piloto.localeCompare(b.piloto) || b.anio - a.anio,
    auto: (a,b) => a.auto.localeCompare(b.auto) || b.anio - a.anio
  };
  resultado.sort(ordenamientos[orden]);

  renderGanadores(resultado);
}

/* ============================================================
   CALCULAR STATS GANADORES
   ============================================================ */
function calcularStatsGanadores() {
  const total = ganadores.length;
  const statEd = document.getElementById('statEdiciones');
  if (statEd) statEd.textContent = total;

  const marcas = new Set(ganadores.map(g => g.marca));
  const statM = document.getElementById('statMarcas');
  if (statM) statM.textContent = marcas.size + '+';

  const mitsubishi = ganadores.filter(g => g.marca === 'Mitsubishi').length;
  const statMits = document.getElementById('statMitsubishi');
  if (statMits) statMits.textContent = mitsubishi;

  const conteo = {};
  ganadores.forEach(g => { conteo[g.piloto] = (conteo[g.piloto] || 0) + 1; });
  const maxTitulos = Math.max(...Object.values(conteo));
  const statR = document.getElementById('statRecord');
  if (statR) statR.textContent = maxTitulos;
}

/* ============================================================
   INIT GANADORES
   ============================================================ */
function initGanadores() {
  poblarSelectsGanadores();
  calcularStatsGanadores();
  renderGanadores();

  document.getElementById('busquedaGanadores')?.addEventListener('input', aplicarFiltrosGanadores);
  document.getElementById('filtroPiloto')?.addEventListener('change', aplicarFiltrosGanadores);
  document.getElementById('filtroAuto')?.addEventListener('change', aplicarFiltrosGanadores);
  document.getElementById('filtroDecada')?.addEventListener('change', aplicarFiltrosGanadores);
  document.getElementById('ordenarGanadores')?.addEventListener('change', aplicarFiltrosGanadores);
  document.getElementById('limpiarGanadores')?.addEventListener('click', () => {
    document.getElementById('busquedaGanadores').value = '';
    document.getElementById('filtroPiloto').value = '';
    document.getElementById('filtroAuto').value = '';
    document.getElementById('filtroDecada').value = '';
    document.getElementById('ordenarGanadores').value = 'anio_desc';
    aplicarFiltrosGanadores();
  });
}

/* ============================================================
   INIT PRINCIPAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  crearParticulas();
  initParallax();
  initSpotlight();
  initPaneles();
  initGanadores();

  document.getElementById('busqueda')?.addEventListener('input', aplicarFiltros);
  document.getElementById('filtroClase')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtroLocalidad')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtroNro')?.addEventListener('change', aplicarFiltros);
  document.getElementById('ordenar')?.addEventListener('change', aplicarFiltros);

  document.getElementById('limpiarFiltros')?.addEventListener('click', () => {
    document.getElementById('busqueda').value = '';
    document.getElementById('filtroClase').value = '';
    document.getElementById('filtroLocalidad').value = '';
    document.getElementById('filtroNro').value = '';
    document.getElementById('ordenar').value = 'orden';
    aplicarFiltros();
  });

  try { initCopiloto(); } catch (e) { console.warn('initCopiloto:', e); }
  cargarPilotos();
});


/* ============================================================
   WIDGET COPILOTO - Chat flotante
   ============================================================ */

const COPILOTO_API_URL = "https://script.google.com/macros/s/AKfycbylmK9qJPUSWE1ArEQ8BOsrIHLq1aUFHAXbzJc6tPnz8cFu6Tcxglg1AdE6m8F3RUtu1g/exec";

function initCopiloto() {
  const bubble = document.getElementById('copilotoBubble');
  const panel = document.getElementById('copilotoPanel');
  const closeBtn = document.getElementById('copilotoClose');
  const input = document.getElementById('copilotoInput');
  const sendBtn = document.getElementById('copilotoSend');
  const messages = document.getElementById('copilotoMessages');

  if (!bubble || !panel) return;

  let enviando = false;

  // ---- Abrir / cerrar panel ----
  bubble.addEventListener('click', () => {
    panel.classList.toggle('visible');
    if (panel.classList.contains('visible')) {
      setTimeout(() => input.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('visible');
  });

  // ---- Chips de sugerencias ----
  document.querySelectorAll('.copiloto-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) enviarMensaje(prompt);
    });
  });

  // ---- Enviar con Enter o botón ----
  sendBtn.addEventListener('click', () => enviarMensaje(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(input.value);
    }
  });

  // ---- Función principal ----
  async function enviarMensaje(texto) {
    const limpio = String(texto || '').trim();
    if (!limpio || enviando) return;

    enviando = true;
    sendBtn.disabled = true;
    input.value = '';

    // Ocultar chips después del primer mensaje
    const chips = messages.querySelector('.copiloto-chips');
    if (chips) chips.style.display = 'none';

    // Mostrar mensaje del usuario
    agregarMensaje(limpio, 'user');

    // Mostrar indicador "escribiendo..."
    const typing = document.createElement('div');
    typing.className = 'copiloto-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(COPILOTO_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ mensaje: limpio })
      });

      const data = await res.json();
      typing.remove();

      if (data.ok && data.texto) {
        agregarMensaje(data.texto, 'bot');
      } else {
        agregarMensaje('Ups, el Copiloto no pudo responder: ' + (data.error || 'error desconocido'), 'bot');
      }
    } catch (err) {
      console.error('Error Copiloto:', err);
      typing.remove();
      agregarMensaje('Error de conexión con el Copiloto. Intenta de nuevo.', 'bot');
    } finally {
      enviando = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ---- Agregar mensaje al chat ----
  function agregarMensaje(texto, tipo) {
    const div = document.createElement('div');
    div.className = 'copiloto-msg ' + (tipo === 'user' ? 'copiloto-msg-user' : 'copiloto-msg-bot');
    div.textContent = texto;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
}
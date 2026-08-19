document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const btnPrint = document.getElementById('btnPrint');
    const summaryContent = document.getElementById('summaryContent');
    const ticketPlaceholder = document.getElementById('ticket-placeholder');
    const ticketContent = document.getElementById('ticket-content');

    // Inicializar Conteo Regresivo de Licencia (366 Días)
    initLicenseCountdown();

    // Manejadores Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Lógica para Licencia con Conteo Regresivo
    function initLicenseCountdown() {
        const TOTAL_DAYS = 366;
        const now = new Date();
        
        let activationDate = localStorage.getItem('license_activation_date');
        if (!activationDate) {
            activationDate = now.toISOString();
            localStorage.setItem('license_activation_date', activationDate);
        }

        const startDate = new Date(activationDate);
        const elapsedMs = now - startDate;
        const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, TOTAL_DAYS - elapsedDays);

        const countdownElem = document.getElementById('licenseCountdown');
        if (countdownElem) {
            countdownElem.textContent = `Quedan ${remainingDays} días de uso`;
        }
    }

    // Leer archivo XML o ZIP
    async function handleFile(file) {
        try {
            let xmlText = '';
            if (file.name.toLowerCase().endsWith('.zip')) {
                const zip = new JSZip();
                const zipContent = await zip.loadAsync(file);
                const xmlFileName = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.xml'));
                if (!xmlFileName) throw new Error('No se encontró un archivo XML dentro del ZIP.');
                xmlText = await zipContent.files[xmlFileName].async('string');
            } else if (file.name.toLowerCase().endsWith('.xml')) {
                xmlText = await file.text();
            } else {
                alert('Sube un archivo XML o ZIP válido.');
                return;
            }

            parseAndRenderXML(xmlText);
        } catch (error) {
            console.error('Error al procesar comprobante:', error);
            alert('Error al leer el archivo: ' + error.message);
        }
    }

    function parseAndRenderXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const getTagText = (tagName, parent = xmlDoc) => {
            const elems = parent.getElementsByTagNameNS('*', tagName);
            return elems.length > 0 ? elems[0].textContent.trim() : '';
        };

        // --- 1. EMISOR ---
        const supplierParty = xmlDoc.getElementsByTagNameNS('*', 'AccountingSupplierParty')[0];
        let emisorRuc = '-';
        let emisorNombre = '-';
        let emisorDireccion = '-';
        let emisorUbigeo = '-';

        if (supplierParty) {
            emisorRuc = getTagText('CustomerAssignedAccountID', supplierParty) || 
                        getTagText('CompanyID', supplierParty) || 
                        getTagText('ID', supplierParty) || '-';

            const partyName = supplierParty.getElementsByTagNameNS('*', 'PartyName')[0];
            const legalEntity = supplierParty.getElementsByTagNameNS('*', 'PartyLegalEntity')[0];

            if (partyName && getTagText('Name', partyName)) {
                emisorNombre = getTagText('Name', partyName);
            } else if (legalEntity && getTagText('RegistrationName', legalEntity)) {
                emisorNombre = getTagText('RegistrationName', legalEntity);
            } else {
                emisorNombre = getTagText('RegistrationName', supplierParty) || getTagText('Name', supplierParty) || 'EMPRESA EMISORA';
            }

            emisorDireccion = getTagText('Line', supplierParty) || '-';
            emisorUbigeo = getTagText('CountrySubentity', supplierParty) || '-';
        }

        // --- 2. COMPROBANTE Y HORA ---
        const idComprobante = getTagText('ID');
        const fechaRaw = getTagText('IssueDate');
        let horaRaw = getTagText('IssueTime');

        let fechaEmision = fechaRaw;
        if (horaRaw) {
            const horaLimpia = horaRaw.replace('Z', '').split('.')[0];
            const partesHora = horaLimpia.split(':');
            if (partesHora.length >= 2) {
                fechaEmision += ` ${partesHora[0]}:${partesHora[1]}`;
            }
        }

        const moneda = getTagText('DocumentCurrencyCode') || 'PEN';
        const simboloMoneda = moneda === 'USD' ? '$' : 'S/';

        // --- 3. CLIENTE ---
        const customerParty = xmlDoc.getElementsByTagNameNS('*', 'AccountingCustomerParty')[0];
        let clienteNombre = '-';
        let clienteDoc = '-';
        let tipoDocCode = '';

        if (customerParty) {
            clienteDoc = getTagText('CustomerAssignedAccountID', customerParty) || 
                         getTagText('ID', customerParty) || '-';

            const schemeElem = customerParty.getElementsByTagNameNS('*', 'ID')[0];
            if (schemeElem) {
                tipoDocCode = schemeElem.getAttribute('schemeID') || '';
            }

            const customerLegal = customerParty.getElementsByTagNameNS('*', 'PartyLegalEntity')[0];
            const customerNameNode = customerParty.getElementsByTagNameNS('*', 'PartyName')[0];

            if (customerLegal && getTagText('RegistrationName', customerLegal)) {
                clienteNombre = getTagText('RegistrationName', customerLegal);
            } else if (customerNameNode && getTagText('Name', customerNameNode)) {
                clienteNombre = getTagText('Name', customerNameNode);
            } else {
                clienteNombre = getTagText('RegistrationName', customerParty) || getTagText('Name', customerParty) || '-';
            }
        }

        const labelDocElem = document.getElementById('t_label_doc');
        if (tipoDocCode === '6' || clienteDoc.length === 11) {
            labelDocElem.textContent = 'RUC';
        } else if (tipoDocCode === '1' || clienteDoc.length === 8) {
            labelDocElem.textContent = 'DNI';
        } else {
            labelDocElem.textContent = (clienteDoc.length === 11) ? 'RUC' : 'DNI';
        }

        // --- 4. TOTALES ---
        const opGravada = getTagText('TaxableAmount') || getTagText('PayableAmount') || '0.00';
        const igv = getTagText('TaxAmount') || '0.00';
        const totalNum = parseFloat(getTagText('PayableAmount') || 0);
        const totalStr = totalNum.toFixed(2);

        // --- 5. RENDERIZAR VISTA TICKET ---
        document.getElementById('t_emisor_nombre').textContent = emisorNombre;
        document.getElementById('t_emisor_ruc').textContent = emisorRuc;
        document.getElementById('t_emisor_direccion').textContent = emisorDireccion;
        document.getElementById('t_emisor_ubigeo').textContent = emisorUbigeo;
        document.getElementById('t_serie_numero').textContent = idComprobante;
        document.getElementById('t_fecha').textContent = fechaEmision;
        document.getElementById('t_cliente_nom').textContent = clienteNombre;
        document.getElementById('t_cliente_doc').textContent = clienteDoc;
        document.getElementById('t_moneda').textContent = moneda === 'USD' ? 'DÓLARES' : 'SOLES (S/)';

        document.getElementById('t_moneda_simbolo').textContent = simboloMoneda;
        document.getElementById('t_op_gravada').textContent = parseFloat(opGravada || 0).toFixed(2);
        document.getElementById('t_igv').textContent = parseFloat(igv || 0).toFixed(2);
        document.getElementById('t_total').textContent = totalStr;

        const textoMoneda = moneda === 'USD' ? 'DÓLARES' : 'SOLES';
        document.getElementById('t_monto_letras').textContent = `SON: ${numeroALetras(totalNum, textoMoneda)}`;

        // --- 6. TABLA DE PRODUCTOS ---
        const itemsBody = document.getElementById('t_items_body');
        itemsBody.innerHTML = '';

        const lines = xmlDoc.getElementsByTagNameNS('*', 'InvoiceLine').length > 0 
            ? xmlDoc.getElementsByTagNameNS('*', 'InvoiceLine') 
            : xmlDoc.getElementsByTagNameNS('*', 'CreditNoteLine');

        Array.from(lines).forEach(line => {
            const desc = getTagText('Description', line) || 'PRODUCTO';
            const cant = parseFloat(getTagText('InvoicedQuantity', line) || getTagText('CreditedQuantity', line) || 1).toFixed(0);
            const pu = parseFloat(getTagText('PriceAmount', line) || 0).toFixed(2);
            const lineTotal = parseFloat(getTagText('LineExtensionAmount', line) || 0).toFixed(2);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="item-desc-cell">${desc}</td>
                <td class="item-cant-cell">${cant} X ${pu}</td>
                <td class="item-total-cell">${lineTotal}</td>
            `;
            itemsBody.appendChild(tr);
        });

        // --- 7. CÓDIGO QR ---
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = '';
        const qrText = `${emisorRuc}|01|${idComprobante}|${igv}|${totalStr}|${fechaRaw}|${tipoDocCode}|${clienteDoc}|`;
        new QRCode(qrContainer, {
            text: qrText,
            width: 90,
            height: 90,
            correctLevel: QRCode.CorrectLevel.M
        });

        // --- 8. RESUMEN PANEL LATERAL ---
        summaryContent.innerHTML = `
            <p><strong>Comprobante:</strong> ${idComprobante}</p>
            <p><strong>Empresa:</strong> ${emisorNombre}</p>
            <p><strong>RUC Emisor:</strong> ${emisorRuc}</p>
            <p><strong>Monto Total:</strong> ${simboloMoneda} ${totalStr}</p>
            <p style="color: #10b981; font-weight: bold; margin-top: 5px;">Cargado Éxitosamente</p>
        `;

        ticketPlaceholder.style.display = 'none';
        ticketContent.style.display = 'block';
        btnPrint.disabled = false;
    }

    function numeroALetras(num, nombreMoneda = 'SOLES') {
        const enteros = Math.floor(num);
        const centavos = Math.round((num - enteros) * 100);
        const strCentavos = centavos < 10 ? '0' + centavos : centavos;

        if (enteros === 0) return `CERO Y ${strCentavos}/100 ${nombreMoneda}`;

        function Unidades(n) {
            switch(n) {
                case 1: return 'UN';
                case 2: return 'DOS';
                case 3: return 'TRES';
                case 4: return 'CUATRO';
                case 5: return 'CINCO';
                case 6: return 'SEIS';
                case 7: return 'SIETE';
                case 8: return 'OCHO';
                case 9: return 'NUEVE';
            }
            return '';
        }

        function Decenas(n) {
            const decena = Math.floor(n / 10);
            const unidad = n - (decena * 10);
            switch(decena) {
                case 1:
                    switch(unidad) {
                        case 0: return 'DIEZ';
                        case 1: return 'ONCE';
                        case 2: return 'DOCE';
                        case 3: return 'TRECE';
                        case 4: return 'CATORCE';
                        case 5: return 'QUINCE';
                        default: return 'DIECI' + Unidades(unidad);
                    }
                case 2:
                    if (unidad === 0) return 'VEINTE';
                    return 'VEINTI' + Unidades(unidad);
                case 3: return DecenasY('TREINTA', unidad);
                case 4: return DecenasY('CUARENTA', unidad);
                case 5: return DecenasY('CINCUENTA', unidad);
                case 6: return DecenasY('SESENTA', unidad);
                case 7: return DecenasY('SETENTA', unidad);
                case 8: return DecenasY('OCHENTA', unidad);
                case 9: return DecenasY('NOVENTA', unidad);
                case 0: return Unidades(unidad);
            }
        }

        function DecenasY(strSin, unidad) {
            if (unidad > 0) return strSin + ' Y ' + Unidades(unidad);
            return strSin;
        }

        function Centenas(n) {
            const centenas = Math.floor(n / 100);
            const decenas = n - (centenas * 100);
            switch(centenas) {
                case 1:
                    if (decenas > 0) return 'CIENTO ' + Decenas(decenas);
                    return 'CIEN';
                case 2: return 'DOSCIENTOS ' + Decenas(decenas);
                case 3: return 'TRESCIENTOS ' + Decenas(decenas);
                case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
                case 5: return 'QUINIENTOS ' + Decenas(decenas);
                case 6: return 'SEISCIENTOS ' + Decenas(decenas);
                case 7: return 'SETECIENTOS ' + Decenas(decenas);
                case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
                case 9: return 'NOVECIENTOS ' + Decenas(decenas);
            }
            return Decenas(decenas);
        }

        function Secciones(num, divisor, strSingular, strPlural) {
            const cientos = Math.floor(num / divisor);
            const resto = num - (cientos * divisor);
            let letras = '';
            if (cientos > 0) {
                if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural;
                else letras = strSingular;
            }
            if (resto > 0) letras += ' ';
            return { letras: letras, resto: resto };
        }

        let letras = '';
        let data = Secciones(enteros, 1000000, 'UN MILLON', 'MILLONES');
        if (data.letras !== '') letras += data.letras;

        data = Secciones(data.resto, 1000, 'UN MIL', 'MIL');
        if (data.letras !== '') letras += data.letras;

        if (data.resto > 0 || letras === '') letras += Centenas(data.resto);

        return `${letras.trim()} Y ${strCentavos}/100 ${nombreMoneda}`;
    }
});
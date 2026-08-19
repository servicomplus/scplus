// Quitar generación automática de QR inicial para mantener la pantalla limpia
window.addEventListener('DOMContentLoaded', () => {
    // Listo para recibir archivo
});

// Drag and Drop
const dropZone = document.getElementById('dropZone');

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) processFile(files[0]);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

// Lógica de procesamiento
async function processFile(file) {
    if (file.name.toLowerCase().endsWith('.zip')) {
        try {
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            const xmlFileName = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.xml'));

            if (xmlFileName) {
                const xmlText = await zipContent.files[xmlFileName].async('string');
                parseSUNATXML(xmlText);
            } else {
                alert('No se encontró ningún archivo .XML dentro del archivo .ZIP');
            }
        } catch (error) {
            alert('Error al leer el archivo ZIP: ' + error.message);
        }
    } else if (file.name.toLowerCase().endsWith('.xml')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            parseSUNATXML(e.target.result);
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecciona un archivo válido con extensión .XML o .ZIP');
    }
}
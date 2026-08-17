// ============================================================ //
// MAIN.JS - FUNCIONALIDADES GLOBALES                          //
// ============================================================ //

// ===== AÑO DINÁMICO =====
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ===== MODO OSCURO =====
const darkToggle = document.getElementById('darkToggle');
if (darkToggle) {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkToggle.classList.add('active');
    }

    darkToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        setTimeout(handleHeaderScroll, 100);
    });
}

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('mainHeader');

function handleHeaderScroll() {
    if (!header) return;
    const scrollY = window.scrollY;
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (scrollY > 50) {
        if (isDarkMode) {
            header.style.background = 'rgba(13, 17, 23, 0.95)';
            header.style.borderBottomColor = '#30363d';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.borderBottomColor = '#e8eaed';
        }
        header.style.backdropFilter = 'blur(12px)';
        header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
    } else {
        if (isDarkMode) {
            header.style.background = 'rgba(13, 17, 23, 0.2)';
            header.style.borderBottomColor = 'rgba(48, 54, 61, 0.2)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.2)';
            header.style.borderBottomColor = 'rgba(232, 234, 237, 0.2)';
        }
        header.style.backdropFilter = 'blur(8px)';
        header.style.boxShadow = 'none';
    }
}

let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            handleHeaderScroll();
            ticking = false;
        });
        ticking = true;
    }
});

// Estado inicial
if (header) {
    handleHeaderScroll();
}

// ===== MENÚ MÓVIL =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        }
    });

    // Cerrar menú al hacer clic en un enlace
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        });
    });
}

// ===== MANEJO DEL FORMULARIO (si existe) =====
const form = document.getElementById('quote-form');
const submitBtn = document.getElementById('submit-btn');

if (form && submitBtn) {
    const originalContent = submitBtn.innerHTML;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Enviando solicitud...</span>
        `;

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                submitBtn.classList.remove('bg-navy', 'hover:bg-navy-light');
                submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                submitBtn.innerHTML = `
                    <i class="fa-regular fa-circle-check"></i>
                    <span>¡Solicitud enviada correctamente!</span>
                `;
                form.reset();

                setTimeout(() => {
                    submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    submitBtn.classList.add('bg-navy', 'hover:bg-navy-light');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }, 5000);

            } else {
                throw new Error('Error al enviar el formulario');
            }

        } catch (error) {
            submitBtn.classList.remove('bg-navy', 'hover:bg-navy-light');
            submitBtn.classList.add('bg-red-custom', 'hover:bg-red-700');
            submitBtn.innerHTML = `
                <i class="fa-regular fa-circle-xmark"></i>
                <span>Error al enviar. Intenta de nuevo.</span>
            `;

            setTimeout(() => {
                submitBtn.classList.remove('bg-red-custom', 'hover:bg-red-700');
                submitBtn.classList.add('bg-navy', 'hover:bg-navy-light');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
            }, 4000);
        }
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== CARGAR COMPONENTES (Header, Footer, WhatsApp) =====
// Esta función carga los componentes HTML desde los archivos
async function loadComponent(selector, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Error loading ${file}`);
        const html = await response.text();
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component ${file}:`, error);
    }
}

// Cargar componentes al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar Header, Footer y WhatsApp desde components/
    loadComponent('#header-placeholder', 'components/header.html');
    loadComponent('#footer-placeholder', 'components/footer.html');
    loadComponent('#whatsapp-placeholder', 'components/whatsapp-float.html');
});
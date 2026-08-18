// ============================================================ //
// MAIN.JS - FUNCIONALIDADES GLOBALES UNIFICADAS                //
// Versión 3.0 - Sin modo oscuro, diseño blanco                 //
// ============================================================ //

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== AÑO DINÁMICO =====
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('mainHeader');
    
    function handleHeaderScroll() {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
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
    handleHeaderScroll();

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
            this.setAttribute('aria-expanded', !mobileMenu.classList.contains('hidden'));
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
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== MANEJO DEL FORMULARIO DE COTIZACIÓN =====
    const form = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form && submitBtn) {
        const originalContent = submitBtn.innerHTML;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enviando solicitud...</span>
            `;

            try {
                const formData = new FormData(form);
                // Simulación de envío - reemplazar con fetch real
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                submitBtn.classList.remove('bg-primary');
                submitBtn.classList.add('bg-success');
                submitBtn.innerHTML = `
                    <i class="fa-regular fa-circle-check"></i>
                    <span>¡Solicitud enviada!</span>
                `;
                form.reset();

                setTimeout(() => {
                    submitBtn.classList.remove('bg-success');
                    submitBtn.classList.add('bg-primary');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }, 4000);

            } catch (error) {
                submitBtn.classList.remove('bg-primary');
                submitBtn.classList.add('bg-danger');
                submitBtn.innerHTML = `
                    <i class="fa-regular fa-circle-xmark"></i>
                    <span>Error. Intenta de nuevo.</span>
                `;

                setTimeout(() => {
                    submitBtn.classList.remove('bg-danger');
                    submitBtn.classList.add('bg-primary');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }, 4000);
            }
        });
    }

    // ===== WHATSAPP FLOAT =====
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function(e) {
            e.preventDefault();
            const phone = this.dataset.phone || '51999999999';
            const message = this.dataset.message || 'Hola, me interesa sus servicios de reparación de computadoras.';
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });

        // Mostrar/ocultar según scroll
        let isVisible = false;
        window.addEventListener('scroll', () => {
            const shouldShow = window.scrollY > 300;
            if (shouldShow && !isVisible) {
                whatsappFloat.style.opacity = '1';
                whatsappFloat.style.transform = 'scale(1)';
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                whatsappFloat.style.opacity = '0';
                whatsappFloat.style.transform = 'scale(0.8)';
                isVisible = false;
            }
        });
        // Estado inicial
        whatsappFloat.style.opacity = '0';
        whatsappFloat.style.transform = 'scale(0.8)';
        whatsappFloat.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // ===== CARGAR COMPONENTES (Header, Footer, WhatsApp) =====
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

    // Cargar componentes
    loadComponent('#header-placeholder', 'components/header.html');
    loadComponent('#footer-placeholder', 'components/footer.html');
    loadComponent('#whatsapp-placeholder', 'components/whatsapp-float.html');

    console.log('🚀 ServiComp+ - Sistema Inicializado (Diseño Blanco)');
});

// ===== FUNCIONES GLOBALES =====

// Notificaciones
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    toast.innerHTML = `
        <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#1a3a5c'
    };

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: colors[type] || colors.info,
        color: 'white',
        padding: '14px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        maxWidth: '400px',
        animation: 'slideInUp 0.3s ease-out',
        opacity: '1',
        transform: 'translateY(0)'
    });

    document.body.appendChild(toast);

    toast.querySelector('.notification-close').addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
                padding: 0 4px;
            }
            .notification-close:hover { opacity: 1; }
        `;
        document.head.appendChild(style);
    }
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('¡Copiado al portapapeles!', 'success');
    }).catch(() => {
        showNotification('Error al copiar', 'error');
    });
}

// Exponer funciones globales
window.showNotification = showNotification;
window.copyToClipboard = copyToClipboard;
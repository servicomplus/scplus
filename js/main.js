// ================================================================ //
// SERVICOMP+ - MAIN.JS                                            //
// Versión 3.0 - JavaScript Limpio y Organizado                   //
// ================================================================ //

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ================================================================ //
    // 1. CARGAR COMPONENTES                                            //
    // ================================================================ //

    const components = [
        { selector: '#header-placeholder', file: 'components/header.html' },
        { selector: '#footer-placeholder', file: 'components/footer.html' },
        { selector: '#whatsapp-placeholder', file: 'components/whatsapp.html' }
    ];

    let loaded = 0;

    components.forEach(({ selector, file }) => {
        const el = document.querySelector(selector);
        if (!el) return;

        fetch(file)
            .then(res => res.text())
            .then(html => {
                el.innerHTML = html;
                loaded++;
                if (loaded === components.length) {
                    initComponents();
                }
            })
            .catch(() => {
                el.innerHTML = '<p style="color:red;padding:1rem;">Error al cargar componente</p>';
                loaded++;
                if (loaded === components.length) {
                    initComponents();
                }
            });
    });

    // ================================================================ //
    // 2. INICIALIZAR COMPONENTES                                      //
    // ================================================================ //

    function initComponents() {
        updateYear();
        initHeader();
        initMobileMenu();
        initWhatsApp();
        initSmoothScroll();
        initQuoteForm();
        initLottieAnimation();
        console.log('✅ ServiComp+ Inicializado');
    }

    // ================================================================ //
    // 3. ACTUALIZAR AÑO                                               //
    // ================================================================ //

    function updateYear() {
        document.querySelectorAll('#year').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    // ================================================================ //
    // 4. HEADER SCROLL                                                //
    // ================================================================ //

    function initHeader() {
        const header = document.getElementById('mainHeader');
        if (!header) return;

        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ================================================================ //
    // 5. MENÚ MÓVIL                                                   //
    // ================================================================ //

    function initMobileMenu() {
        const btn = document.getElementById('mobileToggle');
        const menu = document.getElementById('mobileMenu');
        if (!btn || !menu) return;

        function toggle() {
            menu.classList.toggle('open');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = menu.classList.contains('open') 
                    ? 'fa-solid fa-xmark' 
                    : 'fa-solid fa-bars';
            }
        }

        btn.addEventListener('click', toggle);

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('open');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // ================================================================ //
    // 6. WHATSAPP FLOAT - SIEMPRE VISIBLE                             //
    // ================================================================ //

    function initWhatsApp() {
        const wa = document.querySelector('.whatsapp-float');
        if (!wa) return;

        wa.style.opacity = '1';
        wa.style.transform = 'scale(1)';
        wa.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // ================================================================ //
    // 7. SMOOTH SCROLL                                                //
    // ================================================================ //

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: pos, behavior: 'smooth' });
                }
            });
        });
    }

    // ================================================================ //
    // 8. FORMULARIO DE COTIZACIÓN                                     //
    // ================================================================ //

    function initQuoteForm() {
        const form = document.getElementById('quote-form');
        const btn = document.getElementById('submit-btn');
        if (!form || !btn) return;

        const original = btn.innerHTML;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            btn.disabled = true;
            btn.innerHTML = `
                <span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>
                Enviando...
            `;

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                btn.style.background = '#10b981';
                btn.innerHTML = '✅ ¡Enviado!';
                form.reset();
                setTimeout(() => {
                    btn.style.background = '';
                    btn.disabled = false;
                    btn.innerHTML = original;
                }, 3000);
            } catch {
                btn.style.background = '#ef4444';
                btn.innerHTML = '❌ Error';
                setTimeout(() => {
                    btn.style.background = '';
                    btn.disabled = false;
                    btn.innerHTML = original;
                }, 3000);
            }
        });
    }

    // ================================================================ //
    // 9. ANIMACIÓN LOTTIE (JSON LOCAL)                               //
    // ================================================================ //

    function initLottieAnimation() {
        const container = document.getElementById('lottieContainer');
        if (!container) {
            console.warn('⚠️ Contenedor Lottie no encontrado');
            return;
        }

        // Verificar si lottie está disponible
        if (typeof lottie === 'undefined') {
            console.warn('⚠️ Librería Lottie no cargada');
            // Cargar dinámicamente si no existe
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
            script.onload = () => {
                console.log('📦 Lottie cargado dinámicamente');
                initAnimation();
            };
            script.onerror = () => {
                console.error('❌ Error al cargar Lottie');
                container.innerHTML = '<p style="color:red;font-size:12px;">⚠️ Error al cargar animación</p>';
            };
            document.head.appendChild(script);
            return;
        }

        initAnimation();

        function initAnimation() {
            // ✅ RUTA LOCAL (archivo descargado)
            const animationUrl = 'img/chateam.json';

            // Cargar animación en pausa
            const anim = lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: animationUrl,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet',
                    clearCanvas: true,
                    progressiveLoad: true
                }
            });

            // Estado
            let isPlaying = false;

            // 1. Scroll: activar/pausar
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !isPlaying) {
                        anim.play();
                        isPlaying = true;
                        console.log('▶️ Animación activada por scroll');
                    } else if (!entry.isIntersecting && isPlaying) {
                        anim.pause();
                        isPlaying = false;
                        console.log('⏸️ Animación pausada (scroll)');
                    }
                });
            }, { 
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            });

            observer.observe(container);

            // 2. Hover: cambiar velocidad (solo escritorio)
            if (!('ontouchstart' in window)) {
                container.addEventListener('mouseenter', () => {
                    anim.setSpeed(1.5);
                    console.log('⚡ Velocidad 1.5x');
                });

                container.addEventListener('mouseleave', () => {
                    anim.setSpeed(1);
                    console.log('🐢 Velocidad normal');
                });
            }

            // 3. Click: toggle manual (para móviles)
            container.addEventListener('click', () => {
                if (anim.isPaused) {
                    anim.play();
                    isPlaying = true;
                    console.log('🔄 Click: reproducir');
                } else {
                    anim.pause();
                    isPlaying = false;
                    console.log('🔄 Click: pausar');
                }
            });

            // 4. Limpiar observer cuando se destruya la animación
            anim.addEventListener('destroy', () => {
                observer.disconnect();
                console.log('🧹 Animación y observer destruidos');
            });

            console.log('✅ Animación Lottie inicializada (local)');
        }
    }

    // ================================================================ //
    // 10. SPIN ANIMATION STYLE                                        //
    // ================================================================ //

    if (!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

});

// ================================================================ //
// 11. FUNCIONES GLOBALES                                          //
// ================================================================ //

function showNotification(msg, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#1a3a5c' };
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <span>${icons[type]}</span>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:1.25rem;cursor:pointer;">×</button>
    `;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: colors[type],
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'fadeInUp 0.3s ease-out'
    });
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);

    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification('¡Copiado!', 'success'))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showNotification('¡Copiado!', 'success');
}

window.showNotification = showNotification;
window.copyToClipboard = copyToClipboard;
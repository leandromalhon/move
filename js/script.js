/**
 * MOVE CENTRO DE SAÚDE E ESTÉTICA
 * Script Principal - VERSÃO FINAL
 * 
 * Funcionalidades:
 * - Tela de loading com fade out
 * - Galeria de imagens com navegação
 * - Tracking de eventos para análise
 * - Animações e interações suaves
 * - Otimizações de performance
 */

'use strict';

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

const CONFIG = {
    loadingDuration: 1200, // Tempo de loading em ms
    galleryAutoPlayInterval: 5000, // 5 segundos
    enableAutoPlay: true,
    enableAnalytics: true,
    googleAnalyticsId: 'G-XXXXXXXXXX' // Substitua pelo seu ID do GA4
};

// ========================================
// INICIALIZAÇÃO DO LOADING
// ========================================

window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    
    setTimeout(() => {
        if (loader) {
            loader.style.display = 'none';
        }
        initGallery();
        initInteractions();
    }, CONFIG.loadingDuration);
});

// ========================================
// GALERIA DE IMAGENS
// ========================================

class ImageGallery {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.images = this.container.querySelectorAll('.gallery-image');
        this.prevBtn = this.container.querySelector('.gallery-nav.prev');
        this.nextBtn = this.container.querySelector('.gallery-nav.next');
        this.currentIndex = 0;
        this.autoPlayTimer = null;
        
        this.init();
    }
    
    init() {
        if (this.images.length <= 1) {
            // Se houver apenas uma imagem, esconde os botões de navegação
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            return;
        }
        
        this.attachEventListeners();
        
        if (CONFIG.enableAutoPlay) {
            this.startAutoPlay();
            this.setupAutoPlayPause();
        }
    }
    
    attachEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevImage());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextImage());
        }
        
        // Suporte para teclado (acessibilidade)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
        });
        
        // Suporte para swipe em mobile
        this.setupSwipeGestures();
    }
    
    showImage(index) {
        // Remove classe active de todas as imagens
        this.images.forEach(img => img.classList.remove('active'));
        
        // Adiciona classe active na imagem atual
        if (this.images[index]) {
            this.images[index].classList.add('active');
            this.currentIndex = index;
            
            // Analytics: rastrear visualização de imagem
            this.trackEvent('gallery_view', {
                image_index: index,
                total_images: this.images.length
            });
        }
    }
    
    nextImage() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
        this.resetAutoPlay();
    }
    
    prevImage() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showImage(prevIndex);
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        if (!CONFIG.enableAutoPlay) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.nextImage();
        }, CONFIG.galleryAutoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    setupAutoPlayPause() {
        // Pausa autoplay quando o usuário interage ou sai da página
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50; // pixels
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextImage(); // Swipe left = próxima
            } else {
                this.prevImage(); // Swipe right = anterior
            }
        }
    }
    
    trackEvent(eventName, params) {
        if (CONFIG.enableAnalytics && typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }
}

function initGallery() {
    const gallery = new ImageGallery('.image-gallery');
}

// ========================================
// INTERAÇÕES E ANIMAÇÕES
// ========================================

function initInteractions() {
    // Animações nos cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const isWhatsApp = card.classList.contains('card-whatsapp');
        
        card.addEventListener('mouseenter', () => {
            if (isWhatsApp) {
                card.style.transform = 'translateY(-3px)';
            } else {
                card.style.transform = 'translateY(-2px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        card.addEventListener('mousedown', () => {
            if (isWhatsApp) {
                card.style.transform = 'translateY(-1px) scale(0.98)';
            } else {
                card.style.transform = 'translateY(0) scale(0.98)';
            }
        });
        
        card.addEventListener('mouseup', () => {
            if (isWhatsApp) {
                card.style.transform = 'translateY(-3px)';
            } else {
                card.style.transform = 'translateY(-2px)';
            }
        });
    });
}

// ========================================
// ANALYTICS E TRACKING
// ========================================

class Analytics {
    constructor() {
        this.init();
    }
    
    init() {
        if (!CONFIG.enableAnalytics) return;
        
        // Rastrear cliques nos botões
        this.trackButtonClicks();
        
        // Rastrear tempo na página
        this.trackTimeOnPage();
        
        // Rastrear scroll
        this.trackScroll();
    }
    
    trackButtonClicks() {
        const buttons = document.querySelectorAll('.card');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.querySelector('span')?.textContent || button.textContent || 'Unknown';
                const buttonHref = button.getAttribute('href') || '';
                const buttonType = button.classList.contains('card-whatsapp') ? 'primary' : 'secondary';
                
                this.sendEvent('button_click', {
                    button_name: buttonText.trim(),
                    button_url: buttonHref,
                    button_type: buttonType
                });
            });
        });
    }
    
    trackTimeOnPage() {
        const startTime = Date.now();
        
        // Envia evento quando usuário sai da página
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000); // em segundos
            
            this.sendEvent('time_on_page', {
                duration_seconds: timeSpent
            });
        });
    }
    
    trackScroll() {
        let maxScroll = 0;
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    // Envia eventos em marcos: 25%, 50%, 75%, 100%
                    if ([25, 50, 75, 100].includes(maxScroll)) {
                        this.sendEvent('scroll_depth', {
                            percent: maxScroll
                        });
                    }
                }
            }, 150);
        });
    }
    
    sendEvent(eventName, params) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
        
        // Log para desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Analytics Event:', eventName, params);
        }
    }
}

// ========================================
// PREVENÇÃO DE COMPORTAMENTOS INDESEJADOS
// ========================================

// Previne double-tap zoom em iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Previne pull-to-refresh quando já está no topo
let startY = 0;
document.addEventListener('touchstart', (event) => {
    startY = event.touches[0].pageY;
}, { passive: true });

document.addEventListener('touchmove', (event) => {
    const y = event.touches[0].pageY;
    if (window.scrollY === 0 && y > startY) {
        event.preventDefault();
    }
}, { passive: false });

// ========================================
// INICIALIZAÇÃO COMPLETA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏥 Move Centro de Saúde - Sistema iniciado');
    
    // Inicializa analytics
    const analytics = new Analytics();
    
    console.log('✅ Todos os módulos carregados com sucesso');
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

// Monitora performance da página (opcional)
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('⚡ LCP:', entry.startTime);
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
}

// ========================================
// UTILITÁRIOS
// ========================================

// Debounce function para otimizar eventos que disparam frequentemente
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
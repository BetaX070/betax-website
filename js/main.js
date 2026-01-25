// =========================================
// BetaX Technologies - Main JavaScript
// Core Functionality & Interactions
// =========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features
    initNavigation();
    initThemeToggle();
    initScrollAnimations();
    initBackToTop();
    initScrollProgress();
    initMobileMenu();
    initStats();
});

// =========================================
// NAVIGATION - Sticky & Active States
// =========================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar-link');

    if (!navbar) return;

    // Sticky navigation on scroll (handled by consolidated scroll handler below)

    // Highlight active nav link based on current page (improved exactnessmatching)
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkPage = href.split('/').pop();
            // Exact match instead of substring to avoid false positives
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        }
    });

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}
if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
            }
        });
    });
}

// =========================================
// MOBILE MENU TOGGLE
// =========================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (!menuToggle || !navbarMenu) return;

    menuToggle.addEventListener('click', function () {
        navbarMenu.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.navbar-container')) {
            navbarMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// =========================================
// THEME TOGGLE - Dark/Light Mode
// =========================================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', function () {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// =========================================
// SCROLL ANIMATIONS - Reveal on Scroll
// =========================================
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');

    if (revealElements.length === 0) return;

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });
}

// =========================================
// BACK TO TOP BUTTON
// =========================================
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    // Scroll visibility handled by consolidated scroll handler

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================================
// SCROLL PROGRESS INDICATOR
// =========================================
function initScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;
    // Progress calculation handled by consolidated scroll handler below
}

// =========================================
// CONSOLIDATED SCROLL HANDLER (Performance Optimization)
// =========================================
(function initConsolidatedScrollHandler() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');
    const progressBar = document.querySelector('.progress-bar');

    // Throttle helper to limit scroll handler execution
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    // Single scroll handler for all scroll-based features
    const handleScroll = throttle(function () {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Navbar sticky state
        if (navbar) {
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Progress bar
        if (progressBar) {
            const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }
    }, 16); // ~60fps throttle

    window.addEventListener('scroll', handleScroll, { passive: true });
})();

// =========================================
// ANIMATED STATISTICS COUNTER
// =========================================
function initStats() {
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length === 0) return;

    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + (element.dataset.suffix || '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.dataset.count);

                // Security: Validate data-count exists and is a number
                if (isNaN(target) || target === undefined) {
                    console.warn('Invalid data-count attribute:', entry.target);
                    return;
                }

                const suffix = entry.target.dataset.suffix || '';
                // Store suffix before animation to avoid redundancy
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        observer.observe(stat);
    });
}

// =========================================
// MODAL FUNCTIONALITY
// =========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// =========================================
// UTILITY FUNCTIONS
// =========================================

// Debounce function for performance
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other scripts
window.BetaX = {
    openModal,
    closeModal,
    debounce,
    throttle
};

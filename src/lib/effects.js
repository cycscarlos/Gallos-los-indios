// effects.js - Embers, toggle menu, navbar scroll (ES Module)

function createEmbers() {
    const embersContainer = document.getElementById('embers');
    if (!embersContainer) return;

    for (let i = 0; i < 30; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember';
        ember.style.left = Math.random() * 100 + '%';
        ember.style.width = (Math.random() * 6 + 2) + 'px';
        ember.style.height = ember.style.width;
        ember.style.animationDuration = (Math.random() * 8 + 6) + 's';
        ember.style.animationDelay = (Math.random() * 10) + 's';
        embersContainer.appendChild(ember);
    }
}

function toggleMenu() {
    const navLinks = document.querySelector('.navbar-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

export { createEmbers, toggleMenu, initNavbarScroll };

// Compatibilidad global para onclick inline
window.toggleMenu = toggleMenu;

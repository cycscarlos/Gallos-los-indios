// ========================================
// SHARED.JS - Shared functionality
// Used by: galeria, servicios, contacto, fin, instalaciones
// ========================================

// Create embers
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

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.querySelector('.navbar-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.ThreeScene) window.ThreeScene.init();
    createEmbers();
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

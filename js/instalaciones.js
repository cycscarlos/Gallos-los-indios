// ========================================
// INSTALACIONES.JS - Facilities & Recognitions Page
// ========================================

// Tab functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const grids = document.querySelectorAll('.installations-grid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            btn.classList.add('active');

            // Hide all grids
            grids.forEach(grid => grid.classList.remove('active'));

            // Show selected grid
            const tabId = btn.dataset.tab;
            const targetGrid = document.getElementById(tabId);
            if (targetGrid) {
                targetGrid.classList.add('active');
            }

            initAudio();
            playClickSound();
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();

    window.toggleMenu = function() {
        const navLinks = document.querySelector('.navbar-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    };
});

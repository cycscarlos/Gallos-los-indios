import { createEmbers, initNavbarScroll, setupNavbarToggle } from '../lib/effects.js';
import { setupSoundToggle, playClickSound, initAudio } from '../lib/audio.js';

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const grids = document.querySelectorAll('.installations-grid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            grids.forEach(grid => grid.classList.remove('active'));

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

document.addEventListener('DOMContentLoaded', async function() {
    const { ThreeScene } = await import('../lib/three-scene.js');
    ThreeScene.init();
    createEmbers();
    initNavbarScroll();
    setupNavbarToggle();
    setupSoundToggle();
    setupTabs();
});

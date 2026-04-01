import { ThreeScene } from '../lib/three-scene.js';
import { createEmbers, initNavbarScroll } from '../lib/effects.js';
import { setupSoundToggle, playClickSound, initAudio } from '../lib/audio.js';

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const grids = document.querySelectorAll('.installations-grid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

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

document.addEventListener('DOMContentLoaded', function() {
    ThreeScene.init();
    createEmbers();
    initNavbarScroll();
    setupSoundToggle();
    setupTabs();
});

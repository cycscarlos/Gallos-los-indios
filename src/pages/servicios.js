import { createEmbers, initNavbarScroll, setupNavbarToggle } from '../lib/effects.js';
import { setupSoundToggle } from '../lib/audio.js';

document.addEventListener('DOMContentLoaded', async function() {
    const { ThreeScene } = await import('../lib/three-scene.js');
    ThreeScene.init();
    createEmbers();
    initNavbarScroll();
    setupNavbarToggle();
    setupSoundToggle();
});

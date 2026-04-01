import { ThreeScene } from '../lib/three-scene.js';
import { createEmbers, initNavbarScroll, setupNavbarToggle } from '../lib/effects.js';
import { setupSoundToggle } from '../lib/audio.js';

document.addEventListener('DOMContentLoaded', function() {
    ThreeScene.init();
    createEmbers();
    initNavbarScroll();
    setupNavbarToggle();
    setupSoundToggle();
});

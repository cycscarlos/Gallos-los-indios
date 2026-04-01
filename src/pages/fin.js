import { createEmbers, initNavbarScroll, setupNavbarToggle } from '../lib/effects.js';
import { setupSoundToggle } from '../lib/audio.js';

document.addEventListener('DOMContentLoaded', function() {
    createEmbers();
    initNavbarScroll();
    setupNavbarToggle();
    setupSoundToggle();
});

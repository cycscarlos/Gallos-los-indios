// audio.js - Sistema de audio unificado (ES Module)

let audioContext;
let isMuted = false;
let soundInitialized = false;

function initAudio() {
    if (soundInitialized) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        soundInitialized = true;
        createAmbientSound();
    } catch (e) {
        console.log('Audio not supported');
    }
}

function createAmbientSound() {
    if (!audioContext || isMuted) return;

    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(80, audioContext.currentTime);

    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(120, audioContext.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);

    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator1.start();
    oscillator2.start();

    window.audioNodes = { oscillator1, oscillator2, gainNode };
}

function playClickSound() {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
}

function setupSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
        initAudio();
        isMuted = !isMuted;
        soundToggle.classList.toggle('muted', isMuted);
        soundToggle.textContent = isMuted ? 'SILENCIAR' : 'AUDIO';

        if (window.audioNodes) {
            window.audioNodes.gainNode.gain.setValueAtTime(isMuted ? 0 : 0.02, audioContext.currentTime);
        }
    });

    // Init audio on first user click
    document.addEventListener('click', initAudio, { once: true });
}

export { initAudio, playClickSound, createAmbientSound, setupSoundToggle };

// Compatibilidad global
window.playClickSound = playClickSound;

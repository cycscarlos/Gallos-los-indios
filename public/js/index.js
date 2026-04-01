// ========================================
// INDEX.JS - Home Page Specific
// Extiende ThreeScene base con gallos, plumas y anillos
// ========================================

function scrollToFeatures() {
    const features = document.querySelector('.features-section');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
}

let roosters = [];
let feathers = [];

function init() {
    const result = window.ThreeScene.init();
    if (!result) return;

    const scene = window.ThreeScene.getScene();

    // Light adicional para la landing
    const light3 = new THREE.PointLight(0x8b0000, 0.3, 30);
    light3.position.set(0, -10, 0);
    scene.add(light3);

    // Arena rings
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.RingGeometry(10 + i * 15, 11 + i * 15, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            transparent: true,
            opacity: 0.15 - i * 0.04,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -14.9;
        ring.userData.type = 'ring';
        ring.userData.baseOpacity = 0.15 - i * 0.04;
        scene.add(ring);
    }

    createRoosters();
    createFeathers();
}

function createRoosters() {
    const scene = window.ThreeScene.getScene();
    const roosterColors = [0xd4af37, 0x8b0000, 0xf4d03f, 0xb8860b];

    for (let i = 0; i < 6; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: roosterColors[Math.floor(Math.random() * roosterColors.length)],
            emissive: roosterColors[Math.floor(Math.random() * roosterColors.length)],
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.7
        });

        const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        bodyGeometry.scale(1.5, 1, 0.8);
        const rooster = new THREE.Mesh(bodyGeometry, material);

        const roosterGroup = new THREE.Group();
        roosterGroup.add(rooster);

        roosterGroup.position.set(
            (Math.random() - 0.5) * 40,
            -12 + Math.random() * 8,
            -8 - Math.random() * 15
        );

        roosterGroup.userData.speed = 0.01 + Math.random() * 0.02;
        roosterGroup.userData.type = 'rooster';
        roosterGroup.userData.direction = Math.random() > 0.5 ? 1 : -1;

        roosters.push(roosterGroup);
        scene.add(roosterGroup);
    }
}

function createFeathers() {
    const scene = window.ThreeScene.getScene();
    for (let i = 0; i < 30; i++) {
        const geometry = new THREE.PlaneGeometry(0.3, 0.8);
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xd4af37 : 0xb8860b,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3,
            side: THREE.DoubleSide
        });

        const feather = new THREE.Mesh(geometry, material);
        feather.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 40,
            -5 - Math.random() * 20
        );
        feather.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        feather.userData.speed = 0.005 + Math.random() * 0.01;
        feather.userData.type = 'feather';
        feather.userData.rotationSpeed = 0.01 + Math.random() * 0.02;

        feathers.push(feather);
        scene.add(feather);
    }
}

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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    init();
    createEmbers();
});

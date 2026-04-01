// ========================================
// INDEX.JS - Home Page Specific
// ========================================

function scrollToFeatures() {
    const features = document.querySelector('.features-section');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
}

// Three.js Scene Setup - More elaborate for home page
let scene, camera, renderer, particles;
let roosters = [];
let feathers = [];

function init() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);
    canvasContainer.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xd4af37, 0.3);
    scene.add(ambientLight);
    
    const light1 = new THREE.PointLight(0xd4af37, 1, 50);
    light1.position.set(10, 10, 10);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xff6b00, 0.5, 50);
    light2.position.set(-10, 5, 5);
    scene.add(light2);
    
    const light3 = new THREE.PointLight(0x8b0000, 0.3, 30);
    light3.position.set(0, -10, 0);
    scene.add(light3);
    
    createParticles();
    createArena();
    createRoosters();
    createFeathers();
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        const goldVariation = Math.random();
        if (goldVariation < 0.6) {
            colors[i * 3] = 0.83;
            colors[i * 3 + 1] = 0.69;
            colors[i * 3 + 2] = 0.22;
        } else if (goldVariation < 0.9) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.84;
            colors[i * 3 + 2] = 0.0;
        } else {
            colors[i * 3] = 0.55;
            colors[i * 3 + 1] = 0.44;
            colors[i * 3 + 2] = 0.04;
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.15,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createArena() {
    const geometry = new THREE.PlaneGeometry(200, 100, 40, 40);
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    
    const arena = new THREE.Mesh(geometry, material);
    arena.rotation.x = -Math.PI / 2;
    arena.position.y = -15;
    scene.add(arena);
    
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
}

function createRoosters() {
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.0005;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.03;
            if (positions[i + 1] > 50) {
                positions[i + 1] = -50;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate scene objects
    scene.children.forEach(child => {
        if (child.userData.type === 'ring') {
            child.rotation.z += 0.001;
            child.material.opacity = child.userData.baseOpacity * (0.8 + Math.sin(time) * 0.2);
        }
        
        if (child.userData.type === 'rooster') {
            child.position.x += child.userData.speed * child.userData.direction;
            if (child.position.x > 25) child.userData.direction = -1;
            if (child.position.x < -25) child.userData.direction = 1;
        }
        
        if (child.userData.type === 'feather') {
            child.position.y += child.userData.speed;
            child.rotation.x += child.userData.rotationSpeed;
            if (child.position.y > 25) child.position.y = -25;
        }
    });
    
    // Camera parallax
    camera.position.x = Math.sin(time * 0.2) * 1;
    camera.position.y = Math.cos(time * 0.15) * 0.5;
    
    renderer.render(scene, camera);
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

// ========================================
// SHARED.JS - Shared functionality
// Used by: gallos.html, servicios.html, contacto.html, fin.html
// ========================================

// Three.js Scene Setup
let scene, camera, renderer, particles;

function init() {
    // Check if canvas container exists
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
    
    // Particles
    createParticles();
    
    // Arena
    createArena();
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
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
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (!scene || !camera || !renderer) return;
    
    const time = Date.now() * 0.001;
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.0005;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.02;
            if (positions[i + 1] > 50) {
                positions[i + 1] = -50;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Subtle camera movement
    camera.position.x = Math.sin(time * 0.2) * 0.5;
    camera.position.y = Math.cos(time * 0.15) * 0.3;
    
    renderer.render(scene, camera);
}

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
    init();
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

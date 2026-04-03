import { API } from '../lib/api.js';
import { createEmbers, initNavbarScroll, setupNavbarToggle } from '../lib/effects.js';
import { playClickSound, setupSoundToggle } from '../lib/audio.js';

// Gallery state
const itemsPerPage = 9;
let currentPage = 1;
let currentFilter = 'all';
let allEjemplares = [];

/**
 * Carga de datos de Supabase
 */
async function fetchEjemplares() {
    const grid = document.getElementById('galleryGrid');
    if (grid) grid.innerHTML = '<div class="loading">Cargando ejemplares...</div>';

    const { data, error } = await API.ejemplares.getAll({ estado: 'disponible' });
    
    if (error) {
        console.error('Error fetching gallery:', error);
        if (grid) grid.innerHTML = '<div class="error">Error al cargar la galería.</div>';
        return [];
    }
    
    return data.map(item => ({
        id: item.id,
        placa_id: item.placa_id,
        marca: item.marca,
        genero: item.genero,
        linea: item.linea || '-',
        precio: item.precio || 'CONSULTAR',
        estado: item.estado || 'disponible',
        fecha_nacimiento: item.fecha_nacimiento || null,
        padre_id: item.padre_id || null,
        madre_id: item.madre_id || null,
        abuelo_paterno_id: item.abuelo_paterno_id || null,
        abuela_paterna_id: item.abuela_paterna_id || null,
        abuelo_materno_id: item.abuelo_materno_id || null,
        abuela_materna_id: item.abuela_materna_id || null,
        image: item.imagen_url || '/images/favicon.png',
        observaciones: item.observaciones || '',
        // Compatibilidad filtros
        race: item.genero,
    }));
}

/**
 * Formatea la fecha de nacimiento de forma legible
 */
function formatFecha(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Renderiza la galería con Flip Cards
 */
function renderGallery(filter = 'all', page = 1) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    currentFilter = filter;
    currentPage = page;

    let filteredData = filter === 'all' 
        ? allEjemplares 
        : allEjemplares.filter(item => item.genero && item.genero.toLowerCase() === filter.toLowerCase());

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        grid.innerHTML = '<div class="empty-state">No hay ejemplares en esta categoría.</div>';
    } else {
        grid.innerHTML = pageData.map(item => `
            <div class="gallery-item" tabindex="0" role="button" aria-label="Ver ficha de ${item.placa_id} - ${item.marca}">
                <div class="flip-card-inner">

                    <!-- CARA FRONTAL -->
                    <div class="flip-card-front">
                        <img src="${item.image}" alt="${item.placa_id} - ${item.marca}" class="gallery-image">
                        <div class="gallery-info">
                            <div class="gallery-name">${item.placa_id} · ${item.marca}</div>
                        </div>
                    </div>

                    <!-- CARA TRASERA -->
                    <div class="flip-card-back">
                        <div class="flip-back-badge">🐓 Ficha del Ejemplar</div>
                        <div class="flip-back-fields">
                            <div class="flip-field">
                                <span class="flip-field-label">Placa</span>
                                <span class="flip-field-value gold">${item.placa_id}</span>
                            </div>
                            <div class="flip-field">
                                <span class="flip-field-label">Marca</span>
                                <span class="flip-field-value">${item.marca}</span>
                            </div>
                            <div class="flip-field">
                                <span class="flip-field-label">Nacimiento</span>
                                <span class="flip-field-value">${formatFecha(item.fecha_nacimiento)}</span>
                            </div>
                            <div class="flip-field">
                                <span class="flip-field-label">Línea</span>
                                <span class="flip-field-value">${item.linea}</span>
                            </div>
                            <div class="flip-field">
                                <span class="flip-field-label">Precio</span>
                                <span class="flip-field-value gold">${item.precio}</span>
                            </div>
                            <div class="flip-field">
                                <span class="flip-field-label">Estado</span>
                                <span class="flip-estado ${item.estado}">${item.estado}</span>
                            </div>
                        </div>
                        <a href="/pages/linaje.html?id=${item.id}" class="btn-linaje">
                            🌿 Ver Linaje
                        </a>
                    </div>

                </div>
            </div>
        `).join('');
    }

    updatePagination(filteredData.length, totalPages);
    setupFlipCards();
}

function setupFlipCards() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.btn-linaje')) return;
            const inner = item.querySelector('.flip-card-inner');
            if (inner) inner.classList.toggle('flipped');
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const inner = item.querySelector('.flip-card-inner');
                if (inner) inner.classList.toggle('flipped');
            }
        });
    });
}

function updatePagination(totalItems, totalPages) {
    const pagination = document.getElementById('galleryPagination');
    if (!pagination) return;

    let html = '';

    html += `<button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
        </svg>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }

    html += `<button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
        </svg>
    </button>`;

    pagination.innerHTML = html;
}

/**
 * Inicialización
 */
async function init() {
    const { ThreeScene } = await import('../lib/three-scene.js');
    ThreeScene.init();
    createEmbers();
    initNavbarScroll();
    setupNavbarToggle();
    setupSoundToggle();

    allEjemplares = await fetchEjemplares();
    renderGallery('all', 1);
    setupFilters();

    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            document.getElementById('modalOverlay')?.classList.remove('active');
        });
    }

    document.getElementById('galleryPagination').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page]');
        if (btn && !btn.disabled) {
            changeGalleryPage(parseInt(btn.dataset.page));
        }
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter, 1);
            if (playClickSound) playClickSound();
        });
    });
}

function changeGalleryPage(page) {
    let filteredData = currentFilter === 'all' 
        ? allEjemplares 
        : allEjemplares.filter(item => item.genero && item.genero.toLowerCase() === currentFilter.toLowerCase());
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        renderGallery(currentFilter, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', init);

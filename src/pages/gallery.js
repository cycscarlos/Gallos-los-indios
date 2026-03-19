import { API } from '../lib/api.js';

// Gallery state
const itemsPerPage = 6;
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
    
    // Mapeo selectivo para compatibilidad con la UI original
    return data.map(item => ({
        id: item.id,
        name: item.nombre,
        race: item.tipo, // 'indio', 'americano', 'espanol'
        raceLabel: `Gallo ${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}`,
        image: item.imagen_url || '/images/favicon.png',
        pedigreeShort: item.pedigree_resumido || 'Pedigree en trámite',
        price: item.precio || 'CONSULTAR',
        pedigreeFull: item.pedigree_completo || {
            father: item.padre || '-',
            mother: item.madre || '-',
            paternalGrandfather: item.abuelo_paterno || '-',
            paternalGrandmother: item.abuela_paterna || '-',
            maternalGrandfather: item.abuelo_materno || '-',
            maternalGrandmother: item.abuela_materna || '-'
        },
        characteristics: `${item.edad || '?'} años - ${item.peso || '?'} kg`
    }));
}

/**
 * Renderiza la galería
 */
function renderGallery(filter = 'all', page = 1) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    currentFilter = filter;
    currentPage = page;

    let filteredData = filter === 'all' 
        ? allEjemplares 
        : allEjemplares.filter(item => item.race === filter);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        grid.innerHTML = '<div class="empty-state">No hay ejemplares en esta categoría.</div>';
    } else {
        grid.innerHTML = pageData.map(item => `
            <div class="gallery-item" onclick="window.openGalleryModal(${item.id})">
                <img src="${item.image}" alt="${item.name}" class="gallery-image">
                <div class="gallery-info">
                    <div class="gallery-name">${item.name}</div>
                    <div class="gallery-pedigree">${item.pedigreeShort}</div>
                    <div class="gallery-price">${item.price}</div>
                </div>
            </div>
        `).join('');
    }

    updatePagination(filteredData.length, totalPages);
}

function updatePagination(totalItems, totalPages) {
    const pagination = document.getElementById('galleryPagination');
    if (!pagination) return;

    let html = '';

    // Next/Prev buttons logic
    html += `<button class="pagination-btn" onclick="window.changeGalleryPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
        </svg>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="window.changeGalleryPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }

    html += `<button class="pagination-btn" onclick="window.changeGalleryPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
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
    allEjemplares = await fetchEjemplares();
    renderGallery('all', 1);
    setupFilters();

    window.toggleMenu = function() {
        const navLinks = document.querySelector('.navbar-links');
        if (navLinks) navLinks.classList.toggle('active');
    };
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter, 1);
            if (window.playClickSound) window.playClickSound();
        });
    });
}

// Global exports for simple HTML integration
window.changeGalleryPage = (page) => {
    let filteredData = currentFilter === 'all' ? allEjemplares : allEjemplares.filter(item => item.race === currentFilter);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        renderGallery(currentFilter, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.openGalleryModal = (id) => {
    const item = allEjemplares.find(g => g.id === id);
    if (!item) return;
    
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-image-container">
            <img src="${item.image}" alt="${item.name}" class="modal-image">
        </div>
        <div class="modal-details">
            <h2 class="modal-title">${item.name}</h2>
            <div class="modal-subtitle">${item.raceLabel} - ${item.characteristics}</div>
            
            <div class="modal-section-title">ÁRBOL GENEALÓGICO</div>
            <div class="pedigree-tree">
                <div class="pedigree-row">
                    <span class="pedigree-label">PADRE</span>
                    <span class="pedigree-name">${item.pedigreeFull.father}</span>
                </div>
                <div class="pedigree-generation">
                    <div class="pedigree-grandparent">
                        <span class="pedigree-label" style="width:40px">AB</span>
                        <span class="pedigree-name">${item.pedigreeFull.paternalGrandfather}</span>
                    </div>
                    <div class="pedigree-grandparent">
                        <span class="pedigree-label" style="width:40px">AM</span>
                        <span class="pedigree-name">${item.pedigreeFull.paternalGrandmother}</span>
                    </div>
                </div>
                <div class="pedigree-row">
                    <span class="pedigree-label">MADRE</span>
                    <span class="pedigree-name">${item.pedigreeFull.mother}</span>
                </div>
                <div class="pedigree-generation">
                    <div class="pedigree-grandparent">
                        <span class="pedigree-label" style="width:40px">AB</span>
                        <span class="pedigree-name">${item.pedigreeFull.maternalGrandfather}</span>
                    </div>
                    <div class="pedigree-grandparent">
                        <span class="pedigree-label" style="width:40px">AM</span>
                        <span class="pedigree-name">${item.pedigreeFull.maternalGrandmother}</span>
                    </div>
                </div>
            </div>
            
            <a href="mailto:info@galloslosindios.com?subject=Consulta: ${item.name}" class="modal-cta">SOLICITAR INFORMACIÓN</a>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.playClickSound) window.playClickSound();
};

window.closeGalleryModal = () => {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

document.addEventListener('DOMContentLoaded', init);

// Listeners adicionales
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) window.closeGalleryModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeGalleryModal();
});

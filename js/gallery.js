// ========================================
// GALLERY.JS - Gallery Page
// ========================================

// Gallery Data - 14 images with pedigree summary
const galleryData = [
    {
        id: 1,
        name: 'EJEMPLAR 001',
        race: 'indio',
        raceLabel: 'Gallo Indio',
        image: 'images/galeria1.jpg',
        pedigree: 'Rey Indio × Reina Dorada',
        pedigreeShort: 'Rey Indio - Reina Dorada / Centurón',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Rey Indio',
            mother: 'Reina Dorada',
            paternalGrandfather: 'Maharajá',
            paternalGrandmother: 'Estrella',
            maternalGrandfather: 'Centurón',
            maternalGrandmother: 'Rosa'
        },
        characteristics: '2.5 años - 4.2 kg'
    },
    {
        id: 2,
        name: 'EJEMPLAR 002',
        race: 'americano',
        raceLabel: 'Gallo Americano',
        image: 'images/galeria2.jpg',
        pedigree: 'Speed Master × Lightning',
        pedigreeShort: 'Speed Master - Lightning / Duke',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Speed Master',
            mother: 'Lightning',
            paternalGrandfather: 'Thunder',
            paternalGrandmother: 'Eagle',
            maternalGrandfather: 'Duke',
            maternalGrandmother: 'Star'
        },
        characteristics: '2 años - 3.8 kg'
    },
    {
        id: 3,
        name: 'EJEMPLAR 003',
        race: 'espanol',
        raceLabel: 'Gallo Español',
        image: 'images/galeria3.jpg',
        pedigree: 'Torero × Carmen',
        pedigreeShort: 'Torero - Carmen / Español',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Torero',
            mother: 'Carmen',
            paternalGrandfather: 'Matador',
            paternalGrandmother: 'Dolores',
            maternalGrandfather: 'Español',
            maternalGrandmother: 'Gitana'
        },
        characteristics: '3 años - 4.5 kg'
    },
    {
        id: 4,
        name: 'EJEMPLAR 004',
        race: 'indio',
        raceLabel: 'Gallo Indio',
        image: 'images/galeria4.jpg',
        pedigree: 'Sultán × Princesa',
        pedigreeShort: 'Sultán - Princesa / Faraón',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Sultán',
            mother: 'Princesa',
            paternalGrandfather: 'Imperador',
            paternalGrandmother: 'Reina',
            maternalGrandfather: 'Faraón',
            maternalGrandmother: 'Cleopatra'
        },
        characteristics: '2 años - 4.0 kg'
    },
    {
        id: 5,
        name: 'EJEMPLAR 005',
        race: 'americano',
        raceLabel: 'Gallo Americano',
        image: 'images/galeria5.jpg',
        pedigree: 'Combatiente × Victoria',
        pedigreeShort: 'Combatiente - Victoria / Champion',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Combatiente',
            mother: 'Victoria',
            paternalGrandfather: 'Guerrero',
            paternalGrandmother: 'Diosa',
            maternalGrandfather: 'Champion',
            maternalGrandmother: 'Luna'
        },
        characteristics: '2.5 años - 3.9 kg'
    },
    {
        id: 6,
        name: 'EJEMPLAR 006',
        race: 'espanol',
        raceLabel: 'Gallo Español',
        image: 'images/galeria6.jpg',
        pedigree: 'León × Esperanza',
        pedigreeShort: 'León - Esperanza / Noble',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'León',
            mother: 'Esperanza',
            paternalGrandfather: 'Guerrero',
            paternalGrandmother: 'Valiente',
            maternalGrandfather: 'Noble',
            maternalGrandmother: 'Rosa'
        },
        characteristics: '3.5 años - 4.8 kg'
    },
    {
        id: 7,
        name: 'EJEMPLAR 007',
        race: 'indio',
        raceLabel: 'Gallo Indio',
        image: 'images/galeria7.jpg',
        pedigree: 'Rajá × Bella',
        pedigreeShort: 'Rajá - Bella / Emperador',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Rajá',
            mother: 'Bella',
            paternalGrandfather: 'Emperador',
            paternalGrandmother: 'Dorada',
            maternalGrandfather: 'Guerrero',
            maternalGrandmother: 'Blanca'
        },
        characteristics: '3 años - 4.3 kg'
    },
    {
        id: 8,
        name: 'EJEMPLAR 008',
        race: 'americano',
        raceLabel: 'Gallo Americano',
        image: 'images/galeria8.jpg',
        pedigree: 'Thunder × Eagle',
        pedigreeShort: 'Thunder - Eagle / Falcon',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Thunder',
            mother: 'Eagle',
            paternalGrandfather: 'Hawk',
            paternalGrandmother: 'Storm',
            maternalGrandfather: 'Falcon',
            maternalGrandmother: 'Swift'
        },
        characteristics: '2.5 años - 4.0 kg'
    },
    {
        id: 9,
        name: 'EJEMPLAR 009',
        race: 'espanol',
        raceLabel: 'Gallo Español',
        image: 'images/galeria9.jpg',
        pedigree: 'Matador × Dolores',
        pedigreeShort: 'Matador - Dolores / Valentino',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Matador',
            mother: 'Dolores',
            paternalGrandfather: 'Valentino',
            paternalGrandmother: 'Rosita',
            maternalGrandfather: 'Don Juan',
            maternalGrandmother: 'Concha'
        },
        characteristics: '4 años - 5.0 kg'
    },
    {
        id: 10,
        name: 'EJEMPLAR 010',
        race: 'indio',
        raceLabel: 'Gallo Indio',
        image: 'images/galeria10.jpg',
        pedigree: 'Maharajá × Estrella',
        pedigreeShort: 'Maharajá - Estrella / Rey',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Maharajá',
            mother: 'Estrella',
            paternalGrandfather: 'Rey',
            paternalGrandmother: 'Luna',
            maternalGrandfather: 'Sol',
            maternalGrandwoman: 'Aurora'
        },
        characteristics: '2 años - 3.9 kg'
    },
    {
        id: 11,
        name: 'EJEMPLAR 011',
        race: 'americano',
        raceLabel: 'Gallo Americano',
        image: 'images/galeria11.jpg',
        pedigree: 'Duke × Luna',
        pedigreeShort: 'Duke - Luna / Prince',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Duke',
            mother: 'Luna',
            paternalGrandfather: 'King',
            paternalGrandmother: 'Queen',
            maternalGrandfather: 'Prince',
            maternalGrandmother: 'Princess'
        },
        characteristics: '3 años - 4.1 kg'
    },
    {
        id: 12,
        name: 'EJEMPLAR 012',
        race: 'espanol',
        raceLabel: 'Gallo Español',
        image: 'images/galeria12.jpg',
        pedigree: 'Español × Gitana',
        pedigreeShort: 'Español - Gitana / Andalón',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Español',
            mother: 'Gitana',
            paternalGrandfather: 'Andalón',
            paternalGrandmother: 'Morena',
            maternalGrandfather: 'Cante',
            maternalGrandmother: 'Saeta'
        },
        characteristics: '2.5 años - 4.0 kg'
    },
    {
        id: 13,
        name: 'EJEMPLAR 013',
        race: 'indio',
        raceLabel: 'Gallo Indio',
        image: 'images/galeria13.jpg',
        pedigree: 'Faraón × Cleopatra',
        pedigreeShort: 'Faraón - Cleopatra / Jaguar',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Faraón',
            mother: 'Cleopatra',
            paternalGrandfather: 'Jaguar',
            paternalGrandmother: 'Tigre',
            maternalGrandfather: 'León',
            maternalGrandmother: 'Pantera'
        },
        characteristics: '3.5 años - 4.6 kg'
    },
    {
        id: 14,
        name: 'EJEMPLAR 014',
        race: 'americano',
        raceLabel: 'Gallo Americano',
        image: 'images/galeria14.jpg',
        pedigree: 'Champion × Diosa',
        pedigreeShort: 'Champion - Diosa / Heroe',
        price: 'CONSULTAR',
        pedigreeFull: {
            father: 'Champion',
            mother: 'Diosa',
            paternalGrandfather: 'Heroe',
            paternalGrandmother: 'Valiente',
            maternalGrandfather: 'Galan',
            maternalGrandmother: 'Dama'
        },
        characteristics: '2 años - 3.7 kg'
    }
];

// Pagination
const itemsPerPage = 6;
let currentPage = 1;
let currentFilter = 'all';

// Generate Gallery
function generateGallery(filter = 'all', page = 1) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    currentFilter = filter;
    currentPage = page;

    let filteredData = filter === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.race === filter);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    grid.innerHTML = pageData.map(item => `
        <div class="gallery-item" onclick="openModal(${item.id})">
            <img src="${item.image}" alt="${item.name}" class="gallery-image">
            <div class="gallery-info">
                <div class="gallery-name">${item.name}</div>
                <div class="gallery-pedigree">${item.pedigreeShort}</div>
                <div class="gallery-price">${item.price}</div>
            </div>
        </div>
    `).join('');

    // Update pagination
    updatePagination(filteredData.length, totalPages);
}

function updatePagination(totalItems, totalPages) {
    const pagination = document.getElementById('galleryPagination');
    if (!pagination) return;

    let html = '';

    // Previous button
    html += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
        </svg>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }

    // Next button
    html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
        </svg>
    </button>`;

    pagination.innerHTML = html;
}

function changePage(page) {
    let filteredData = currentFilter === 'all' 
        ? galleryData 
        : galleryData.filter(item => item.race === currentFilter);
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        generateGallery(currentFilter, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Modal Functions
function openModal(id) {
    const item = galleryData.find(g => g.id === id);
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
    
    initAudio();
    playClickSound();
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Filter functionality
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generateGallery(btn.dataset.filter, 1);
            initAudio();
            playClickSound();
        });
    });
}

// Close modal on overlay click
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    generateGallery('all', 1);
    setupFilters();
    
    window.toggleMenu = function() {
        const navLinks = document.querySelector('.navbar-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    };
});

// Make functions global for onclick
window.changePage = changePage;

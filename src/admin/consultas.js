import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUserData } from '../lib/auth.js'
import { API } from '../lib/api.js'
import { createEmbers } from '../lib/effects.js'
import { setupSoundToggle } from '../lib/audio.js'

let consultas = []
let currentFilter = 'all'

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTemaLabel(tema) {
    const temas = {
        'venta': 'Venta de gallos',
        'criadero': 'Criadero / Reproducción',
        'asesoria': 'Asesoría',
        'compra': 'Compra',
        'otro': 'Otro'
    };
    return temas[tema] || tema || 'Sin especificar';
}

function getFilteredConsultas() {
    switch (currentFilter) {
        case 'no-leido':
            return consultas.filter(c => !c.leido);
        case 'pendiente':
            return consultas.filter(c => !c.respondida);
        default:
            return consultas;
    }
}

function renderConsultas(data) {
    const container = document.getElementById('consultasList');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay consultas</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Tema</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr ${!c.leido ? 'style="font-weight: bold;"' : ''}>
                        <td>${formatDate(c.created_at)}</td>
                        <td>${c.nombre}</td>
                        <td>${c.email}</td>
                        <td>${c.telefono || '-'}</td>
                        <td>${getTemaLabel(c.tema)}</td>
                        <td>
                            ${!c.leido ? '<span class="status-badge no-leido">Sin Leer</span>' : ''}
                            ${c.leido && !c.respondida ? '<span class="status-badge nuevo">Pendiente</span>' : ''}
                            ${c.respondida ? '<span class="status-badge leido">Respondida</span>' : ''}
                        </td>
                        <td class="actions-cell">
                            <button class="btn-secondary" data-action="view" data-id="${c.id}">Ver</button>
                            ${isAdmin() ? `<button class="btn-danger" data-action="delete" data-id="${c.id}">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function viewConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (!consulta) return;

    await API.consultas.markAsRead(id);
    consulta.leido = true;
    renderConsultas(getFilteredConsultas());

    const detalle = document.getElementById('consultaDetalle');
    detalle.innerHTML = `
        <div class="form-grid">
            <div class="form-field">
                <label>Nombre</label>
                <p>${consulta.nombre}</p>
            </div>
            <div class="form-field">
                <label>Email</label>
                <p><a href="mailto:${consulta.email}" style="color: var(--gold-primary);">${consulta.email}</a></p>
            </div>
            <div class="form-field">
                <label>Teléfono</label>
                <p>${consulta.telefono || 'No proporcionado'}</p>
            </div>
            <div class="form-field">
                <label>Fecha</label>
                <p>${formatDate(consulta.created_at)}</p>
            </div>
            <div class="form-field full-width">
                <label>Tema</label>
                <p>${getTemaLabel(consulta.tema)}</p>
            </div>
            <div class="form-field full-width">
                <label>Mensaje</label>
                <p style="white-space: pre-wrap;">${consulta.mensaje}</p>
            </div>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" id="btnMarcarRespondida" data-action="respond" data-id="${consulta.id}">
                ${consulta.respondida ? '✓ Marcada como respondida' : 'Marcar como respondida'}
            </button>
            ${isAdmin() ? `<button class="btn-danger" data-action="delete-close" data-id="${consulta.id}">Eliminar Consulta</button>` : ''}
        </div>
    `;

    document.getElementById('modalConsulta').classList.add('show');
};

async function markAsResponded(id) {
    const result = await API.consultas.markAsResponded(id);
    if (!result.error) {
        const consulta = consultas.find(c => c.id === id);
        if (consulta) consulta.respondida = true;
        renderConsultas(getFilteredConsultas());
        document.getElementById('modalConsulta').classList.remove('show');
    }
};

async function deleteConsulta(id) {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;

    const result = await API.consultas.delete(id);
    if (!result.error) {
        consultas = consultas.filter(c => c.id !== id);
        renderConsultas(getFilteredConsultas());
    } else {
        alert('Error al eliminar: ' + result.error.message);
    }
};

async function deleteConsultaAndClose(id) {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;

    const result = await API.consultas.delete(id);
    if (!result.error) {
        consultas = consultas.filter(c => c.id !== id);
        renderConsultas(getFilteredConsultas());
        document.getElementById('modalConsulta').classList.remove('show');
    } else {
        alert('Error al eliminar: ' + result.error.message);
    }
};

function closeModal() {
    document.getElementById('modalConsulta').classList.remove('show');
}

async function loadConsultas() {
    const result = await API.consultas.getAll();
    if (result.data) {
        consultas = result.data;
        renderConsultas(getFilteredConsultas());
    } else {
        document.getElementById('consultasList').innerHTML = 
            '<div class="empty-state"><p>Error al cargar consultas</p></div>';
    }
}

async function init() {
    await initAuth();

    if (!isAuthenticated()) {
        document.getElementById('notAuthorized').style.display = 'flex';
        return;
    }

    ThreeScene.init();
    createEmbers();
    setupSoundToggle();

    const userData = getCurrentUserData();
    document.getElementById('userName').textContent = userData?.nombre || 'Usuario';
    document.getElementById('userRole').textContent = userData?.rol?.toUpperCase() || '';

    if (!isAdmin()) {
        document.getElementById('navUsuarios').style.display = 'none';
    }

    document.getElementById('adminContent').style.display = 'flex';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout();
        if (success) {
            window.location.href = '/pages/login.html';
        }
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);

    document.getElementById('consultasList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === 'view') viewConsulta(id);
        if (btn.dataset.action === 'delete') deleteConsulta(id);
    });

    document.getElementById('consultaDetalle').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === 'respond') markAsResponded(id);
        if (btn.dataset.action === 'delete-close') deleteConsultaAndClose(id);
    });

    document.getElementById('modalConsulta').addEventListener('click', (e) => {
        if (e.target.id === 'modalConsulta') {
            closeModal();
        }
    });

    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderConsultas(getFilteredConsultas());
        });
    });

    await loadConsultas();
}

document.addEventListener('DOMContentLoaded', init);

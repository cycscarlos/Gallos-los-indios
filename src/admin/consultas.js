import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUserData } from '../lib/auth.js'
import { API } from '../lib/api.js'

let consultas = []
let currentFilter = 'all'

async function loadSharedJS() {
    const script = document.createElement('script')
    script.src = '/js/shared.js'
    document.head.appendChild(script)
    return new Promise((resolve) => {
        script.onload = () => resolve(window.sharedJS || {})
    })
}

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
                            <button class="btn-secondary" onclick="viewConsulta('${c.id}')">Ver</button>
                            ${isAdmin() ? `<button class="btn-danger" onclick="deleteConsulta('${c.id}')">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.viewConsulta = async function(id) {
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
            <button class="btn-secondary" id="btnMarcarRespondida" onclick="markAsResponded('${consulta.id}')">
                ${consulta.respondida ? '✓ Marcada como respondida' : 'Marcar como respondida'}
            </button>
            ${isAdmin() ? `<button class="btn-danger" onclick="deleteConsultaAndClose('${consulta.id}')">Eliminar Consulta</button>` : ''}
        </div>
    `;

    document.getElementById('modalConsulta').classList.add('show');
};

window.markAsResponded = async function(id) {
    const result = await API.consultas.markAsResponded(id);
    if (!result.error) {
        const consulta = consultas.find(c => c.id === id);
        if (consulta) consulta.respondida = true;
        renderConsultas(getFilteredConsultas());
        document.getElementById('modalConsulta').classList.remove('show');
    }
};

window.deleteConsulta = async function(id) {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;

    const result = await API.consultas.delete(id);
    if (!result.error) {
        consultas = consultas.filter(c => c.id !== id);
        renderConsultas(getFilteredConsultas());
    } else {
        alert('Error al eliminar: ' + result.error.message);
    }
};

window.deleteConsultaAndClose = async function(id) {
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

    await loadSharedJS();

    const userData = getCurrentUserData();
    document.getElementById('userName').textContent = userData?.nombre || 'Usuario';
    document.getElementById('userRole').textContent = userData?.rol?.toUpperCase() || '';

    if (!isAdmin()) {
        document.getElementById('navUsuarios').style.display = 'none';
    }

    document.getElementById('adminContent').style.display = 'block';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        const success = await logout();
        if (success) {
            window.location.href = '/pages/login.html';
        }
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);

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

import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUserData } from '../lib/auth.js'
import { API } from '../lib/api.js'

let ejemplares = []

async function loadSharedJS() {
    const script = document.createElement('script')
    script.src = '/js/shared.js'
    document.head.appendChild(script)
    return new Promise((resolve) => {
        script.onload = () => resolve(window.sharedJS || {})
    })
}

function renderEjemplares(data) {
    const container = document.getElementById('ejemplaresList');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay ejemplares registrados</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                    <th>Peso</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(e => `
                    <tr>
                        <td>${e.nombre}</td>
                        <td>${e.categoria}</td>
                        <td>${e.tipo || '-'}</td>
                        <td>${e.peso ? e.peso + ' kg' : '-'}</td>
                        <td>${e.precio || '-'}</td>
                        <td>
                            <span class="status-badge ${e.estado}">${e.estado}</span>
                        </td>
                        <td class="actions-cell">
                            <button class="btn-secondary" onclick="editEjemplar('${e.id}')">Editar</button>
                            ${isAdmin() ? `<button class="btn-danger" onclick="deleteEjemplar('${e.id}')">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.editEjemplar = function(id) {
    const ejemplar = ejemplares.find(e => e.id === id);
    if (!ejemplar) return;

    document.getElementById('modalTitle').textContent = 'Editar Ejemplar';
    document.getElementById('ejemplarId').value = ejemplar.id;
    document.getElementById('nombre').value = ejemplar.nombre;
    document.getElementById('categoria').value = ejemplar.categoria;
    document.getElementById('tipo').value = ejemplar.tipo || '';
    document.getElementById('peso').value = ejemplar.peso || '';
    document.getElementById('edad').value = ejemplar.edad || '';
    document.getElementById('estado').value = ejemplar.estado;
    document.getElementById('precio').value = ejemplar.precio || '';
    document.getElementById('destacado').value = ejemplar.destacado ? 'true' : 'false';
    document.getElementById('orden').value = ejemplar.orden || 0;
    document.getElementById('imagen_url').value = ejemplar.imagen_url || '';
    document.getElementById('pedigree_resumido').value = ejemplar.pedigree_resumido || '';
    document.getElementById('descripcion').value = ejemplar.descripcion || '';

    document.getElementById('modalEjemplar').classList.add('show');
};

window.deleteEjemplar = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este ejemplar?')) return;

    const result = await API.ejemplares.delete(id);
    if (!result.error) {
        await loadEjemplares();
    } else {
        alert('Error al eliminar: ' + result.error.message);
    }
};

function openNewModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Ejemplar';
    document.getElementById('formEjemplar').reset();
    document.getElementById('ejemplarId').value = '';
    document.getElementById('orden').value = '0';
    document.getElementById('estado').value = 'disponible';
    document.getElementById('modalEjemplar').classList.add('show');
}

function closeModal() {
    document.getElementById('modalEjemplar').classList.remove('show');
}

async function loadEjemplares() {
    const result = await API.ejemplares.getAll();
    if (result.data) {
        ejemplares = result.data;
        renderEjemplares(ejemplares);
    } else {
        document.getElementById('ejemplaresList').innerHTML = 
            '<div class="empty-state"><p>Error al cargar ejemplares</p></div>';
    }
}

async function saveEjemplar(e) {
    e.preventDefault();

    const id = document.getElementById('ejemplarId').value;
    const data = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        tipo: document.getElementById('tipo').value || null,
        peso: document.getElementById('peso').value ? parseFloat(document.getElementById('peso').value) : null,
        edad: document.getElementById('edad').value ? parseInt(document.getElementById('edad').value) : null,
        estado: document.getElementById('estado').value,
        precio: document.getElementById('precio').value || null,
        destacado: document.getElementById('destacado').value === 'true',
        orden: parseInt(document.getElementById('orden').value) || 0,
        imagen_url: document.getElementById('imagen_url').value || null,
        pedigree_resumido: document.getElementById('pedigree_resumido').value || null,
        descripcion: document.getElementById('descripcion').value || null
    };

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    let result;
    if (id) {
        result = await API.ejemplares.update(id, data);
    } else {
        result = await API.ejemplares.create(data);
    }

    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';

    if (result.error) {
        alert('Error al guardar: ' + result.error.message);
        return;
    }

    closeModal();
    await loadEjemplares();
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
        document.getElementById('btnNuevo').style.display = 'none';
    }

    document.getElementById('adminContent').style.display = 'block';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        const success = await logout();
        if (success) {
            window.location.href = '/pages/login.html';
        }
    });

    document.getElementById('btnNuevo').addEventListener('click', openNewModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelar').addEventListener('click', closeModal);
    document.getElementById('formEjemplar').addEventListener('submit', saveEjemplar);

    document.getElementById('modalEjemplar').addEventListener('click', (e) => {
        if (e.target.id === 'modalEjemplar') {
            closeModal();
        }
    });

    await loadEjemplares();
}

document.addEventListener('DOMContentLoaded', init);

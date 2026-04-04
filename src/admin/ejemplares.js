import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUserData } from '../lib/auth.js'
import { API } from '../lib/api.js'
import { createEmbers } from '../lib/effects.js'
import { setupSoundToggle } from '../lib/audio.js'

let ejemplares = []

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
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Género</th>
                    <th>Precio</th>
                    <th>Línea</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(e => `
                    <tr>
                        <td>${e.placa_id}</td>
                        <td>${e.marca}</td>
                        <td>${e.genero || '-'}</td>
                        <td>${e.precio || '-'}</td>
                        <td>${e.linea || '-'}</td>
                        <td>
                            <span class="status-badge ${e.estado}">${e.estado}</span>
                        </td>
                        <td class="actions-cell">
                            <button class="btn-secondary" data-action="edit" data-id="${e.id}">Editar</button>
                            ${isAdmin() ? `<button class="btn-danger" data-action="delete" data-id="${e.id}">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function editEjemplar(id) {
    const ejemplar = ejemplares.find(e => e.id === id);
    if (!ejemplar) return;

    document.getElementById('modalTitle').textContent = 'Editar Ejemplar';
    document.getElementById('ejemplarId').value = ejemplar.id;
    document.getElementById('placa_id').value = ejemplar.placa_id;
    document.getElementById('marca').value = ejemplar.marca;
    document.getElementById('genero').value = ejemplar.genero;
    document.getElementById('linea').value = ejemplar.linea || '';
    document.getElementById('precio').value = ejemplar.precio || '';
    document.getElementById('fecha_nacimiento').value = ejemplar.fecha_nacimiento || '';
    document.getElementById('padre_id').value = ejemplar.padre_id || '';
    document.getElementById('madre_id').value = ejemplar.madre_id || '';
    document.getElementById('abuelo_paterno_id').value = ejemplar.abuelo_paterno_id || '';
    document.getElementById('abuela_paterna_id').value = ejemplar.abuela_paterna_id || '';
    document.getElementById('abuelo_materno_id').value = ejemplar.abuelo_materno_id || '';
    document.getElementById('abuela_materna_id').value = ejemplar.abuela_materna_id || '';
    document.getElementById('estado').value = ejemplar.estado || 'disponible';
    document.getElementById('observaciones').value = ejemplar.observaciones || '';
    document.getElementById('imagen_url').value = ejemplar.imagen_url || '';
    document.getElementById('imagen_file').value = '';

    const preview = document.getElementById('imagePreview');
    if (ejemplar.imagen_url) {
        preview.innerHTML = `<img src="${ejemplar.imagen_url}" alt="Preview" class="preview-img">`;
    } else {
        preview.innerHTML = '';
    }

    document.getElementById('modalEjemplar').classList.add('show');
};

async function deleteEjemplar(id) {
    if (!confirm('¿Estás seguro de eliminar este ejemplar?')) return;

    const { data, error } = await API.ejemplares.delete(id);
    if (!error && data && data.length > 0) {
        await loadEjemplares();
    } else if (error) {
        alert('Error al eliminar: ' + (error.message || 'Error desconocido'));
    } else {
        alert('No se pudo eliminar. Posible falta de permisos en la base de datos (RLS).');
    }
};

function openNewModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Ejemplar';
    document.getElementById('formEjemplar').reset();
    document.getElementById('ejemplarId').value = '';
    document.getElementById('estado').value = 'disponible';
    document.getElementById('imagen_url').value = '';
    document.getElementById('imagen_file').value = '';
    document.getElementById('imagePreview').innerHTML = '';
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
        placa_id: document.getElementById('placa_id').value,
        marca: document.getElementById('marca').value,
        genero: document.getElementById('genero').value,
        linea: document.getElementById('linea').value || null,
        precio: document.getElementById('precio').value || null,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
        padre_id: document.getElementById('padre_id').value || null,
        madre_id: document.getElementById('madre_id').value || null,
        abuelo_paterno_id: document.getElementById('abuelo_paterno_id').value || null,
        abuela_paterna_id: document.getElementById('abuela_paterna_id').value || null,
        abuelo_materno_id: document.getElementById('abuelo_materno_id').value || null,
        abuela_materna_id: document.getElementById('abuela_materna_id').value || null,
        estado: document.getElementById('estado').value,
        observaciones: document.getElementById('observaciones').value || null,
    };

    const imagenFile = document.getElementById('imagen_file').files[0];
    let imagenUrl = document.getElementById('imagen_url').value;

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = imagenFile ? 'Subiendo imagen...' : 'Guardando...';

    if (imagenFile) {
        const tempId = id || `new_${Date.now()}`;
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${tempId}_${Date.now()}.${fileExt}`;
        const path = `imagenes/${fileName}`;

        const uploadResult = await API.storage.uploadImage('ejemplares', path, imagenFile);
        
        if (uploadResult.error) {
            alert('Error al subir imagen: ' + uploadResult.error.message);
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar';
            return;
        }

        imagenUrl = uploadResult.publicUrl;
    }

    data.imagen_url = imagenUrl || null;

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

    createEmbers();
    setupSoundToggle();

    const userData = getCurrentUserData();
    document.getElementById('userName').textContent = userData?.nombre || 'Usuario';
    document.getElementById('userRole').textContent = userData?.rol?.toUpperCase() || '';

    if (!isSoporte()) {
        document.getElementById('navUsuarios').style.display = 'none';
    }

    if (!canManageEjemplares()) {
        document.getElementById('btnNuevo').style.display = 'none';
    }

    document.getElementById('adminContent').style.display = 'flex';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout();
        if (success) {
            window.location.href = '/pages/login.html?stay=true';
        }
    });

    document.getElementById('btnNuevo').addEventListener('click', openNewModal);
    
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelar').addEventListener('click', closeModal);
    document.getElementById('formEjemplar').addEventListener('submit', saveEjemplar);

    document.getElementById('ejemplaresList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === 'edit') editEjemplar(id);
        if (btn.dataset.action === 'delete') deleteEjemplar(id);
    });

    document.getElementById('modalEjemplar').addEventListener('click', (e) => {
        if (e.target.id === 'modalEjemplar') {
            closeModal();
        }
    });

    document.getElementById('imagen_file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('imagePreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-img">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });

    await loadEjemplares();
}

document.addEventListener('DOMContentLoaded', init);

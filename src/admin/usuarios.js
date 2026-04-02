import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUser, getCurrentUserData, register } from '../lib/auth.js'
import { API } from '../lib/api.js'
import { createEmbers } from '../lib/effects.js'
import { setupSoundToggle } from '../lib/audio.js'

let usuarios = []
let currentUserId = null

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function renderUsuarios(data) {
    const container = document.getElementById('usuariosList');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay usuarios registrados</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(u => `
                    <tr ${u.id === currentUserId ? 'style="background: rgba(212, 175, 55, 0.1);"' : ''}>
                        <td>
                            ${u.nombre}
                            ${u.id === currentUserId ? '<span style="color: var(--gold-primary); font-size: 0.8em;"> (Tú)</span>' : ''}
                        </td>
                        <td>${u.email}</td>
                        <td><span class="status-badge ${u.rol}">${u.rol}</span></td>
                        <td>
                            <span style="color: ${u.activo ? '#2ecc71' : '#e74c3c'};">
                                ${u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>${formatDate(u.created_at)}</td>
                        <td class="actions-cell">
                            <button class="btn-secondary" data-action="edit" data-id="${u.id}">Editar</button>
                            ${u.id !== currentUserId ? `<button class="btn-danger" data-action="delete" data-id="${u.id}">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openNuevoUsuarioModal() {
    document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    
    document.getElementById('email').disabled = false;
    document.getElementById('passwordContainer').style.display = 'block';
    document.getElementById('password').required = true;
    
    document.getElementById('activo').value = 'true';
    document.getElementById('rol').value = 'soporte';

    document.getElementById('modalUsuario').classList.add('show');
};

function editUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
    document.getElementById('usuarioId').value = usuario.id;
    
    document.getElementById('email').value = usuario.email;
    document.getElementById('email').disabled = true; // No editamos el email
    
    document.getElementById('passwordContainer').style.display = 'none';
    document.getElementById('password').required = false;
    document.getElementById('password').value = '';

    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('rol').value = usuario.rol;
    document.getElementById('activo').value = usuario.activo ? 'true' : 'false';

    document.getElementById('modalUsuario').classList.add('show');
};

async function deleteUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    const { data, error } = await API.usuarios.delete(id);
    if (!error && data && data.length > 0) {
        usuarios = usuarios.filter(u => u.id !== id);
        renderUsuarios(usuarios);
    } else if (error) {
        alert('Error al eliminar: ' + (error.message || 'Error desconocido'));
    } else {
        alert('No se pudo eliminar. Verifica que tienes permisos de administrador y que no estás intentando eliminarte a ti mismo.');
    }
};

function closeModal() {
    document.getElementById('modalUsuario').classList.remove('show');
}

async function loadUsuarios() {
    const result = await API.usuarios.getAll();
    if (result.data) {
        usuarios = result.data;
        renderUsuarios(usuarios);
    } else {
        document.getElementById('usuariosList').innerHTML = 
            '<div class="empty-state"><p>Error al cargar usuarios</p></div>';
    }
}

async function saveUsuario(e) {
    e.preventDefault();

    const id = document.getElementById('usuarioId').value;
    const btnGuardar = document.getElementById('btnGuardar');
    
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
    if (!id) {
        // MODO CREACIÓN
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const nombre = document.getElementById('nombre').value;
        const rol = document.getElementById('rol').value;

        if (!email || !password || !nombre) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        const result = await register(email, password, nombre, rol);
        if (!result.success) {
            alert('Error al crear usuario: ' + result.error);
            return;
        }

        // Cerrar modal y recargar después de crear usuario
        closeModal();
        await loadUsuarios();

    } else {
        // MODO EDICIÓN
        const data = {
            nombre: document.getElementById('nombre').value,
            rol: document.getElementById('rol').value,
            activo: document.getElementById('activo').value === 'true'
        };

        const result = await API.usuarios.update(id, data);

        if (result.error) {
            alert('Error al guardar: ' + result.error.message);
            return;
        }

        closeModal();
        await loadUsuarios();
    }
    } catch (err) {
        console.error('Error en saveUsuario:', err);
        alert('Error inesperado: ' + (err.message || 'Intenta de nuevo'));
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

async function init() {
    await initAuth();

    if (!isAuthenticated()) {
        document.getElementById('notAuthorized').style.display = 'flex';
        return;
    }

    if (!isAdmin()) {
        document.getElementById('notAuthorized').style.display = 'flex';
        return;
    }

    createEmbers();
    setupSoundToggle();

    const user = getCurrentUser();
    const userData = getCurrentUserData();
    currentUserId = user?.id;
    
    document.getElementById('userName').textContent = userData?.nombre || 'Usuario';
    document.getElementById('userRole').textContent = userData?.rol?.toUpperCase() || '';

    document.getElementById('adminContent').style.display = 'flex';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout();
        if (success) {
            window.location.href = '/pages/login.html';
        }
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelar').addEventListener('click', closeModal);
    document.getElementById('formUsuario').addEventListener('submit', saveUsuario);

    document.getElementById('btnNuevoUsuario').addEventListener('click', openNuevoUsuarioModal);

    document.getElementById('usuariosList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === 'edit') editUsuario(id);
        if (btn.dataset.action === 'delete') deleteUsuario(id);
    });

    document.getElementById('modalUsuario').addEventListener('click', (e) => {
        if (e.target.id === 'modalUsuario') {
            closeModal();
        }
    });

    await loadUsuarios();
}

document.addEventListener('DOMContentLoaded', init);

import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUser, getCurrentUserData } from '../lib/auth.js'
import { API } from '../lib/api.js'

let usuarios = []
let currentUserId = null

async function loadSharedJS() {
    const script = document.createElement('script')
    script.src = '/js/shared.js'
    document.head.appendChild(script)
    return new Promise((resolve) => {
        script.onload = () => resolve(window.sharedJS || {})
    })
}

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
                            <button class="btn-secondary" onclick="editUsuario('${u.id}')">Editar</button>
                            ${u.id !== currentUserId ? `<button class="btn-danger" onclick="deleteUsuario('${u.id}')">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.editUsuario = function(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('email').value = usuario.email;
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('rol').value = usuario.rol;
    document.getElementById('activo').value = usuario.activo ? 'true' : 'false';

    document.getElementById('modalUsuario').classList.add('show');
};

window.deleteUsuario = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    const result = await API.usuarios.delete(id);
    if (!result.error) {
        usuarios = usuarios.filter(u => u.id !== id);
        renderUsuarios(usuarios);
    } else {
        alert('Error al eliminar: ' + result.error.message);
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
    const data = {
        nombre: document.getElementById('nombre').value,
        rol: document.getElementById('rol').value,
        activo: document.getElementById('activo').value === 'true'
    };

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    const result = await API.usuarios.update(id, data);

    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';

    if (result.error) {
        alert('Error al guardar: ' + result.error.message);
        return;
    }

    closeModal();
    await loadUsuarios();
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

    await loadSharedJS();

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

    document.getElementById('modalUsuario').addEventListener('click', (e) => {
        if (e.target.id === 'modalUsuario') {
            closeModal();
        }
    });

    await loadUsuarios();
}

document.addEventListener('DOMContentLoaded', init);

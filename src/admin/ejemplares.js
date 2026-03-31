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
        imagen_url: document.getElementById('imagen_url').value || null
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

    document.getElementById('adminContent').style.display = 'flex';

    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout();
        if (success) {
            window.location.href = '/pages/login.html';
        }
    });

    document.getElementById('btnNuevo').addEventListener('click', openNewModal);
    
    // Función de AUTO-SEED Temporal
    document.getElementById('btnSeed').addEventListener('click', async () => {
        const btn = document.getElementById('btnSeed');
        const confirmacion = confirm("¿Iniciar la carga de 14 ejemplares de prueba automáticamente?");
        if (!confirmacion) return;
        
        btn.disabled = true;
        btn.textContent = '⏳ Cargando...';
        
        let errores = 0;
        try {
            for(let i=1; i<=14; i++) {
                const data = {
                    placa_id: `MOCK-${Math.floor(Math.random()*1000)}-${i}`,
                    marca: `Gallo Test #${i}`,
                    genero: i % 2 === 0 ? 'Macho' : 'Hembra',
                    linea: 'Hatch Experimental',
                    precio: '100',
                    estado: 'disponible',
                    observaciones: 'Auto generado para pruebas visuales.',
                    imagen_url: `/images/galeria${i}.jpg`
                };
                const { error } = await API.ejemplares.create(data);
                if (error) {
                    console.error("Error DB al crear gallo:", error);
                    errores++;
                }
            }
            if (errores > 0) {
                alert(`Carga finalizada pero hubo ${errores} errores. Presiona F12 y mira la consola.`);
            } else {
                alert("¡Los 14 ejemplares fueron cargados con éxito!");
            }
        } catch (err) {
            console.error(err);
            alert("Excepción de código (mira F12 Console): " + err.message);
        }

        btn.textContent = '✔️ Operación Terminada';
        setTimeout(() => btn.style.display = 'none', 3000);
        await loadEjemplares();
    });
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

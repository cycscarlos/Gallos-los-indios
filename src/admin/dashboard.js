import { initAuth, logout, isAuthenticated, isAdmin, getCurrentUserData, getCurrentUser } from '../lib/auth.js'
import { API } from '../lib/api.js'
import { createEmbers } from '../lib/effects.js'
import { setupSoundToggle } from '../lib/audio.js'

/**
 * Formateo de fechas para tablas administrativas
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

/**
 * Renderiza la tabla de consultas con manejo de estados vacíos
 */
function renderConsultas(consultas) {
    const container = document.getElementById('consultasRecientes')
    
    if (!consultas || consultas.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay consultas recientes</p></div>'
        return
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Tema</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${consultas.slice(0, 5).map(c => `
                    <tr>
                        <td>${formatDate(c.created_at)}</td>
                        <td>${c.nombre}</td>
                        <td>${c.email}</td>
                        <td>${c.tema || '-'}</td>
                        <td>
                            <span class="status-badge ${c.leido ? 'leido' : 'no-leido'}">
                                ${c.leido ? 'Leído' : 'Sin leer'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
}

/**
 * Carga de datos del Dashboard con aislamiento de errores (Continuidad Operativa)
 */
async function loadDashboardData() {
    // Usamos catch individual en cada promesa para que si una falla, las demás sigan funcionando
    try {
        const [ejemplaresResult, consultasResult, consultasStats] = await Promise.all([
            API.ejemplares.getAll().catch(err => { console.error("Error en Ejemplares:", err); return { data: null }; }),
            API.consultas.getAll({ leido: false }).catch(err => { console.error("Error en Consultas:", err); return { data: null }; }),
            API.consultas.getStats().catch(err => { console.error("Error en Stats:", err); return { data: null }; })
        ]);

        // 1. Actualizar contadores de Ejemplares
        const statEjemplares = document.getElementById('statEjemplares')
        const statDisponibles = document.getElementById('statDisponibles')
        
        if (ejemplaresResult?.data) {
            const total = ejemplaresResult.data.length
            const disponibles = ejemplaresResult.data.filter(e => e.estado === 'disponible').length
            statEjemplares.textContent = total
            statDisponibles.textContent = disponibles
        } else {
            statEjemplares.textContent = "0";
            statDisponibles.textContent = "0";
        }

        // 2. Actualizar contadores de Consultas
        const statConsultasPendientes = document.getElementById('statConsultasPendientes')
        const statNoLeidas = document.getElementById('statNoLeidas')

        if (consultasStats?.data) {
            statConsultasPendientes.textContent = consultasStats.data.pendientes || 0
            statNoLeidas.textContent = consultasStats.data.noLeidos || 0
        } else {
            statConsultasPendientes.textContent = "0";
            statNoLeidas.textContent = "0";
        }

        // 3. Renderizar tabla de consultas recientes
        renderConsultas(consultasResult?.data || []);

    } catch (criticalError) {
        console.error("Fallo general en la carga de datos del Dashboard:", criticalError);
    }
}

/**
 * Inicialización principal del Dashboard
 */
async function init() {
    // 1. Verificar Autenticación
    await initAuth()

    const user = getCurrentUser()
    if (!user) {
        document.getElementById('notAuthorized').style.display = 'flex'
        return
    }

    // 2. Cargar lógica visual compartida
    createEmbers();
    setupSoundToggle();

    // 3. Gestión de Identidad Resiliente
    // Intentamos obtener datos de la tabla, si falla, usamos los metadatos del JWT
    const userData = getCurrentUserData()
    const nombreUsuario = userData?.nombre || user.user_metadata?.nombre || 'Administrador'
    const rolUsuario = userData?.rol || user.user_metadata?.rol || 'admin'

    document.getElementById('userName').textContent = nombreUsuario
    document.getElementById('userRole').textContent = rolUsuario.toUpperCase()

    // 4. Control de acceso visual
    if (rolUsuario !== 'admin') {
        const navUsuarios = document.getElementById('navUsuarios');
        if (navUsuarios) navUsuarios.style.display = 'none';
    }

    // Mostrar el contenedor principal
    document.getElementById('adminContent').style.display = 'flex'

    // 5. Listener para Cierre de Sesión
    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout()
        if (success) {
            window.location.href = '/pages/login.html'
        }
    })

    // 6. Carga final de datos operativos
    await loadDashboardData()
}

// Ejecución al cargar el DOM
document.addEventListener('DOMContentLoaded', init)
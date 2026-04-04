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
        const [ejemplaresResult, consultasResult, consultasStats, usuariosResult] = await Promise.all([
            API.ejemplares.getAll().catch(err => { console.error("Error en Ejemplares:", err); return { data: null }; }),
            API.consultas.getAll({ leido: false }).catch(err => { console.error("Error en Consultas:", err); return { data: null }; }),
            API.consultas.getStats().catch(err => { console.error("Error en Stats:", err); return { data: null }; }),
            API.usuarios.getAll().catch(err => { console.error("Error en Usuarios:", err); return { data: null }; })
        ]);

        // 1. Actualizar contadores de Ejemplares
        const statEjemplares = document.getElementById('statEjemplares')
        const statDisponibles = document.getElementById('statDisponibles')
        
        if (ejemplaresResult?.data) {
            const total = ejemplaresResult.data.length
            const disponibles = ejemplaresResult.data.filter(e => e.estado === 'disponible').length
            if (statEjemplares) statEjemplares.textContent = total
            if (statDisponibles) statDisponibles.textContent = disponibles
        }

        // 2. Actualizar contadores de Consultas
        const statConsultasPendientes = document.getElementById('statConsultasPendientes')
        const statNoLeidas = document.getElementById('statNoLeidas')

        if (consultasStats?.data) {
            if (statConsultasPendientes) statConsultasPendientes.textContent = consultasStats.data.pendientes || 0
            if (statNoLeidas) statNoLeidas.textContent = consultasStats.data.noLeidos || 0
        }

        // 3. Actualizar contador de Usuarios
        const statUsuarios = document.getElementById('statUsuarios')
        if (statUsuarios && usuariosResult?.data) {
            statUsuarios.textContent = usuariosResult.data.length
        } else if (statUsuarios) {
            statUsuarios.textContent = "0"
        }

        // 4. Renderizar tabla de consultas recientes
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
    const userData = getCurrentUserData()
    const nombreUsuario = userData?.nombre || user.user_metadata?.nombre || 'Administrador'
    const rolRaw = userData?.rol || user.user_metadata?.rol || 'admin'
    const rolUsuario = rolRaw.toLowerCase().trim()

    console.log(`[Dashboard] Usuario: ${nombreUsuario}, Rol detectado: ${rolUsuario}`);

    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    if (userNameEl) userNameEl.textContent = nombreUsuario
    if (userRoleEl) userRoleEl.textContent = rolUsuario.toUpperCase()

    // 4. Control de acceso visual
    // Mostrar link de usuarios si es admin o soporte (consistencia)
    const navUsuarios = document.getElementById('navUsuarios');
    const cardUsuarios = document.getElementById('cardUsuarios');
    
    const hasAccess = (rolUsuario === 'admin' || rolUsuario === 'soporte');
    
    if (navUsuarios) navUsuarios.style.display = hasAccess ? 'flex' : 'none';
    if (cardUsuarios) cardUsuarios.style.display = hasAccess ? 'flex' : 'none';
    
    console.log(`[Dashboard] Acceso a Usuarios: ${hasAccess ? 'PERMITIDO' : 'DENEGADO'}`);

    // Mostrar el contenedor principal
    document.getElementById('adminContent').style.display = 'flex'

    // 5. Listener para Cierre de Sesión
    document.getElementById('btnLogout').addEventListener('click', async () => {
        console.log('Cerrando sesión...');
        const { success } = await logout()
        if (success) {
            window.location.href = '/pages/login.html?stay=true'
        }
    })

    // 6. Carga final de datos operativos
    await loadDashboardData()
}

// Ejecución al cargar el DOM
document.addEventListener('DOMContentLoaded', init)
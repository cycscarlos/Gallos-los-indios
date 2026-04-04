import { supabase } from './supabase.js';

let currentUser = null;
let currentUserData = null;

export async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
        currentUser = session.user;
        await loadUserData();
        onAuthStateChange(true); 
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            currentUser = session.user;
            await loadUserData();
            onAuthStateChange(true);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentUserData = null;
            onAuthStateChange(false);
        }
    });
}

async function loadUserData() {
    if (!currentUser) return;
    
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    
    if (!error && data) {
        currentUserData = data;
    } else {
        console.warn('[Auth] No se encontró usuario en tabla, usando metadata del JWT:', error?.message);
        currentUserData = {
            id: currentUser.id,
            email: currentUser.email,
            nombre: currentUser.user_metadata?.nombre || currentUser.email,
            rol: currentUser.user_metadata?.rol || 'usuario',
            activo: true
        };
    }
}

function onAuthStateChange(isLoggedIn) {
    const adminLinks = document.querySelectorAll('[data-admin-only]');
    adminLinks.forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });

    if (window.updateAuthUI) {
        window.updateAuthUI(isLoggedIn, currentUserData);
    }
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function register(email, password, nombre, rol = 'usuario') {
    try {
        // Guardar sesión actual del admin antes de signUp
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const currentAccessToken = currentSession?.access_token;
        const currentRefreshToken = currentSession?.refresh_token;

        // Promise con timeout para signUp
        const signUpPromise = supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre: nombre
                }
            }
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout al crear usuario')), 10000)
        );

        const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

        // Restaurar sesión del admin inmediatamente
        if (currentAccessToken && currentRefreshToken) {
            const setSessionPromise = supabase.auth.setSession({
                access_token: currentAccessToken,
                refresh_token: currentRefreshToken
            });
            
            const setSessionTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout al restaurar sesión')), 5000)
            );

            await Promise.race([setSessionPromise, setSessionTimeout]);
        }

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, user: data?.user };
    } catch (err) {
        console.error('Error en register:', err);
        return { success: false, error: err.message || 'Error al crear usuario' };
    }
}

export function getCurrentUser() {
    return currentUser;
}

export function getCurrentUserData() {
    return currentUserData;
}

export function isAuthenticated() {
    return currentUser !== null;
}

export function isAdmin() {
    return currentUserData?.rol === 'admin';
}

export function isSoporte() {
    return currentUserData?.rol === 'soporte' || currentUserData?.rol === 'admin';
}

export function canManageEjemplares() {
    return isSoporte();
}

export function canManageUsuarios() {
    return isAdmin();
}

export function canViewUsuarios() {
    return isSoporte();
}

export function canManageConsultas() {
    return isSoporte();
}

export function requireAuth(redirectTo = '/pages/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

export function requireRole(role, redirectTo = '/pages/login.html') {
    if (!requireAuth(redirectTo)) return false;
    
    if (role === 'admin' && !isAdmin()) {
        window.location.href = '/pages/admin/dashboard.html';
        return false;
    }
    
    if (role === 'soporte' && !isSoporte()) {
        window.location.href = '/pages/admin/dashboard.html';
        return false;
    }
    
    return true;
}

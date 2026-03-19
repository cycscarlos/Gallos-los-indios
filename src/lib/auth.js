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

export async function register(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre: nombre
            }
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
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

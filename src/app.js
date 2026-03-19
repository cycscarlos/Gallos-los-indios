import { initAuth, logout, isAuthenticated, getCurrentUserData } from './lib/auth.js';

export async function initApp() {
    await initAuth();
    
    if (isAuthenticated()) {
        const userData = getCurrentUserData();
        console.log('Usuario autenticado:', userData?.email);
        return userData;
    }
    
    return null;
}

export { logout, isAuthenticated, getCurrentUserData };

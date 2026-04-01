import { initAuth, login, isAuthenticated } from '../lib/auth.js'
import { createEmbers } from '../lib/effects.js'
import { setupSoundToggle } from '../lib/audio.js'

async function init() {
    if (isAuthenticated()) {
        window.location.href = '/pages/admin/dashboard.html'
        return
    }

    createEmbers()
    setupSoundToggle()

    const loginForm = document.getElementById('loginForm')
    const formError = document.getElementById('formError')
    const btnLogin = document.getElementById('btnLogin')
    const btnText = btnLogin.querySelector('.btn-text')
    const btnLoader = btnLogin.querySelector('.btn-loader')

    // Clean form unconditionally to prevent credential leaking
    if (loginForm) {
        loginForm.reset();
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    }

    await initAuth()

    if (isAuthenticated()) {
        window.location.href = '/pages/admin/dashboard.html'
        return
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('email').value.trim()
        const password = document.getElementById('password').value

        formError.classList.remove('show')
        formError.textContent = ''
        btnLogin.disabled = true
        btnText.style.display = 'none'
        btnLoader.style.display = 'inline-block'

        const result = await login(email, password)

        btnLogin.disabled = false
        btnText.style.display = 'inline'
        btnLoader.style.display = 'none'

        if (!result.success) {
            formError.textContent = result.error || 'Error al iniciar sesión'
            formError.classList.add('show')
            return
        }

        window.location.href = '/pages/admin/dashboard.html'
    })
}

document.addEventListener('DOMContentLoaded', init)

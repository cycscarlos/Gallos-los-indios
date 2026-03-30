import { initAuth, login, isAuthenticated } from '../lib/auth.js'

let sharedJS

async function loadSharedJS() {
    if (sharedJS) return sharedJS
    
    const script = document.createElement('script')
    script.src = '/js/shared.js'
    document.head.appendChild(script)
    
    return new Promise((resolve) => {
        script.onload = () => resolve(window.sharedJS || {})
    })
}

async function init() {
    if (isAuthenticated()) {
        window.location.href = '/pages/admin/dashboard.html'
        return
    }

    sharedJS = await loadSharedJS()

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

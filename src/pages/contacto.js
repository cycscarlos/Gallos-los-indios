import { API } from '../lib/api.js'

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
    sharedJS = await loadSharedJS()

    const contactForm = document.getElementById('contactForm')
    const formSuccess = document.getElementById('formSuccess')

    if (!contactForm) return

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const formData = new FormData(contactForm)
        const nombre = formData.get('nombre')?.trim() || contactForm.querySelector('input[placeholder="Tu nombre"]')?.value?.trim()
        const telefono = formData.get('telefono')?.trim() || contactForm.querySelector('input[placeholder="Tu teléfono"]')?.value?.trim()
        const email = formData.get('email')?.trim() || contactForm.querySelector('input[type="email"]')?.value?.trim()
        const temaSelect = contactForm.querySelector('select')
        const tema = temaSelect?.value || ''
        const mensaje = formData.get('mensaje')?.trim() || contactForm.querySelector('textarea')?.value?.trim()

        if (!nombre || !email || !mensaje) {
            alert('Por favor completa todos los campos requeridos')
            return
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]')
        const originalText = submitBtn.textContent
        submitBtn.disabled = true
        submitBtn.textContent = 'ENVIANDO...'

        const consulta = {
            nombre,
            email,
            telefono: telefono || '',
            mensaje,
            tema: tema || 'otro'
        }

        const result = await API.consultas.create(consulta)

        submitBtn.disabled = false
        submitBtn.textContent = originalText

        if (result.error) {
            alert('Error al enviar el mensaje. Por favor intenta de nuevo.')
            console.error('Error:', result.error)
            return
        }

        contactForm.style.display = 'none'
        formSuccess.style.display = 'block'

        setTimeout(() => {
            window.location.href = '/pages/fin.html'
        }, 3000)
    })
}

document.addEventListener('DOMContentLoaded', init)

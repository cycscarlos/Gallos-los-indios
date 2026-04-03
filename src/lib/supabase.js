import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Variables de entorno no configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Envuelve una promesa con timeout y manejo centralizado de errores.
 * Detecta 401/JWT expirado y redirige a login automáticamente.
 */
export async function withTimeout(promise, ms = 15000) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), ms)
    )

    try {
        const result = await Promise.race([promise, timeout])

        if (result?.error) {
            handleError(result.error)
        }

        return result
    } catch (err) {
        if (err.message === 'timeout') {
            console.error('[API] Timeout después de', ms, 'ms')
            return { data: null, error: { message: 'La solicitud tardó demasiado. Verifica tu conexión.' } }
        }
        console.error('[API] Excepción:', err.message)
        return { data: null, error: err }
    }
}

function handleError(error) {
    if (!error) return

    const status = error.status || error.code

    if (status === 401 || status === 'PGRST301' || error.message?.includes('JWT')) {
        console.warn('[Auth] Sesión expirada, redirigiendo a login...')
        supabase.auth.signOut()
        const isLogin = window.location.pathname.includes('login.html')
        if (!isLogin) {
            window.location.href = '/pages/login.html'
        }
    }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { headers: corsHeaders, status: 401 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verificar el JWT del usuario que hace la petición
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: currentUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { headers: corsHeaders, status: 401 }
      )
    }

    // Obtener el rol del usuario actual desde la tabla usuarios
    const { data: currentUserData } = await supabaseAdmin
      .from('usuarios')
      .select('rol')
      .eq('id', currentUser.id)
      .single()

    const currentUserRol = currentUserData?.rol || 'usuario'

    const { email, password, nombre, rol: requestedRol } = await req.json()

    if (!email || !password || !nombre) {
      return new Response(
        JSON.stringify({ error: 'Email, password y nombre son requeridos' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Si el usuario actual no es admin, no puede crear usuarios con rol admin
    const finalRol = requestedRol || 'usuario'
    if (finalRol === 'admin' && currentUserRol !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para crear usuarios con rol admin' }),
        { headers: corsHeaders, status: 403 }
      )
    }

    // Primero verificar si el email ya existe en la tabla usuarios
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: true, user: existingUser, existing: true }),
        { headers: corsHeaders, status: 200 }
      )
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const userId = authData.user.id

    // Verificar si el ID ya existe en la tabla usuarios antes de insertar
    const { data: userById } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    if (userById) {
      return new Response(
        JSON.stringify({ success: true, user: userById, existing: true }),
        { headers: corsHeaders, status: 200 }
      )
    }

    // Insertar en la tabla usuarios
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: userId,
        email,
        nombre,
        rol: finalRol,
        activo: true
      })

    if (dbError) {
      console.error('Error inserting usuario record:', dbError)
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { headers: corsHeaders, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { headers: corsHeaders, status: 200 }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    )
  }
})

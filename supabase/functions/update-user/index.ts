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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { id, nombre, rol, activo } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario es requerido' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (nombre !== undefined) updates.nombre = nombre
    if (rol !== undefined) updates.rol = rol
    if (activo !== undefined) updates.activo = activo

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay campos para actualizar' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating usuario:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, user: data }),
      { headers: corsHeaders, status: 200 }
    )
  } catch (error) {
    console.error('Error in update-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    )
  }
})

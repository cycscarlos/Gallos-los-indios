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
    const { id } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario es requerido' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { headers: corsHeaders, status: 401 }
      )
    }

    const currentUser = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!currentUser.data.user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { headers: corsHeaders, status: 401 }
      )
    }

    if (currentUser.data.user.id === id) {
      return new Response(
        JSON.stringify({ error: 'No puedes eliminarte a ti mismo' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Error deleting usuario record:', dbError)
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { headers: corsHeaders, status: 400 }
      )
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders, status: 200 }
    )
  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    )
  }
})

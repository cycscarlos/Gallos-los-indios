import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Webhook payload received:', payload)

    // El payload de un webhook de Supabase tiene la estructura:
    // { type: 'INSERT', table: 'consultas', record: { ... }, ... }
    const { record } = payload

    if (!record) {
      throw new Error('No record found in payload')
    }

    const { nombre, email, mensaje, telefono } = record

    const fechaFormateada = new Date().toLocaleString('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Caracas'
    })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Gallos Los Indios <onboarding@resend.dev>',
        to: ['luiscolmenaresa.indio@gmail.com'],
        subject: `Nueva Consulta de ${nombre}`,
        html: `
          <h1>Nueva Consulta Recibida</h1>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <hr />
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
        `,
      }),
    })

    const data = await res.json()
    console.log('Resend response:', data)

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

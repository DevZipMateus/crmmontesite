
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { domain, recordId, method, body, apiToken } = await req.json()

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: 'API Token é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let url = `https://api.hostinger.com/v1/domains/${domain}/dns`
    if (recordId) {
      url += `/${recordId}`
    }

    const requestOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body)
    }

    console.log(`Making request to Hostinger API: ${method} ${url}`)

    const response = await fetch(url, requestOptions)
    const data = await response.json()

    console.log(`Hostinger API response:`, { status: response.status, data })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Erro da API Hostinger: ${response.status} - ${response.statusText}`,
          details: data
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in hostinger-dns-proxy:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

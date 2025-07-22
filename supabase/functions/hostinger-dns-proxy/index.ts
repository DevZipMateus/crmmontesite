
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
    const { domain, method, body, apiToken } = await req.json()

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: 'Token API é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the correct Hostinger API base URL
    let url = `https://developers.hostinger.com/api/dns/v1/zones/${domain}`
    
    // Add specific endpoints for different operations
    if (method === 'POST' && body?.validate) {
      url += '/validate'
    } else if (method === 'POST' && body?.reset) {
      url += '/reset'
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
    console.log('Request headers:', requestOptions.headers)
    if (requestOptions.body) {
      console.log('Request body:', requestOptions.body)
    }

    const response = await fetch(url, requestOptions)
    
    console.log(`Hostinger API response status: ${response.status}`)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      const htmlContent = await response.text()
      console.error('Received HTML response instead of JSON:', htmlContent.substring(0, 500))
      
      return new Response(
        JSON.stringify({ 
          error: `API retornou HTML em vez de JSON. Status: ${response.status}`,
          details: `Content-Type: ${contentType}. Verifique se o token e domínio estão corretos.`
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      const textContent = await response.text()
      console.error('Failed to parse JSON response:', textContent)
      
      return new Response(
        JSON.stringify({ 
          error: `Resposta da API não é JSON válido`,
          details: `Status: ${response.status}, Content: ${textContent.substring(0, 200)}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Hostinger API response data:`, data)

    if (!response.ok) {
      // Handle specific Hostinger API errors
      let errorMessage = `Erro da API Hostinger: ${response.status} - ${response.statusText}`
      
      if (data.message) {
        if (data.message.includes('[DNS:4002]')) {
          errorMessage = 'O domínio não pertence à sua conta Hostinger ou não existe'
        } else if (data.message.includes('authentication') || data.message.includes('token')) {
          errorMessage = 'Token API inválido ou expirado'
        } else if (data.message.includes('rate limit')) {
          errorMessage = 'Limite de requisições atingido. Tente novamente em alguns minutos'
        } else {
          errorMessage = `Erro da API: ${data.message}`
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
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

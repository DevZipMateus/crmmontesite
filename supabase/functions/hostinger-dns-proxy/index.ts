
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
    const { domain, method, body, apiToken, validateTokenOnly, listDomains } = await req.json()

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: 'Token API é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Special endpoint for token validation only
    if (validateTokenOnly) {
      try {
        // Test token by making a simple request to list domains endpoint
        const testResponse = await fetch('https://api.hostinger.com/v3/dns/zones', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log(`Token validation response status: ${testResponse.status}`)
        
        if (testResponse.status === 401) {
          return new Response(
            JSON.stringify({ 
              error: 'Token API inválido ou expirado',
              details: 'O token fornecido não tem autorização válida'
            }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (testResponse.status === 403) {
          return new Response(
            JSON.stringify({ 
              error: 'Token sem permissões adequadas',
              details: 'O token não tem permissões para acessar a API DNS'
            }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (testResponse.ok) {
          return new Response(
            JSON.stringify({ valid: true, message: 'Token válido e autorizado' }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            error: 'Erro inesperado na validação do token',
            details: `Status: ${testResponse.status}`
          }),
          { 
            status: testResponse.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } catch (error) {
        console.error('Token validation error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro de conectividade ao validar token',
            details: error.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // List all domains available
    if (listDomains) {
      try {
        const response = await fetch('https://api.hostinger.com/v3/dns/zones', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log(`List domains response status: ${response.status}`)
        
        const data = await response.json()
        console.log('List domains response:', data)

        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              error: `Erro ao listar domínios: ${response.status}`,
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
        console.error('List domains error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao listar domínios',
            details: error.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Regular domain operations
    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domínio é obrigatório para operações DNS' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the correct Hostinger API base URL - updated to v3
    let url = `https://api.hostinger.com/v3/dns/zones/${domain}/records`
    
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
        if (data.message.includes('not found') || data.message.includes('does not exist')) {
          errorMessage = 'O domínio não foi encontrado na sua conta Hostinger'
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

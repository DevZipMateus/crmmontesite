
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const apiBaseUrl = 'https://developers.hostinger.com';

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

    // Validate token by making a request to the Hostinger API
    if (validateTokenOnly) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/dns/v1/zones`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          return new Response(
            JSON.stringify({ valid: true, message: 'Token validado com sucesso' }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          const status = response.status;
          let message = 'Token inválido ou sem permissões adequadas';
          
          if (status === 401) {
            message = 'Token inválido ou expirado';
          } else if (status === 403) {
            message = 'Token sem permissões para acessar a API de DNS';
          } else if (status === 429) {
            message = 'Limite de requisições excedido';
          }
          
          return new Response(
            JSON.stringify({ valid: false, message }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      } catch (error) {
        console.error('Error validating token:', error);
        return new Response(
          JSON.stringify({ 
            valid: false, 
            message: 'Erro ao conectar com a API da Hostinger' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // List domains
    if (listDomains) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/domains/v1/portfolio`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify(data),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          return new Response(
            JSON.stringify({ 
              error: 'Não foi possível listar os domínios', 
              details: `Status: ${response.status}` 
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      } catch (error) {
        console.error('Error listing domains:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao conectar com a API da Hostinger', 
            details: error.message 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // For DNS zone operations
    if (domain) {
      const url = `${apiBaseUrl}/api/dns/v1/zones/${domain}`;
      
      try {
        const response = await fetch(url, {
          method: method || 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          ...(body && { body: JSON.stringify(body) })
        });

        const responseData = await response.json();
        
        return new Response(
          JSON.stringify(responseData),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        console.error(`Error in DNS operation for domain ${domain}:`, error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao executar operação DNS', 
            details: error.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Requisição inválida' }),
      { 
        status: 400, 
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


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

    // Return informative message about API availability
    return new Response(
      JSON.stringify({
        error: 'API de DNS da Hostinger não disponível',
        details: 'Nossa investigação indica que a API de DNS da Hostinger não está disponível publicamente. Recomendamos utilizar o painel de controle da Hostinger (hPanel) para gerenciar seus registros DNS manualmente, ou considerar a migração para um provedor DNS com API pública como Cloudflare ou AWS Route 53.'
      }),
      { 
        status: 503, 
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

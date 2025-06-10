
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando processamento de webhooks pendentes...')

    // Buscar webhooks pendentes
    const { data: pendingWebhooks, error: fetchError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_type', 'sent')
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      console.error('Error fetching pending webhooks:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar webhooks pendentes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Encontrados ${pendingWebhooks?.length || 0} webhooks pendentes`)

    const results = []

    for (const webhook of pendingWebhooks || []) {
      console.log(`Processando webhook ${webhook.id} para projeto ${webhook.project_id}`)
      
      // Buscar dados do projeto
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', webhook.project_id)
        .single()

      if (projectError || !project) {
        console.log(`Projeto não encontrado para webhook ${webhook.id}`)
        
        await supabase
          .from('webhook_logs')
          .update({ 
            status: 'failed', 
            error_message: 'Projeto não encontrado',
            updated_at: new Date().toISOString()
          })
          .eq('id', webhook.id)
        
        continue
      }

      // Buscar dados do parceiro usando o partner_hash do projeto
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('webhook_url, auth_token')
        .eq('hash', project.partner_hash)
        .single()

      if (partnerError || !partner?.webhook_url) {
        console.log(`Parceiro não encontrado ou sem URL de webhook para hash ${project.partner_hash}`)
        
        await supabase
          .from('webhook_logs')
          .update({ 
            status: 'failed', 
            error_message: 'URL do webhook não configurada',
            updated_at: new Date().toISOString()
          })
          .eq('id', webhook.id)
        
        continue
      }

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        // Adicionar autenticação se disponível
        if (partner.auth_token) {
          headers['Authorization'] = `Bearer ${partner.auth_token}`
        }

        console.log(`Enviando webhook para ${partner.webhook_url}`)
        
        const response = await fetch(partner.webhook_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhook.payload)
        })

        const responseText = await response.text()
        console.log(`Resposta do webhook: ${response.status} - ${responseText}`)
        
        if (response.ok) {
          // Sucesso
          await supabase
            .from('webhook_logs')
            .update({ 
              status: 'success',
              response: responseText,
              updated_at: new Date().toISOString()
            })
            .eq('id', webhook.id)
          
          results.push({ 
            webhook_id: webhook.id, 
            status: 'success',
            project_id: project.id 
          })
        } else {
          // Falha HTTP
          await supabase
            .from('webhook_logs')
            .update({ 
              status: 'failed',
              response: responseText,
              error_message: `HTTP ${response.status}: ${response.statusText}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', webhook.id)
          
          results.push({ 
            webhook_id: webhook.id, 
            status: 'failed',
            error: `HTTP ${response.status}`,
            project_id: project.id
          })
        }

      } catch (error) {
        console.error(`Error sending webhook ${webhook.id}:`, error)
        
        // Erro de rede/conexão
        await supabase
          .from('webhook_logs')
          .update({ 
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', webhook.id)
        
        results.push({ 
          webhook_id: webhook.id, 
          status: 'failed',
          error: error.message,
          project_id: project.id
        })
      }
    }

    console.log(`Processamento concluído. Resultados:`, results)

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-status-webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

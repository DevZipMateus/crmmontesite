
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

    // Buscar webhooks pendentes
    const { data: pendingWebhooks, error: fetchError } = await supabase
      .from('webhook_logs')
      .select(`
        *,
        projects (
          *,
          partners!projects_partner_hash_fkey (webhook_url, auth_token)
        )
      `)
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

    const results = []

    for (const webhook of pendingWebhooks || []) {
      const project = webhook.projects
      const partner = project?.partners?.[0]

      if (!partner?.webhook_url) {
        console.log(`No webhook URL for project ${project?.id}`)
        
        // Marcar como falha
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

        console.log(`Sending webhook to ${partner.webhook_url}`)
        
        const response = await fetch(partner.webhook_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhook.payload)
        })

        const responseText = await response.text()
        
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
            project_id: project?.id 
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
            project_id: project?.id
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
          project_id: project?.id
        })
      }
    }

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

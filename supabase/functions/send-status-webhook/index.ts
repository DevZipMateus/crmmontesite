
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EGESTOR_CONFIG = {
  webhook_url: "https://v4.egestor.com.br/parceiros2/webhook_receiver.php",
  auth_token: "whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12",
  name: "eGestor - Painel Parceiros"
};

// Função para identificar se um hash pertence ao eGestor
function isEGestorHash(hash: string): boolean {
  if (!hash) return false;
  
  // Hash padrão do eGestor
  if (hash === 'egestor_painel_parceiros') return true;
  
  // Padrão de hashes individuais do eGestor (32 caracteres hexadecimais)
  const egestorHashPattern = /^[a-f0-9]{32}$/i;
  return egestorHashPattern.test(hash);
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

      // Verificar se é projeto do eGestor ou buscar dados do parceiro
      let webhookUrl: string | null = null;
      let authToken: string | null = null;
      let partnerName: string = 'Parceiro';

      // Primeiro verificar se é um hash do eGestor
      if (isEGestorHash(project.partner_hash)) {
        console.log(`Hash ${project.partner_hash} identificado como eGestor`);
        webhookUrl = EGESTOR_CONFIG.webhook_url;
        authToken = EGESTOR_CONFIG.auth_token;
        partnerName = EGESTOR_CONFIG.name;

        // Atualizar o projeto para facilitar futuras identificações
        await supabase
          .from('projects')
          .update({ 
            partner_webhook_url: EGESTOR_CONFIG.webhook_url,
            project_source: 'parceiro'
          })
          .eq('id', project.id);

      } else if (project.partner_hash === 'egestor_painel_parceiros') {
        console.log('Projeto do eGestor (hash padrão) detectado');
        webhookUrl = EGESTOR_CONFIG.webhook_url;
        authToken = EGESTOR_CONFIG.auth_token;
        partnerName = EGESTOR_CONFIG.name;
      } else {
        // Buscar dados do parceiro usando o partner_hash do projeto
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('webhook_url, auth_token, name')
          .eq('hash', project.partner_hash)
          .single()

        if (partnerError || !partner?.webhook_url) {
          console.log(`Parceiro não encontrado ou sem URL de webhook para hash ${project.partner_hash}`)
          
          await supabase
            .from('webhook_logs')
            .update({ 
              status: 'failed', 
              error_message: 'URL do webhook não configurada - hash não reconhecido',
              updated_at: new Date().toISOString()
            })
            .eq('id', webhook.id)
          
          continue
        }

        webhookUrl = partner.webhook_url;
        authToken = partner.auth_token;
        partnerName = partner.name || 'Parceiro';
      }

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'MonteSite-CRM/1.0'
        }

        // Adicionar autenticação se disponível
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        console.log(`Enviando webhook para ${webhookUrl} (${partnerName})`)
        console.log('Payload:', JSON.stringify(webhook.payload, null, 2))
        
        const response = await fetch(webhookUrl, {
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
            project_id: project.id,
            partner_hash: project.partner_hash,
            partner_name: partnerName
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
            project_id: project.id,
            partner_hash: project.partner_hash,
            partner_name: partnerName
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
          project_id: project.id,
          partner_hash: project.partner_hash,
          partner_name: partnerName
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

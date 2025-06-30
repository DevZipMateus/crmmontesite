
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EGESTOR_CONFIG = {
  webhook_url: "https://v4.egestor.com.br/parceiros2/open_chat.php",
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

    console.log('=== SEND CHAT WEBHOOK ===')
    console.log('Enviando webhook para abrir chat/ticket...')

    // Parse dos dados recebidos
    const { projectId } = await req.json()

    console.log('Project ID recebido:', projectId)

    if (!projectId) {
      console.error('❌ Project ID não fornecido')
      return new Response(
        JSON.stringify({ error: 'Project ID é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar dados do projeto
    console.log(`🔍 Buscando projeto com ID: ${projectId}`)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('❌ Projeto não encontrado:', projectError)
      return new Response(
        JSON.stringify({ error: 'Projeto não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Projeto encontrado: ${project.client_name}`)
    console.log('Partner hash:', project.partner_hash)

    // Verificar se é projeto de parceiro
    if (!project.partner_hash) {
      console.error('❌ Projeto não é de parceiro')
      return new Response(
        JSON.stringify({ error: 'Projeto não é de parceiro' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determinar URL e token do webhook
    let webhookUrl: string | null = null;
    let authToken: string | null = null;
    let partnerName: string = 'Parceiro';

    // Primeiro verificar se é um hash do eGestor
    if (isEGestorHash(project.partner_hash)) {
      console.log(`Hash ${project.partner_hash} identificado como eGestor`);
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
        return new Response(
          JSON.stringify({ error: 'URL do webhook não configurada - hash não reconhecido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      webhookUrl = partner.webhook_url;
      authToken = partner.auth_token;
      partnerName = partner.name || 'Parceiro';
    }

    // Preparar payload específico para eGestor
    let webhookPayload: any;
    
    if (isEGestorHash(project.partner_hash)) {
      // Payload específico para eGestor - formato esperado pela API open_chat.php
      webhookPayload = {
        acao: 'abrir_chat',
        cliente: {
          nome: project.client_name,
          telefone: project.telefone || '',
          email: project.email_complementar || ''
        },
        projeto: {
          id: project.id,
          hash: project.partner_hash,
          status: project.status || 'Em andamento'
        },
        solicitacao: {
          tipo: 'suporte',
          assunto: `Solicitação de suporte - ${project.client_name}`,
          mensagem: `Cliente ${project.client_name} solicita abertura de chat/ticket de suporte.`,
          data: new Date().toISOString()
        }
      }
    } else {
      // Payload genérico para outros parceiros
      webhookPayload = {
        type: 'open_chat',
        nome: project.client_name,
        telefone: project.telefone || 'Não informado',
        email: project.email_complementar || 'Não informado',
        hash: project.partner_hash,
        project_id: project.id,
        data_solicitacao: new Date().toISOString()
      }
    }

    console.log('Payload do webhook:', JSON.stringify(webhookPayload, null, 2))

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'MonteSite-CRM/1.0'
      }

      // 🔑 ADICIONAR TOKEN DE AUTENTICAÇÃO
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log(`🔑 Adicionando token de autenticação: Bearer ${authToken.substring(0, 20)}...`);
      } else {
        console.warn('⚠️ Nenhum token de autenticação encontrado');
      }

      console.log(`📤 Enviando webhook para ${webhookUrl} (${partnerName})`)
      console.log('Headers:', JSON.stringify(headers, null, 2))
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload)
      })

      const responseText = await response.text()
      console.log(`Resposta do webhook: ${response.status} - ${responseText}`)
      
      // Registrar o log do webhook
      await supabase
        .from('webhook_logs')
        .insert({
          project_id: project.id,
          webhook_type: 'sent',
          payload: webhookPayload,
          status: response.ok ? 'success' : 'failed',
          response: responseText,
          error_message: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
        })
      
      if (response.ok) {
        console.log('✅ Webhook enviado com sucesso')
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Webhook de abertura de chat enviado com sucesso',
            partner_name: partnerName
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        console.error('❌ Falha ao enviar webhook:', response.status, responseText)
        return new Response(
          JSON.stringify({ 
            error: 'Falha ao enviar webhook',
            details: `HTTP ${response.status}: ${response.statusText}`,
            response: responseText
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    } catch (error) {
      console.error('💥 Erro ao enviar webhook:', error)
      
      // Registrar erro no log
      await supabase
        .from('webhook_logs')
        .insert({
          project_id: project.id,
          webhook_type: 'sent',
          payload: webhookPayload,
          status: 'failed',
          error_message: error.message
        })
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar webhook',
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('💥 Erro no processamento:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

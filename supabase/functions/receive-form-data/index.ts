
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

    console.log('Recebendo dados do formulário de personalização...')

    // Parse dos dados recebidos
    const { modelo, observacoes, email, hash } = await req.json()

    console.log(`Dados recebidos: modelo=${modelo}, hash=${hash}`)

    // Validar dados obrigatórios
    if (!hash) {
      console.error('Hash não fornecida')
      return new Response(
        JSON.stringify({ error: 'Hash é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!modelo) {
      console.error('Modelo não fornecido')
      return new Response(
        JSON.stringify({ error: 'Modelo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar projeto pela hash
    console.log(`Buscando projeto com hash: ${hash}`)
    const { data: project, error: findError } = await supabase
      .from('projects')
      .select('*')
      .eq('partner_hash', hash)
      .single()

    if (findError || !project) {
      console.error('Projeto não encontrado:', findError)
      return new Response(
        JSON.stringify({ error: 'Projeto não encontrado com essa hash' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Projeto encontrado: ${project.client_name} (ID: ${project.id})`)

    // Atualizar projeto com dados do formulário
    const updateData = {
      modelo_escolhido: modelo,
      observacoes_cliente: observacoes || null,
      email_complementar: email || null,
      template: modelo, // Atualizar também o campo template para compatibilidade
      status: 'Criando site' // Avançar status quando formulário for preenchido
    }

    console.log('Atualizando projeto com dados do formulário...')
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', project.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar projeto:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar projeto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Projeto atualizado com sucesso!')

    // Se é um projeto de parceiro, criar webhook de notificação
    if (project.partner_hash) {
      console.log('Criando webhook de notificação para parceiro...')
      
      try {
        await supabase
          .from('webhook_logs')
          .insert({
            project_id: project.id,
            webhook_type: 'sent',
            payload: {
              type: 'form_completed',
              hash: project.partner_hash,
              nome: project.client_name,
              modelo_escolhido: modelo,
              observacoes_cliente: observacoes,
              email_complementar: email,
              status: 'Criando site',
              data_formulario: new Date().toISOString()
            },
            status: 'pending'
          })
        
        console.log('Webhook de notificação criado')
      } catch (webhookError) {
        console.error('Erro ao criar webhook:', webhookError)
        // Não falhar a operação principal por erro de webhook
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Formulário processado com sucesso',
        project: {
          id: updatedProject.id,
          client_name: updatedProject.client_name,
          modelo_escolhido: updatedProject.modelo_escolhido,
          status: updatedProject.status
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro no processamento do formulário:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

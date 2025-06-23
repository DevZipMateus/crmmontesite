
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

    console.log('=== RECEIVE FORM DATA ===')
    console.log('Recebendo dados do formulário de personalização...')

    // Parse dos dados recebidos
    const { modelo, observacoes, email, hash } = await req.json()

    console.log('Dados recebidos:')
    console.log('- modelo:', modelo)
    console.log('- hash:', hash)
    console.log('- email:', email)
    console.log('- observacoes length:', observacoes?.length || 0)

    // Validar dados obrigatórios
    if (!hash) {
      console.error('❌ Hash não fornecida')
      return new Response(
        JSON.stringify({ error: 'Hash é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!modelo) {
      console.error('❌ Modelo não fornecido')
      return new Response(
        JSON.stringify({ error: 'Modelo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar projeto pela hash
    console.log(`🔍 Buscando projeto com hash: ${hash}`)
    const { data: project, error: findError } = await supabase
      .from('projects')
      .select('*')
      .eq('partner_hash', hash)
      .single()

    if (findError || !project) {
      console.error('❌ Projeto não encontrado:', findError)
      return new Response(
        JSON.stringify({ error: 'Projeto não encontrado com essa hash' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Projeto encontrado: ${project.client_name} (ID: ${project.id})`)
    console.log('Status atual:', project.status)
    console.log('Formulário preenchido:', project.formulario_preenchido)

    // ✅ VERIFICAR SE O FORMULÁRIO JÁ FOI PREENCHIDO
    if (project.formulario_preenchido === true && project.data_formulario) {
      console.log('⚠️ Formulário já foi preenchido anteriormente em:', project.data_formulario)
      
      // Retornar sucesso mesmo se já foi preenchido para evitar erro na UI
      const response = {
        success: true,
        message: 'Formulário já foi processado anteriormente',
        already_filled: true,
        project: {
          id: project.id,
          client_name: project.client_name,
          modelo_escolhido: project.modelo_escolhido,
          status: project.status,
          formulario_preenchido: project.formulario_preenchido,
          data_formulario: project.data_formulario
        }
      }

      console.log('📤 Enviando resposta (já preenchido):', response)

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Atualizar projeto com dados do formulário
    const updateData = {
      modelo_escolhido: modelo,
      observacoes_cliente: observacoes || null,
      email_complementar: email || null,
      template: modelo, // Atualizar também o campo template para compatibilidade
      status: 'Criando site', // Avançar status quando formulário for preenchido
      formulario_preenchido: true, // ✅ IMPORTANTE: Marcar como preenchido
      data_formulario: new Date().toISOString() // ✅ IMPORTANTE: Data do preenchimento
    }

    console.log('📝 Atualizando projeto com dados do formulário...')
    console.log('Dados de atualização:', updateData)

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', project.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar projeto:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar projeto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Projeto atualizado com sucesso!')
    console.log('Novo status:', updatedProject.status)
    console.log('Formulário preenchido:', updatedProject.formulario_preenchido)

    // Se é um projeto de parceiro, criar webhook de notificação
    if (project.partner_hash) {
      console.log('📤 Criando webhook de notificação para parceiro...')
      
      try {
        const webhookPayload = {
          type: 'form_completed',
          hash: project.partner_hash,
          nome: project.client_name,
          modelo_escolhido: modelo,
          observacoes_cliente: observacoes,
          email_complementar: email,
          status: 'Criando site',
          data_formulario: new Date().toISOString()
        }

        console.log('Payload do webhook:', webhookPayload)

        const { error: webhookError } = await supabase
          .from('webhook_logs')
          .insert({
            project_id: project.id,
            webhook_type: 'sent',
            payload: webhookPayload,
            status: 'pending'
          })
        
        if (webhookError) {
          console.error('⚠️ Erro ao criar webhook:', webhookError)
        } else {
          console.log('✅ Webhook de notificação criado')
        }
      } catch (webhookError) {
        console.error('⚠️ Erro ao criar webhook:', webhookError)
        // Não falhar a operação principal por erro de webhook
      }
    }

    const response = {
      success: true,
      message: 'Formulário processado com sucesso',
      project: {
        id: updatedProject.id,
        client_name: updatedProject.client_name,
        modelo_escolhido: updatedProject.modelo_escolhido,
        status: updatedProject.status,
        formulario_preenchido: updatedProject.formulario_preenchido,
        data_formulario: updatedProject.data_formulario
      }
    }

    console.log('📤 Enviando resposta:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Erro no processamento do formulário:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

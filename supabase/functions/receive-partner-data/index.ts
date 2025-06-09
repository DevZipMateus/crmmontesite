
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    console.log('Received webhook data:', body)

    // Validar campos obrigatórios
    const { nome, cnpj, email, telefone, hash } = body
    if (!nome || !hash) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: nome, hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o parceiro existe
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('hash', hash)
      .eq('active', true)
      .single()

    if (partnerError || !partner) {
      console.error('Partner not found or inactive:', partnerError)
      return new Response(
        JSON.stringify({ error: 'Parceiro não encontrado ou inativo' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_name: nome,
        cnpj: cnpj || null,
        status: 'Recebido',
        partner_hash: hash,
        partner_webhook_url: partner.webhook_url,
        project_source: 'parceiro',
        responsible_name: partner.name
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar projeto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Registrar log do webhook recebido
    await supabase.from('webhook_logs').insert({
      project_id: project.id,
      webhook_type: 'received',
      payload: body,
      status: 'success'
    })

    console.log('Project created successfully:', project.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        project_id: project.id,
        message: 'Projeto criado com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in receive-partner-data:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

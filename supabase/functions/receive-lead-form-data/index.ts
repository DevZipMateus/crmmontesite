import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.json();
    console.log('Received lead form data:', formData);

    const {
      form_hash,
      modelo,
      email,
      // Dados do formulário completo
      officenome,
      responsavelnome,
      telefone,
      endereco,
      // Campos separados
      cnpj_cpf,
      visao_missao_valores,
      historia_empresa,
      mercado_atuacao,
      produtos,
      depoimentos,
      // Campos existentes
      descricao,
      servicos,
      redessociais,
      slogan,
      paletacores,
      fonte,
      estilo_visual,
      possuiplanos,
      planos,
      possuimapa,
      linkmapa,
      horario_funcionamento,
      botaowhatsapp
    } = formData;

    // Validar form_hash
    if (!form_hash) {
      return new Response(
        JSON.stringify({ error: 'Hash do formulário não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar lead pelo form_hash
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('form_hash', form_hash)
      .single();

    if (leadError || !lead) {
      console.error('Lead not found:', leadError);
      return new Response(
        JSON.stringify({ error: 'Lead não encontrado para este hash' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let projectId: string;
    let personalizationId: string | null = null;
    let isUpdate = false;

    // Verificar se lead já possui projeto vinculado
    if (lead.project_id) {
      console.log('Lead already has project, updating existing data:', lead.project_id);
      isUpdate = true;
      projectId = lead.project_id;

      // Atualizar projeto existente
      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({
          template: modelo || undefined,
          responsible_name: responsavelnome,
          telefone: telefone,
          email_complementar: email,
          modelo_escolhido: modelo,
          observacoes_cliente: historia_empresa || undefined,
          formulario_preenchido: true,
          data_formulario: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.project_id);

      if (projectUpdateError) {
        console.error('Error updating project:', projectUpdateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar projeto: ' + projectUpdateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar personalization_id existente
      const { data: existingProject } = await supabase
        .from('projects')
        .select('personalization_id')
        .eq('id', lead.project_id)
        .single();

      if (existingProject?.personalization_id) {
        personalizationId = existingProject.personalization_id;
        
        // Atualizar personalização existente
        const { error: persUpdateError } = await supabase
          .from('site_personalizacoes')
          .update({
            officenome: officenome,
            responsavelnome: responsavelnome,
            email: email,
            telefone: telefone,
            endereco: endereco,
            cnpj_cpf: cnpj_cpf || '',
            visao_missao_valores: visao_missao_valores || '',
            historia_empresa: historia_empresa || '',
            mercado_atuacao: mercado_atuacao || '',
            produtos: produtos || '',
            depoimentos: depoimentos || '',
            descricao: descricao || visao_missao_valores || '',
            servicos: servicos,
            redessociais: redessociais || '',
            slogan: slogan,
            paletacores: paletacores,
            fonte: fonte,
            estilo_visual: estilo_visual,
            possuiplanos: possuiplanos || false,
            planos: planos,
            possuimapa: possuimapa || false,
            linkmapa: linkmapa,
            horario_funcionamento: horario_funcionamento,
            botaowhatsapp: botaowhatsapp !== false,
            modelo: modelo,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProject.personalization_id);

        if (persUpdateError) {
          console.error('Error updating personalization:', persUpdateError);
        }
      } else {
        // Criar nova personalização se não existir
        const { data: newPersonalization, error: persError } = await supabase
          .from('site_personalizacoes')
          .insert({
            officenome: officenome,
            responsavelnome: responsavelnome,
            email: email,
            telefone: telefone,
            endereco: endereco,
            cnpj_cpf: cnpj_cpf || '',
            visao_missao_valores: visao_missao_valores || '',
            historia_empresa: historia_empresa || '',
            mercado_atuacao: mercado_atuacao || '',
            produtos: produtos || '',
            depoimentos: depoimentos || '',
            descricao: descricao || visao_missao_valores || '',
            servicos: servicos,
            redessociais: redessociais || '',
            slogan: slogan,
            paletacores: paletacores,
            fonte: fonte,
            estilo_visual: estilo_visual,
            possuiplanos: possuiplanos || false,
            planos: planos,
            possuimapa: possuimapa || false,
            linkmapa: linkmapa,
            horario_funcionamento: horario_funcionamento,
            botaowhatsapp: botaowhatsapp !== false,
            modelo: modelo,
            status: 'form_sent'
          })
          .select()
          .single();

        if (!persError && newPersonalization) {
          personalizationId = newPersonalization.id;
          // Vincular personalização ao projeto existente
          await supabase
            .from('projects')
            .update({ personalization_id: newPersonalization.id })
            .eq('id', projectId);
        }
      }

    } else {
      // CRIAR novo projeto
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_name: lead.empresa || lead.nome_cliente,
          template: modelo || 'Não especificado',
          status: 'Recebido',
          responsible_name: responsavelnome,
          client_type: 'direto',
          telefone: telefone,
          email_complementar: email,
          cnpj: lead.cnpj,
          blaster_link: lead.link_blaster,
          modelo_escolhido: modelo,
          observacoes_cliente: historia_empresa || '',
          formulario_preenchido: true,
          data_formulario: new Date().toISOString(),
          lead_id: lead.id,
          project_source: 'lead_form'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar projeto: ' + projectError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Project created:', newProject);
      projectId = newProject.id;

      // Criar personalização
      const { data: personalization, error: persError } = await supabase
        .from('site_personalizacoes')
        .insert({
          officenome: officenome,
          responsavelnome: responsavelnome,
          email: email,
          telefone: telefone,
          endereco: endereco,
          cnpj_cpf: cnpj_cpf || '',
          visao_missao_valores: visao_missao_valores || '',
          historia_empresa: historia_empresa || '',
          mercado_atuacao: mercado_atuacao || '',
          produtos: produtos || '',
          depoimentos: depoimentos || '',
          descricao: descricao || visao_missao_valores || '',
          servicos: servicos,
          redessociais: redessociais || '',
          slogan: slogan,
          paletacores: paletacores,
          fonte: fonte,
          estilo_visual: estilo_visual,
          possuiplanos: possuiplanos || false,
          planos: planos,
          possuimapa: possuimapa || false,
          linkmapa: linkmapa,
          horario_funcionamento: horario_funcionamento,
          botaowhatsapp: botaowhatsapp !== false,
          modelo: modelo,
          status: 'form_sent'
        })
        .select()
        .single();

      if (persError) {
        console.error('Error creating personalization:', persError);
      } else {
        personalizationId = personalization.id;
        // Vincular personalização ao projeto
        await supabase
          .from('projects')
          .update({ personalization_id: personalization.id })
          .eq('id', newProject.id);
      }
    }

    // Atualizar lead com dados do projeto e vinculação
    const { error: leadUpdateError } = await supabase
      .from('leads')
      .update({
        project_id: projectId,
        link_confidence_score: 100,
        link_method: 'form_hash',
        situacao: 'Preenchendo Formulário',
        data_ultimo_contato: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.id);

    if (leadUpdateError) {
      console.error('Error updating lead:', leadUpdateError);
    }

    console.log('Lead form processed successfully, isUpdate:', isUpdate);

    return new Response(
      JSON.stringify({ 
        success: true, 
        project_id: projectId,
        lead_id: lead.id,
        personalization_id: personalizationId,
        updated: isUpdate,
        message: isUpdate 
          ? 'Dados atualizados com sucesso!' 
          : 'Formulário processado com sucesso!' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing lead form:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

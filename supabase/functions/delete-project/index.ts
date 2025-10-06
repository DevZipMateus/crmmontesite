import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parâmetro id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Desvincular leads relacionados
    const { error: unlinkLeadsError } = await supabase
      .from('leads')
      .update({ project_id: null, link_confidence_score: null, link_method: null })
      .eq('project_id', id);

    if (unlinkLeadsError) {
      return new Response(
        JSON.stringify({ success: false, error: unlinkLeadsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Excluir envios de mídia do cliente
    const { error: submissionsError } = await supabase
      .from('client_media_submissions')
      .delete()
      .eq('project_id', id);

    if (submissionsError) {
      return new Response(
        JSON.stringify({ success: false, error: submissionsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Excluir customizações do projeto
    const { error: customizationsError } = await supabase
      .from('project_customizations')
      .delete()
      .eq('project_id', id);

    if (customizationsError) {
      return new Response(
        JSON.stringify({ success: false, error: customizationsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Excluir logs de webhook (caso não estejam em cascade)
    const { error: webhooksError } = await supabase
      .from('webhook_logs')
      .delete()
      .eq('project_id', id);

    if (webhooksError) {
      return new Response(
        JSON.stringify({ success: false, error: webhooksError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Finalmente, excluir o projeto (CASCADE cuidará do resto, se configurado)
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (projectError) {
      return new Response(
        JSON.stringify({ success: false, error: projectError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
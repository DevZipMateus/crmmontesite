
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerDataPayload {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  hash: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extrair token de autenticação
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      await logAuthAttempt(supabase, {
        tokenUsed: 'missing',
        requestIp: req.headers.get('x-forwarded-for') || 'unknown',
        requestHeaders: Object.fromEntries(req.headers.entries()),
        success: false,
        errorMessage: 'Token de autenticação não fornecido'
      });

      return new Response(
        JSON.stringify({ error: 'Token de autenticação obrigatório' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar token
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_auth_token', { token_input: token });

    if (validationError || !validationResult?.[0]?.is_valid) {
      await logAuthAttempt(supabase, {
        tokenUsed: token,
        requestIp: req.headers.get('x-forwarded-for') || 'unknown',
        requestHeaders: Object.fromEntries(req.headers.entries()),
        success: false,
        errorMessage: 'Token inválido ou expirado'
      });

      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const partnerId = validationResult[0].partner_id;
    const partnerName = validationResult[0].partner_name;

    // Log tentativa de autenticação bem-sucedida
    await logAuthAttempt(supabase, {
      partnerId,
      tokenUsed: token,
      requestIp: req.headers.get('x-forwarded-for') || 'unknown',
      requestHeaders: Object.fromEntries(req.headers.entries()),
      success: true
    });

    // Processar dados do parceiro
    const payload: PartnerDataPayload = await req.json();
    
    console.log('Received partner data:', payload);
    console.log('Authenticated partner:', partnerName);

    // Validar dados obrigatórios
    if (!payload.nome || !payload.hash) {
      return new Response(
        JSON.stringify({ error: 'Nome e hash são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se já existe projeto com esse hash
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id, client_name')
      .eq('partner_hash', payload.hash)
      .maybeSingle();

    if (existingProject) {
      return new Response(
        JSON.stringify({ 
          error: 'Projeto já existe',
          project_id: existingProject.id,
          client_name: existingProject.client_name
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar dados do parceiro
    const { data: partner } = await supabase
      .from('partners')
      .select('webhook_url')
      .eq('id', partnerId)
      .single();

    // Criar novo projeto
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_name: payload.nome,
        cnpj: payload.cnpj,
        partner_hash: payload.hash,
        partner_webhook_url: partner?.webhook_url,
        project_source: 'parceiro',
        status: 'Em andamento'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar projeto' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Project created successfully:', newProject);

    return new Response(
      JSON.stringify({ 
        success: true,
        project_id: newProject.id,
        message: 'Projeto criado com sucesso',
        partner: partnerName
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function logAuthAttempt(supabase: any, data: {
  partnerId?: string;
  tokenUsed: string;
  requestIp?: string;
  requestHeaders?: any;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    await supabase
      .from('auth_logs')
      .insert({
        partner_id: data.partnerId,
        token_used: data.tokenUsed.substring(0, 10) + '...', // Log apenas parte do token
        request_ip: data.requestIp,
        request_headers: data.requestHeaders,
        success: data.success,
        error_message: data.errorMessage
      });
  } catch (error) {
    console.error('Error logging auth attempt:', error);
  }
}


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
  console.log('=== Recebendo requisição ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extrair token de autenticação
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header presente:', !!authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Token não fornecido');
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

    console.log('🔍 Validando token:', token.substring(0, 10) + '...');

    // Validar token
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_auth_token', { token_input: token });

    console.log('Resultado da validação:', validationResult);
    console.log('Erro na validação:', validationError);

    if (validationError || !validationResult?.[0]?.is_valid) {
      console.log('❌ Token inválido ou expirado');
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

    console.log('✅ Token válido para parceiro:', partnerName);

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
    
    console.log('📋 Dados recebidos:', JSON.stringify(payload, null, 2));
    console.log('👤 Parceiro autenticado:', partnerName);

    // Validar dados obrigatórios
    if (!payload.nome || !payload.hash) {
      console.log('❌ Dados obrigatórios não fornecidos');
      return new Response(
        JSON.stringify({ error: 'Nome e hash são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se já existe projeto com esse hash
    console.log('🔍 Verificando se projeto já existe com hash:', payload.hash);
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id, client_name')
      .eq('partner_hash', payload.hash)
      .maybeSingle();

    if (existingProject) {
      console.log('⚠️ Projeto já existe:', existingProject.id);
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

    console.log('🔗 URL webhook do parceiro:', partner?.webhook_url);

    // Criar novo projeto
    console.log('📝 Criando novo projeto...');
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
      console.error('❌ Erro ao criar projeto:', projectError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar projeto' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Projeto criado com sucesso:', newProject.id);

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
    console.error('💥 Erro inesperado:', error);
    
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

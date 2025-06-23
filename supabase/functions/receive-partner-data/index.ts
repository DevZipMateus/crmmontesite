
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
  telefone: string;
  hash: string;
}

const EGESTOR_TOKEN = "whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12";

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

    let partnerId: string | null = null;
    let partnerName: string | null = null;
    let isValidToken = false;

    // Verificar se é o token do eGestor
    if (token === EGESTOR_TOKEN) {
      console.log('✅ Token do eGestor detectado');
      
      // Buscar ou criar parceiro eGestor
      const { data: egestorPartner, error: egestorError } = await supabase
        .from('partners')
        .select('*')
        .eq('hash', 'egestor_painel_parceiros')
        .single();

      if (egestorError && egestorError.code === 'PGRST116') {
        // Parceiro não existe, criar
        console.log('Criando parceiro eGestor...');
        const { data: newPartner, error: createError } = await supabase
          .from('partners')
          .insert({
            name: 'eGestor - Painel Parceiros',
            hash: 'egestor_painel_parceiros',
            webhook_url: 'https://v4.egestor.com.br/parceiros2/webhook_receiver.php',
            auth_token: EGESTOR_TOKEN,
            token_hash: await hashToken(EGESTOR_TOKEN),
            active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar parceiro eGestor:', createError);
          throw createError;
        }

        partnerId = newPartner.id;
        partnerName = newPartner.name;
      } else if (!egestorError) {
        partnerId = egestorPartner.id;
        partnerName = egestorPartner.name;
      }

      isValidToken = true;
    } else {
      // Validar token usando a função existente
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_auth_token', { token_input: token });

      console.log('Resultado da validação:', validationResult);
      console.log('Erro na validação:', validationError);

      if (!validationError && validationResult?.[0]?.is_valid) {
        partnerId = validationResult[0].partner_id;
        partnerName = validationResult[0].partner_name;
        isValidToken = true;
      }
    }

    if (!isValidToken) {
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

    // Validar dados obrigatórios - agora incluindo telefone
    if (!payload.nome || !payload.hash || !payload.telefone) {
      console.log('❌ Dados obrigatórios não fornecidos');
      return new Response(
        JSON.stringify({ error: 'Nome, hash e telefone são obrigatórios' }),
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
        telefone: payload.telefone,
        partner_hash: payload.hash,
        partner_webhook_url: partner?.webhook_url,
        project_source: 'parceiro',
        status: 'Recebido'
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

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

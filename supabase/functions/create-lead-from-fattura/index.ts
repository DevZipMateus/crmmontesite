import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FatturaLeadPayload {
  empresa: string;
  nome_cliente: string;
  vendedor?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  link_blaster?: string;
  fattura_id?: string;
  token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('=== Fattura Lead Creation Request ===');
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);

    // MODO TESTE: Validação de token desabilitada temporariamente
    console.log('⚠️ MODO TESTE: Token validation disabled for testing purposes');
    
    const authHeader = req.headers.get('Authorization');
    let providedToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : 'TEST_TOKEN';
    
    console.log('Auth header provided:', !!authHeader);
    console.log('Token for logging:', providedToken.substring(0, 10) + '...');

    // Parse request body
    const body = await req.text();
    console.log('Request body:', body);

    let data: FatturaLeadPayload;
    try {
      data = JSON.parse(body);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Formato JSON inválido' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!data.empresa || !data.nome_cliente) {
      console.log('Missing required fields:', { empresa: data.empresa, nome_cliente: data.nome_cliente });
      
      await logAuthAttempt(supabase, {
        tokenUsed: providedToken,
        requestIp: req.headers.get('x-forwarded-for') || 'unknown',
        requestHeaders: Object.fromEntries(req.headers.entries()),
        success: false,
        errorMessage: 'Campos obrigatórios ausentes: empresa e nome_cliente são necessários'
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campos obrigatórios ausentes: empresa e nome_cliente são necessários' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for duplicate leads (same company within the last minute)
    const { data: existingLeads, error: duplicateError } = await supabase
      .from('leads')
      .select('id, empresa, created_at')
      .ilike('empresa', data.empresa.trim())
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    if (duplicateError) {
      console.error('Error checking for duplicates:', duplicateError);
    } else if (existingLeads && existingLeads.length > 0) {
      console.log('Duplicate lead found:', existingLeads[0]);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Um lead com esta empresa foi criado recentemente. Aguarde um momento antes de criar outro.',
          existingLeadId: existingLeads[0].id
        }), 
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the lead
    const leadData = {
      empresa: data.empresa.trim(),
      nome_cliente: data.nome_cliente.trim(),
      email: data.email?.trim() || null,
      cnpj: null, // Can be added later if needed by Fattura
      vendedor: data.vendedor?.trim() || null,
      link_blaster: data.link_blaster?.trim() || null,
      link_chat: null, // Will be set later if needed
      situacao: 'Novo cliente',
      data_ultimo_contato: new Date().toISOString(),
      observacoes: data.observacoes?.trim() || `Lead criado automaticamente via Fattura${data.fattura_id ? ` (ID: ${data.fattura_id})` : ''}`,
    };

    console.log('Creating lead with data:', leadData);

    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating lead:', createError);
      
      await logAuthAttempt(supabase, {
        tokenUsed: providedToken,
        requestIp: req.headers.get('x-forwarded-for') || 'unknown',
        requestHeaders: Object.fromEntries(req.headers.entries()),
        success: false,
        errorMessage: `Erro ao criar lead: ${createError.message}`
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro interno do servidor ao criar lead' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful creation
    await logAuthAttempt(supabase, {
      tokenUsed: providedToken,
      requestIp: req.headers.get('x-forwarded-for') || 'unknown',
      requestHeaders: Object.fromEntries(req.headers.entries()),
      success: true,
      errorMessage: `Lead criado com sucesso para empresa: ${data.empresa}`
    });

    console.log('Lead created successfully:', newLead);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead criado com sucesso',
        leadId: newLead.id,
        lead: {
          id: newLead.id,
          empresa: newLead.empresa,
          nome_cliente: newLead.nome_cliente,
          vendedor: newLead.vendedor,
          situacao: newLead.situacao,
          created_at: newLead.created_at
        }
      }), 
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in create-lead-from-fattura function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to log authentication attempts
async function logAuthAttempt(supabase: any, data: {
  tokenUsed: string;
  requestIp?: string;
  requestHeaders?: any;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    await supabase
      .from('auth_logs')
      .insert([{
        partner_id: null, // For Fattura, we don't have a partner_id
        token_used: data.tokenUsed,
        request_ip: data.requestIp,
        request_headers: data.requestHeaders,
        success: data.success,
        error_message: data.errorMessage,
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
}
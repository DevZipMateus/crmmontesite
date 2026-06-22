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
  cnpj?: string;
  observacoes?: string;
  link_blaster?: string;
  fattura_id?: string;
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

    // Validate field formats
    const validationErrors: string[] = [];

    // Email validation (if provided)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      validationErrors.push('Email deve ter um formato válido');
    }

    // CNPJ/CPF validation (if provided) — aceita CNPJ Alfanumérico (12 alfa + 2 dígitos) e CPF (11 dígitos)
    if (data.cnpj) {
      const clean = data.cnpj.toUpperCase().replace(/[^0-9A-Z]/g, '');
      const isCpf = /^[0-9]{11}$/.test(clean);
      const isCnpj = /^[0-9A-Z]{12}[0-9]{2}$/.test(clean);
      if (!isCpf && !isCnpj) {
        validationErrors.push('CNPJ/CPF inválido. CPF deve ter 11 dígitos; CNPJ deve ter 14 caracteres (12 alfanuméricos + 2 dígitos verificadores).');
      }
    }

    // Phone validation (if provided) - basic format check
    if (data.telefone && !/^\(?(\d{2})\)?\s?9?\d{4}-?\d{4}$/.test(data.telefone.replace(/\s/g, ''))) {
      validationErrors.push('Telefone deve ter um formato válido (ex: (11) 99999-9999)');
    }

    // URL validation for link_blaster (if provided)
    if (data.link_blaster && !/^https?:\/\/.+/.test(data.link_blaster)) {
      validationErrors.push('Link Blaster deve ser uma URL válida');
    }

    // String length validations
    if (data.empresa.trim().length < 2) {
      validationErrors.push('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    if (data.nome_cliente.trim().length < 2) {
      validationErrors.push('Nome do cliente deve ter pelo menos 2 caracteres');
    }

    if (data.empresa.trim().length > 255) {
      validationErrors.push('Nome da empresa deve ter no máximo 255 caracteres');
    }

    if (data.nome_cliente.trim().length > 255) {
      validationErrors.push('Nome do cliente deve ter no máximo 255 caracteres');
    }

    if (data.observacoes && data.observacoes.length > 1000) {
      validationErrors.push('Observações devem ter no máximo 1000 caracteres');
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados inválidos',
          details: validationErrors
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
      cnpj: data.cnpj?.trim() || null,
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
      
      console.error('Database error details:', createError);

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

    console.log('Lead created successfully for company:', data.empresa);

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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EGESTOR_TOKEN = 'whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Validate eGestor token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação obrigatório' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const isValidToken = token === EGESTOR_TOKEN;
    
    if (!isValidToken) {
      console.log('Failed authentication attempt with token:', token.substring(0, 10) + '...');
      
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const projectId = url.searchParams.get('id');
    const fields = url.searchParams.get('fields');
    const status = url.searchParams.get('status');
    const since = url.searchParams.get('since');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('projects');
    let selectFields = '*';

    // Handle specific project ID request
    if (projectId) {
      selectFields = `
        *,
        site_personalizacoes!left(
          email
        ),
        leads!left(
          situacao,
          cnpj,
          email,
          link_chat,
          data_ultimo_contato,
          nome_cliente
        )
      `;
      
      const { data: project, error } = await query
        .select(selectFields)
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Projeto não encontrado' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar projeto' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Transform leads array to enriched fields
      const leadData = project.leads?.[0] || null;
      const transformedProject = {
        ...project,
        situacao_lead: leadData?.situacao || null,
        lead_cnpj: leadData?.cnpj || null,
        lead_email: leadData?.email || null,
        lead_link_chat: leadData?.link_chat || null,
        lead_data_ultimo_contato: leadData?.data_ultimo_contato || null,
        lead_nome_cliente: leadData?.nome_cliente || null,
        leads: undefined
      };

      // Log successful access
      await supabase
        .from('auth_logs')
        .insert({
          partner_id: null,
          token_used: token.substring(0, 10) + '...',
          request_ip: req.headers.get('x-forwarded-for') || 'unknown',
          request_headers: {
            'user-agent': req.headers.get('user-agent'),
            'referer': req.headers.get('referer')
          },
          success: true,
          error_message: null
        });

      console.log(`Successfully exported project: ${projectId}`);

      return new Response(
        JSON.stringify(transformedProject),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    // Handle fields selection for lightweight queries
    if (fields) {
      const allowedFields = ['id', 'client_name', 'status', 'created_at', 'updated_at', 'domain', 'template', 'responsible_name', 'formulario_preenchido', 'data_formulario'];
      const requestedFields = fields.split(',').map(f => f.trim());
      const validFields = requestedFields.filter(f => allowedFields.includes(f));
      
      if (validFields.length > 0) {
        selectFields = validFields.join(', ');
      }
    } else {
      // Default full query with site_personalizacoes and leads
      selectFields = `
        *,
        site_personalizacoes!left(
          email
        ),
        leads!left(
          situacao,
          cnpj,
          email,
          link_chat,
          data_ultimo_contato,
          nome_cliente
        )
      `;
    }

    // Build query with filters
    query = query.select(selectFields);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date filter (projects created/updated since date)
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query = query.or(`created_at.gte.${sinceDate.toISOString()},updated_at.gte.${sinceDate.toISOString()}`);
      }
    }

    // Apply pagination
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
        
        if (offset) {
          const offsetNum = parseInt(offset);
          if (!isNaN(offsetNum) && offsetNum >= 0) {
            query = query.range(offsetNum, offsetNum + limitNum - 1);
          }
        }
      }
    }

    // Execute query
    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar dados dos projetos' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform leads array to situacao_lead field for all projects
    const transformedProjects = (projects || []).map(project => ({
      ...project,
      situacao_lead: project.leads?.[0]?.situacao || null,
      leads: undefined
    }));

    // Log successful access
    await supabase
      .from('auth_logs')
      .insert({
        partner_id: null,
        token_used: token.substring(0, 10) + '...',
        request_ip: req.headers.get('x-forwarded-for') || 'unknown',
        request_headers: {
          'user-agent': req.headers.get('user-agent'),
          'referer': req.headers.get('referer'),
          'query-params': Object.fromEntries(url.searchParams)
        },
        success: true,
        error_message: null
      });

    console.log(`Successfully exported ${transformedProjects.length} projects with filters:`, {
      fields, status, since, limit, offset
    });

    return new Response(
      JSON.stringify(transformedProjects),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Total-Count': String(transformedProjects.length)
        } 
      }
    );

  } catch (error) {
    console.error('Error in export-sales-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

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
      // Log failed auth attempt
      console.log('Failed authentication attempt with token:', token.substring(0, 10) + '...');
      
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all projects with site_personalizacoes data
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        site_personalizacoes!inner(
          email
        )
      `)
      .order('created_at', { ascending: false });

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

    // Log successful access
    await supabase
      .from('auth_logs')
      .insert({
        partner_id: null, // eGestor doesn't have a partner_id in our system
        token_used: token.substring(0, 10) + '...',
        request_ip: req.headers.get('x-forwarded-for') || 'unknown',
        request_headers: {
          'user-agent': req.headers.get('user-agent'),
          'referer': req.headers.get('referer')
        },
        success: true,
        error_message: null
      });

    console.log(`Successfully exported ${projects?.length || 0} projects`);

    return new Response(
      JSON.stringify(projects || []),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Total-Count': String(projects?.length || 0)
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
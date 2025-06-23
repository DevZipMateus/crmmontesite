
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestWebhookRequest {
  webhook_url: string;
  auth_token?: string;
  partner_name: string;
}

serve(async (req) => {
  console.log('=== Test Webhook Connection Request ===');
  console.log('Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url, auth_token, partner_name }: TestWebhookRequest = await req.json();
    
    console.log('Testing connection to:', webhook_url);
    console.log('Partner:', partner_name);
    console.log('Has auth token:', !!auth_token);

    // Prepare test payload matching StatusWebhookPayload format
    const testPayload = {
      type: 'status_change',
      status: 'Teste de Conexão',
      previous_status: 'Em andamento',
      nome: 'Cliente Teste - MonteSite CRM',
      email: 'teste@montesite.com.br',
      telefone: '(11) 99999-9999',
      cnpj: '00.000.000/0001-00',
      hash: 'test_connection_hash_' + Date.now(),
      data_status: new Date().toISOString(),
      domain: 'exemplo-teste.com.br'
    };

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'MonteSite-CRM/1.0'
    };

    // Add authentication if token is provided
    if (auth_token) {
      headers['Authorization'] = `Bearer ${auth_token}`;
    }

    console.log('Sending test request with StatusWebhookPayload format...');
    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    
    // Make the test request
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);

    // Determine if the test was successful
    const isSuccess = response.ok || response.status === 200;
    
    const result = {
      success: isSuccess,
      status_code: response.status,
      status_text: response.statusText,
      response_body: responseText,
      response_headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString(),
      test_payload: testPayload
    };

    if (isSuccess) {
      console.log('✅ Connection test successful');
      return new Response(
        JSON.stringify({
          success: true,
          message: `Conexão com ${partner_name} estabelecida com sucesso! Payload aceito corretamente.`,
          details: result
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.log('❌ Connection test failed');
      return new Response(
        JSON.stringify({
          success: false,
          message: `Falha na conexão: HTTP ${response.status} - ${response.statusText}`,
          details: result
        }),
        {
          status: 200, // We return 200 to indicate the test was performed, even if it failed
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('💥 Error in test-webhook-connection:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro de rede: ${error.message}`,
        details: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

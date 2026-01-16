import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { project_id, delivery_term_id } = await req.json();

    if (!project_id || !delivery_term_id) {
      return new Response(
        JSON.stringify({ error: "project_id and delivery_term_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch integration settings
    const { data: settings, error: settingsError } = await supabase
      .from("integration_settings")
      .select("webhook_url, active")
      .eq("integration_name", "make_delivery_term")
      .single();

    if (settingsError) {
      console.error("Error fetching integration settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch integration settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if integration is active and has webhook URL
    const webhookUrl = settings?.webhook_url;
    if (!webhookUrl || !settings?.active) {
      console.log("Integration is disabled or webhook URL not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Integration is disabled or webhook URL not configured" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      console.error("Error fetching project:", projectError);
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch delivery term data
    const { data: deliveryTerm, error: termError } = await supabase
      .from("delivery_terms")
      .select("*")
      .eq("id", delivery_term_id)
      .single();

    if (termError || !deliveryTerm) {
      console.error("Error fetching delivery term:", termError);
      return new Response(
        JSON.stringify({ error: "Delivery term not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate reminder date (30 days from now)
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 30);

    // Prepare payload for Make.com
    const payload = {
      event: "delivery_term_submitted",
      timestamp: new Date().toISOString(),
      project: {
        id: project.id,
        client_name: project.client_name,
        domain: project.domain,
        email: project.email_complementar,
        telefone: project.telefone,
        cnpj: project.cnpj,
        modelo_escolhido: project.modelo_escolhido,
        status: project.status,
      },
      delivery_term: {
        id: deliveryTerm.id,
        nome_completo: deliveryTerm.nome_completo,
        cpf: deliveryTerm.cpf,
        email: deliveryTerm.email,
        nota_atendimento: deliveryTerm.nota_atendimento,
        comentarios: deliveryTerm.comentarios,
        data_aceite: deliveryTerm.data_aceite,
        ip_address: deliveryTerm.ip_address,
      },
      reminder_date: reminderDate.toISOString(),
    };

    console.log("Sending payload to Make.com:", JSON.stringify(payload, null, 2));

    // Send to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Make.com webhook error:", errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Webhook failed with status ${response.status}`,
          details: errorText 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully sent to Make.com");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Delivery term data sent to Make.com successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

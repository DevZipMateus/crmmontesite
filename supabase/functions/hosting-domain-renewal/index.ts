import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOSTINGER_API_BASE = 'https://developers.hostinger.com/api';
const MATCH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // ±3 dias

async function hostingerFetch(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${HOSTINGER_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hostinger API ${path} -> HTTP ${res.status}: ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Não há sessão de usuário real do Supabase Auth neste CRM (login é uma flag
    // local no navegador); o gateway do Supabase (verify_jwt padrão desta função)
    // já garante que o caller possui a chave anon/service do projeto.
    const actorEmail = 'painel-hospedagem';

    const hostingerToken = Deno.env.get('HOSTINGER_API_TOKEN');
    if (!hostingerToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'HOSTINGER_API_TOKEN não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    if (body.action === 'find_candidates') {
      const { domain } = body;
      if (!domain) {
        return new Response(JSON.stringify({ success: false, error: 'domain é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const renewal = await hostingerFetch(
        `/domains/v1/portfolio/${encodeURIComponent(domain)}/renewal`,
        hostingerToken
      );
      const domainExpiresAt = renewal?.expires_at ? new Date(renewal.expires_at).getTime() : null;

      // Pagina todas as assinaturas (não há filtro por domínio na API da Hostinger).
      const allSubscriptions: Record<string, unknown>[] = [];
      const subs = await hostingerFetch('/billing/v1/subscriptions', hostingerToken);
      allSubscriptions.push(...(Array.isArray(subs) ? subs : []));

      const candidates = allSubscriptions
        .filter((s: any) => typeof s.name === 'string' && s.name.toLowerCase().includes('domain'))
        .map((s: any) => {
          const refDate = s.next_billing_at ?? s.expires_at;
          const diffMs =
            domainExpiresAt && refDate ? Math.abs(new Date(refDate).getTime() - domainExpiresAt) : null;
          return { ...s, date_diff_ms: diffMs };
        })
        .filter((s: any) => s.date_diff_ms !== null && s.date_diff_ms <= MATCH_WINDOW_MS)
        .sort((a: any, b: any) => a.date_diff_ms - b.date_diff_ms);

      return new Response(
        JSON.stringify({ success: true, domain, domain_expires_at: renewal?.expires_at ?? null, candidates }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'disable') {
      const { subscription_id, domain } = body;
      if (!subscription_id || !domain) {
        return new Response(
          JSON.stringify({ success: false, error: 'subscription_id e domain são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await hostingerFetch(
        `/billing/v1/subscriptions/${subscription_id}/auto-renewal/disable`,
        hostingerToken,
        { method: 'DELETE' }
      );

      await supabase.from('hosting_events').insert({
        event_type: 'domain_auto_renewal_disabled',
        domain,
        order_id: null,
        detail: { actor_email: actorEmail, subscription_id },
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'action inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Erro em hosting-domain-renewal:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

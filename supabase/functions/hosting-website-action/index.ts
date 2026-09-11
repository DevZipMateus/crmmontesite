import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOSTINGER_API_BASE = 'https://developers.hostinger.com/api';

async function hostingerFetch(
  path: string,
  token: string,
  init: RequestInit = {}
) {
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

    const { website_id, action } = await req.json();
    if (!website_id || !['deactivate', 'reactivate', 'delete', 'clear_cache'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parâmetros inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: site, error: siteError } = await supabase
      .from('hosting_websites')
      .select('*')
      .eq('id', website_id)
      .single();

    if (siteError || !site) {
      return new Response(
        JSON.stringify({ success: false, error: 'Site não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((action === 'deactivate' || action === 'reactivate') && site.platform !== 'h5g') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tirar do ar / reativar só está disponível para sites do plano Agency Growth.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    if (action === 'deactivate') {
      await hostingerFetch(
        `/agency-hosting/v1/websites/${site.external_uid}/domains/${site.domain}`,
        hostingerToken,
        { method: 'DELETE' }
      );
      await supabase.from('hosting_websites').update({ panel_state: 'offline' }).eq('id', website_id);
      await supabase.from('hosting_events').insert({
        event_type: 'site_deactivated',
        domain: site.domain,
        order_id: site.order_id,
        detail: { actor_email: actorEmail },
      });
    } else if (action === 'reactivate') {
      await hostingerFetch(
        `/agency-hosting/v1/websites/${site.external_uid}/domains`,
        hostingerToken,
        { method: 'POST', body: JSON.stringify({ domain: site.domain, primary: true }) }
      );
      await supabase.from('hosting_websites').update({ panel_state: 'active' }).eq('id', website_id);
      await supabase.from('hosting_events').insert({
        event_type: 'site_reactivated',
        domain: site.domain,
        order_id: site.order_id,
        detail: { actor_email: actorEmail },
      });
    } else if (action === 'delete') {
      if (site.platform === 'h5g') {
        await hostingerFetch(`/agency-hosting/v1/websites/${site.external_uid}`, hostingerToken, {
          method: 'DELETE',
        });
      } else {
        await hostingerFetch(`/hosting/v1/websites/${encodeURIComponent(site.domain)}`, hostingerToken, {
          method: 'DELETE',
        });
      }
      await supabase.from('hosting_websites').update({ deleted_at: now }).eq('id', website_id);
      await supabase.from('hosting_events').insert({
        event_type: 'site_deleted_manual',
        domain: site.domain,
        order_id: site.order_id,
        detail: { actor_email: actorEmail, platform: site.platform },
      });
    } else if (action === 'clear_cache') {
      if (site.platform === 'h5g') {
        await hostingerFetch(`/agency-hosting/v1/websites/${site.external_uid}/cache`, hostingerToken, {
          method: 'DELETE',
        });
      } else {
        // Cloud Professional exige o username da conta, que não guardamos —
        // busca na Hostinger pelo domínio exato antes de limpar o cache.
        const lookup = await hostingerFetch(
          `/hosting/v1/websites?domain=${encodeURIComponent(site.domain)}&per_page=100`,
          hostingerToken
        );
        const match = (lookup?.data ?? []).find(
          (w: { domain: string; username: string }) => w.domain.toLowerCase() === site.domain.toLowerCase()
        );
        if (!match) throw new Error(`Não foi possível localizar a conta do site ${site.domain} na Hostinger.`);
        await hostingerFetch(
          `/hosting/v1/accounts/${match.username}/websites/${encodeURIComponent(site.domain)}/cache/clear`,
          hostingerToken,
          { method: 'DELETE' }
        );
      }
      await supabase.from('hosting_events').insert({
        event_type: 'cache_cleared',
        domain: site.domain,
        order_id: site.order_id,
        detail: { actor_email: actorEmail, platform: site.platform },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Erro em hosting-website-action:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

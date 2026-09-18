import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HostingLocation = "loading" | "vps" | "hostinger" | "no_hosting" | "unknown";

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "");
}

/**
 * Usa a tabela `hosting_websites` (sincronizada de verdade com a API da Hostinger
 * pela pagina Hospedagem) para saber onde o site do projeto esta hospedado.
 *
 * Um registro com `deleted_at` preenchido significa que o site foi removido da
 * Hostinger - no fluxo de migracao atual, isso acontece depois que o site ja
 * esta funcionando na VPS. Sem `deleted_at`, o site ainda esta na Hostinger.
 */
export function useHostingLocation(projectId?: string | null, domain?: string | null) {
  const cleanDomain = domain?.trim() ? normalizeDomain(domain) : null;

  const { data, isLoading } = useQuery({
    queryKey: ["hosting_location", projectId, cleanDomain],
    queryFn: async () => {
      if (projectId) {
        const { data: byProject, error: byProjectError } = await supabase
          .from("hosting_websites")
          .select("deleted_at, domain, is_decommissioned")
          .eq("linked_project_id", projectId)
          .maybeSingle();
        if (byProjectError) throw byProjectError;
        if (byProject) return byProject;
      }

      if (cleanDomain) {
        const { data: byDomain, error: byDomainError } = await supabase
          .from("hosting_websites")
          .select("deleted_at, domain, is_decommissioned")
          .ilike("domain", cleanDomain)
          .maybeSingle();
        if (byDomainError) throw byDomainError;
        if (byDomain) return byDomain;
      }

      return null;
    },
    enabled: !!projectId || !!cleanDomain,
    staleTime: 60_000,
  });

  if (!projectId && !cleanDomain) return { status: "unknown" as HostingLocation };
  if (isLoading) return { status: "loading" as HostingLocation };
  if (!data) return { status: "unknown" as HostingLocation };

  const status: HostingLocation = data.is_decommissioned
    ? "no_hosting"
    : data.deleted_at
    ? "vps"
    : "hostinger";
  return { status };
}

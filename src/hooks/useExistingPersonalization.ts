import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/supabase/storage";

export interface ExistingPersonalizationData {
  // Text fields
  officenome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  visao_missao_valores: string;
  historia_empresa: string;
  mercado_atuacao: string;
  endereco: string;
  horario_funcionamento: string;
  slogan: string;
  servicos: string;
  produtos: string;
  redessociais: string;
  paletacores: string;
  depoimentos: string;
  planos: string;
  possuiplanos: boolean;
  possuimapa: boolean;
  linkmapa: string;
  botaowhatsapp: boolean;
  modelo: string;
  // File URLs (signed)
  logo_url: string | null;
  midia_urls: Array<{ url: string; caption?: string }>;
  depoimento_urls: string[];
}

interface UseExistingPersonalizationResult {
  existingData: ExistingPersonalizationData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch existing personalization data for a project
 * and generate signed URLs for files
 */
export function useExistingPersonalization(
  projectId: string | null | undefined
): UseExistingPersonalizationResult {
  const [existingData, setExistingData] = useState<ExistingPersonalizationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setExistingData(null);
      return;
    }

    const fetchExistingData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, get the project to find personalization_id
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("personalization_id")
          .eq("id", projectId)
          .maybeSingle();

        if (projectError) {
          throw new Error(`Erro ao buscar projeto: ${projectError.message}`);
        }

        if (!project?.personalization_id) {
          console.log("Projeto sem personalização vinculada");
          setExistingData(null);
          setIsLoading(false);
          return;
        }

        // Fetch the personalization data
        const { data: personalization, error: personalizationError } = await supabase
          .from("site_personalizacoes")
          .select("*")
          .eq("id", project.personalization_id)
          .maybeSingle();

        if (personalizationError) {
          throw new Error(`Erro ao buscar personalização: ${personalizationError.message}`);
        }

        if (!personalization) {
          console.log("Personalização não encontrada");
          setExistingData(null);
          setIsLoading(false);
          return;
        }

        console.log("Dados de personalização encontrados:", personalization);

        // Generate signed URL for logo if exists
        let signedLogoUrl: string | null = null;
        if (personalization.logo_url) {
          signedLogoUrl = await getSignedUrl(personalization.logo_url, "site_personalizacoes");
          console.log("Logo signed URL:", signedLogoUrl);
        }

        // Generate signed URLs for midia_urls
        const signedMidiaUrls: Array<{ url: string; caption?: string }> = [];
        if (personalization.midia_urls && Array.isArray(personalization.midia_urls)) {
          for (const item of personalization.midia_urls) {
            try {
              let urlPath: string;
              let caption: string | undefined;

              // Handle both string and object formats
              if (typeof item === "string") {
                // Try to parse as JSON first
                try {
                  const parsed = JSON.parse(item);
                  if (parsed && typeof parsed === "object" && parsed.url) {
                    urlPath = parsed.url;
                    caption = parsed.caption;
                  } else {
                    urlPath = item;
                  }
                } catch {
                  urlPath = item;
                }
              } else if (typeof item === "object" && item !== null) {
                urlPath = (item as { url: string; caption?: string }).url;
                caption = (item as { url: string; caption?: string }).caption;
              } else {
                continue;
              }

              const signedUrl = await getSignedUrl(urlPath, "site_personalizacoes");
              if (signedUrl) {
                signedMidiaUrls.push({ url: signedUrl, caption });
              }
            } catch (err) {
              console.error("Erro ao gerar signed URL para mídia:", err);
            }
          }
        }
        console.log("Mídia signed URLs:", signedMidiaUrls);

        // Generate signed URLs for depoimento_urls
        const signedDepoimentoUrls: string[] = [];
        if (personalization.depoimento_urls && Array.isArray(personalization.depoimento_urls)) {
          for (const urlPath of personalization.depoimento_urls) {
            try {
              const signedUrl = await getSignedUrl(urlPath, "site_personalizacoes");
              if (signedUrl) {
                signedDepoimentoUrls.push(signedUrl);
              }
            } catch (err) {
              console.error("Erro ao gerar signed URL para depoimento:", err);
            }
          }
        }
        console.log("Depoimento signed URLs:", signedDepoimentoUrls);

        // Build the result object
        const result: ExistingPersonalizationData = {
          officenome: personalization.officenome || "",
          email: personalization.email || "",
          telefone: personalization.telefone || "",
          cnpj_cpf: personalization.cnpj_cpf || "",
          visao_missao_valores: personalization.visao_missao_valores || "",
          historia_empresa: personalization.historia_empresa || "",
          mercado_atuacao: personalization.mercado_atuacao || "",
          endereco: personalization.endereco || "",
          horario_funcionamento: personalization.horario_funcionamento || "",
          slogan: personalization.slogan || "",
          servicos: personalization.servicos || "",
          produtos: personalization.produtos || "",
          redessociais: personalization.redessociais || "",
          paletacores: personalization.paletacores || "",
          depoimentos: personalization.depoimentos || "",
          planos: personalization.planos || "",
          possuiplanos: personalization.possuiplanos || false,
          possuimapa: personalization.possuimapa || false,
          linkmapa: personalization.linkmapa || "",
          botaowhatsapp: personalization.botaowhatsapp !== false, // Default to true
          modelo: personalization.modelo || "",
          logo_url: signedLogoUrl,
          midia_urls: signedMidiaUrls,
          depoimento_urls: signedDepoimentoUrls,
        };

        setExistingData(result);
      } catch (err) {
        console.error("Erro ao buscar dados existentes:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [projectId]);

  return { existingData, isLoading, error };
}

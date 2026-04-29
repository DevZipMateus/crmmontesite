import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço para sincronização de rascunhos do formulário de personalização
 * vinculados ao form_hash do lead. Apenas dados de TEXTO são sincronizados
 * entre dispositivos — arquivos continuam apenas no localStorage local.
 */

export interface LeadFormDraft {
  form_hash: string;
  draft_data: Record<string, any>;
  updated_at: string;
}

/** Busca o rascunho salvo na nuvem para este form_hash, se existir. */
export async function getCloudDraft(formHash: string): Promise<LeadFormDraft | null> {
  if (!formHash) return null;
  try {
    const { data, error } = await supabase
      .from("lead_form_drafts")
      .select("form_hash, draft_data, updated_at")
      .eq("form_hash", formHash)
      .maybeSingle();

    if (error) {
      console.warn("[leadFormDraftService] erro ao buscar rascunho:", error.message);
      return null;
    }
    return data as LeadFormDraft | null;
  } catch (e) {
    console.warn("[leadFormDraftService] exceção ao buscar rascunho:", e);
    return null;
  }
}

/** Salva (upsert) o rascunho na nuvem. Não bloqueia a UI em caso de erro. */
export async function saveCloudDraft(
  formHash: string,
  draftData: Record<string, any>
): Promise<boolean> {
  if (!formHash) return false;
  try {
    const { error } = await supabase
      .from("lead_form_drafts")
      .upsert(
        {
          form_hash: formHash,
          draft_data: draftData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "form_hash" }
      );

    if (error) {
      console.warn("[leadFormDraftService] erro ao salvar rascunho:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[leadFormDraftService] exceção ao salvar rascunho:", e);
    return false;
  }
}

/** Apaga o rascunho da nuvem (chamado após envio bem-sucedido do formulário). */
export async function clearCloudDraft(formHash: string): Promise<void> {
  if (!formHash) return;
  try {
    await supabase.from("lead_form_drafts").delete().eq("form_hash", formHash);
  } catch (e) {
    console.warn("[leadFormDraftService] exceção ao apagar rascunho:", e);
  }
}

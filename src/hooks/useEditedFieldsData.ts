import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EditedFieldsData {
  edited_fields: string[] | null;
  last_edited_at: string | null;
  edit_count: number;
}

interface UseEditedFieldsDataResult {
  editData: EditedFieldsData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch edited fields data for a project's personalization
 */
export function useEditedFieldsData(
  personalizationId: string | null | undefined
): UseEditedFieldsDataResult {
  const [editData, setEditData] = useState<EditedFieldsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personalizationId) {
      setEditData(null);
      return;
    }

    const fetchEditData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("site_personalizacoes")
          .select("edited_fields, last_edited_at, edit_count")
          .eq("id", personalizationId)
          .maybeSingle();

        if (fetchError) {
          throw new Error(`Erro ao buscar dados de edição: ${fetchError.message}`);
        }

        if (data) {
          setEditData({
            edited_fields: data.edited_fields || null,
            last_edited_at: data.last_edited_at || null,
            edit_count: data.edit_count || 0,
          });
        } else {
          setEditData(null);
        }
      } catch (err) {
        console.error("Erro ao buscar dados de edição:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEditData();
  }, [personalizationId]);

  return { editData, isLoading, error };
}

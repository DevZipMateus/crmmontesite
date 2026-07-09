import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const seenKey = (projectId: string, tab: string) =>
  `project-tab-seen:${projectId}:${tab}`;

const getSeen = (projectId: string, tab: string): number => {
  const v = localStorage.getItem(seenKey(projectId, tab));
  return v ? parseInt(v, 10) : 0;
};

const setSeen = (projectId: string, tab: string) => {
  localStorage.setItem(seenKey(projectId, tab), Date.now().toString());
};

interface Options {
  projectId: string | undefined;
  personalizationId: string | null | undefined;
}

export function useProjectTabNotifications({ projectId, personalizationId }: Options) {
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [formChangesCount, setFormChangesCount] = useState(0);

  // --- Submissions: count new submissions since last seen ---
  const refreshSubmissions = useCallback(async () => {
    if (!projectId) return;
    const seen = getSeen(projectId, "submissions");
    const { data, error } = await supabase
      .from("client_media_submissions")
      .select("id, submission_date, created_at")
      .eq("project_id", projectId);

    if (error) return;
    const count = (data || []).filter((s: any) => {
      const t = new Date(s.submission_date || s.created_at).getTime();
      return t > seen;
    }).length;
    setSubmissionsCount(count);
  }, [projectId]);

  // --- Form changes: check personalization last_edited_at vs seen ---
  const refreshFormChanges = useCallback(async () => {
    if (!personalizationId) return;
    const { data } = await supabase
      .from("site_personalizacoes")
      .select("last_edited_at, edit_count, updated_at")
      .eq("id", personalizationId)
      .maybeSingle();

    if (!data || !projectId) return;
    const seen = getSeen(projectId, "form");
    const lastEdit = data.last_edited_at
      ? new Date(data.last_edited_at).getTime()
      : 0;
    setFormChangesCount(lastEdit > seen && (data.edit_count || 0) > 0 ? 1 : 0);
  }, [personalizationId, projectId]);

  useEffect(() => {
    refreshSubmissions();
    refreshFormChanges();
  }, [refreshSubmissions, refreshFormChanges]);

  // Realtime subscriptions
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`project-tab-notif-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_media_submissions",
          filter: `project_id=eq.${projectId}`,
        },
        (payload: any) => {
          toast.info("Novo envio do cliente recebido", {
            description: payload.new?.client_name
              ? `Cliente: ${payload.new.client_name}`
              : undefined,
          });
          refreshSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, refreshSubmissions]);

  useEffect(() => {
    if (!personalizationId) return;
    const channel = supabase
      .channel(`personalization-notif-${personalizationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_personalizacoes",
          filter: `id=eq.${personalizationId}`,
        },
        (payload: any) => {
          const oldEdit = payload.old?.edit_count || 0;
          const newEdit = payload.new?.edit_count || 0;
          if (newEdit > oldEdit) {
            toast.info("Formulário do cliente atualizado", {
              description: "Alterações foram detectadas no formulário.",
            });
          }
          refreshFormChanges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [personalizationId, refreshFormChanges]);

  const markSeen = useCallback(
    (tab: "submissions" | "form" | "info") => {
      if (!projectId) return;
      if (tab === "info" || tab === "form") {
        setSeen(projectId, "form");
        setFormChangesCount(0);
      } else if (tab === "submissions") {
        setSeen(projectId, "submissions");
        setSubmissionsCount(0);
      }
    },
    [projectId]
  );

  return { submissionsCount, formChangesCount, markSeen };
}

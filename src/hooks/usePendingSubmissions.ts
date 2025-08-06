
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePendingSubmissions(projectId: string) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from('client_media_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('status', 'pending');

        if (error) {
          console.error('Error fetching pending submissions:', error);
          return;
        }

        setPendingCount(count || 0);
      } catch (error) {
        console.error('Error fetching pending submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel(`pending-submissions-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_media_submissions',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { pendingCount, loading };
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Fetch personalization data by ID
export const fetchPersonalizationData = async (personalizationId: string) => {
  try {
    const { data, error } = await supabase
      .from('site_personalizacoes')
      .select('*')
      .eq('id', personalizationId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de personalização:', error);
    toast({
      title: "Erro ao buscar dados",
      description: "Não foi possível obter os dados de personalização.",
      variant: "destructive"
    });
    return null;
  }
};

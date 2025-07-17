
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "@/components/ui/use-toast";
import { Project } from "@/types/project";

// Function to get a project by ID
export async function getProjectById(id: string) {
  console.log("getProjectById: Iniciando busca do projeto com ID:", id);
  
  if (!id || id.trim() === '') {
    console.error("getProjectById: ID do projeto é inválido:", id);
    toast({
      title: "Erro de navegação",
      description: "ID do projeto não encontrado na URL",
      variant: "destructive",
    });
    throw new Error("ID do projeto é obrigatório");
  }

  try {
    console.log("getProjectById: Executando query no Supabase...");
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro quando não encontrar
    
    if (error) {
      console.error("getProjectById: Erro do Supabase:", error);
      toast({
        title: "Erro ao buscar projeto",
        description: `Erro do banco de dados: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
    
    if (!data) {
      console.error("getProjectById: Projeto não encontrado com ID:", id);
      toast({
        title: "Projeto não encontrado",
        description: "O projeto que você está tentando acessar não existe ou foi removido.",
        variant: "destructive",
      });
      throw new Error("Projeto não encontrado");
    }
    
    console.log("getProjectById: Projeto encontrado com sucesso:", data.client_name);
    return data as Project;
    
  } catch (error) {
    console.error("getProjectById: Erro geral na busca:", error);
    
    if (error instanceof Error) {
      // Se já é um erro conhecido, relançar
      if (error.message === "Projeto não encontrado" || error.message === "ID do projeto é obrigatório") {
        throw error;
      }
      
      toast({
        title: "Erro ao buscar projeto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro ao buscar projeto",
        description: "Ocorreu um erro desconhecido ao carregar o projeto.",
        variant: "destructive",
      });
    }
    
    throw error;
  }
}

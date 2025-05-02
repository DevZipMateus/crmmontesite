
import { useEffect } from "react";
import { useModelContext } from "./ModelContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

export const useAuthenticationCheck = () => {
  const { 
    setIsAuthenticated, 
    fetchModels, 
    setLoading, 
    setError,
    refreshAuth 
  } = useModelContext();
  const { toast } = useToast();
  
  const verifyAuthentication = async () => {
    try {
      setLoading(true);
      
      // Manually check auth status
      const isLoggedIn = await refreshAuth();
      
      if (isLoggedIn) {
        fetchModels();
        toast({
          title: "Sessão autenticada",
          description: "Você está autenticado como administrador",
        });
      } else {
        setIsAuthenticated(false);
        setError("Você precisa estar autenticado para gerenciar modelos.");
      }
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError("Erro ao verificar estado de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return { verifyAuthentication };
};

export default useAuthenticationCheck;

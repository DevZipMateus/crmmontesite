
import { useEffect } from "react";
import { useModelContext } from "./ModelContext";
import { useToast } from "@/hooks/use-toast";

export const useAuthenticationCheck = () => {
  const { 
    setIsAuthenticated, 
    fetchModels, 
    setLoading, 
    setError 
  } = useModelContext();
  const { toast } = useToast();
  
  const verifyAuthentication = () => {
    try {
      setLoading(true);
      // Check if user is authenticated using localStorage
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        setIsAuthenticated(true);
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

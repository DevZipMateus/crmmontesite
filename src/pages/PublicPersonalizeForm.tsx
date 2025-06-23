
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonalizeForm } from "@/components/site-personalize/PersonalizeForm";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";
import { LoadingState } from "@/components/site-personalize/LoadingState";
import { ErrorState } from "@/components/site-personalize/ErrorState";
import { useModelFromUrl } from "@/components/site-personalize/useModelFromUrl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, WifiOff, HelpCircle } from "lucide-react";

export default function PublicPersonalizeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { modelo: modeloParam } = useParams<{ modelo: string }>();
  const [searchParams] = useSearchParams();
  
  // Capturar hash da URL (opcional)
  const hashFromUrl = searchParams.get('hash');
  
  // State for connection errors
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  // Use the hook to load model data
  const { modeloSelecionado, modeloDetails, loading, error } = useModelFromUrl(modeloParam);

  // Handle successful form submission
  const handleFormSuccess = () => {
    console.log("📋 Form submitted successfully, redirecting to confirmation...");
    setNetworkError(null);
    
    // Immediate redirect
    navigate("/confirmacao", { replace: true });
    
    // Fallback redirect with timeout
    setTimeout(() => {
      if (window.location.pathname !== "/confirmacao") {
        console.log("🔄 Fallback redirect triggered");
        window.location.href = "/confirmacao";
      }
    }, 1000);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!modeloSelecionado) {
    return (
      <div className="text-center mt-8">
        Modelo não encontrado ou inválido.
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Personalize Seu Site</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo com as informações da sua empresa/escritório para personalizar seu site.
          </CardDescription>
          
          {modeloDetails && (
            <div className="pt-4">
              <ModeloDetails modelo={{
                id: modeloDetails.id,
                name: modeloDetails.name,
                description: modeloDetails.description,
                imageUrl: ""
              }} />
            </div>
          )}
        </CardHeader>
        
        {networkError && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                {networkError}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 bg-white" 
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent>
          <PersonalizeForm
            modeloSelecionado={modeloSelecionado}
            projectHash={hashFromUrl || undefined}
            onSuccess={handleFormSuccess}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="bg-gray-50 w-full p-4 rounded-md">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium">Precisa de ajuda com o formulário?</h4>
                <p className="text-muted-foreground mt-1">
                  Se estiver com problemas para enviar o formulário, veja estas dicas:
                </p>
                <ul className="list-disc pl-5 mt-2 text-muted-foreground space-y-1">
                  <li>Verifique sua conexão com a internet</li>
                  <li>Use nomes de arquivo simples sem caracteres especiais</li>
                  <li>Reduza o tamanho dos arquivos grandes</li>
                  <li>Tente usando um navegador diferente</li>
                  <li>Limpe o cache do seu navegador</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground text-center w-full">
            Powered by MonteSite CRM
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

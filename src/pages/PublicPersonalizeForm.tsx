
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { LoadingState } from "@/components/site-personalize/LoadingState";
import { ErrorState } from "@/components/site-personalize/ErrorState";
import { useModelFromUrl } from "@/components/site-personalize/useModelFromUrl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { FormValues } from "@/components/site-personalize/PersonalizeBasicForm";

export default function PublicPersonalizeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { modelo: modeloParam } = useParams<{ modelo: string }>();
  
  // State for form data to enable retry functionality
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [showRetryButton, setShowRetryButton] = useState(false);
  
  // Use the hook to load model data
  const { modeloSelecionado, modeloDetails, loading, error } = useModelFromUrl(modeloParam);

  // File state management - same as PersonalizeSite component
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // Initialize file upload handlers
  const fileHandlers = useFileUploadHandlers({
    setLogoFile,
    setLogoPreview,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews,
    setMidiaCaptions
  });

  // Initialize form submission handler with retry capability
  const { onSubmit, retrySubmit, isSubmitting } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions
  });

  // Wrapped onSubmit to save form data for retry
  const handleSubmit = async (data: FormValues) => {
    setFormData(data);
    
    try {
      await onSubmit(data);
      setShowRetryButton(false);
    } catch (error) {
      console.error("Form submission error in PublicPersonalizeForm:", error);
      setShowRetryButton(true);
    }
  };

  const handleRetry = async () => {
    if (formData) {
      try {
        await retrySubmit(formData);
        setShowRetryButton(false);
      } catch (error) {
        console.error("Form retry error:", error);
        // Show retry button kept on
      }
    } else {
      toast({
        title: "Erro",
        description: "Não há dados do formulário para reenviar. Por favor, preencha novamente.",
        variant: "destructive"
      });
    }
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
        
        {showRetryButton && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Houve um erro ao enviar o formulário. Verifique sua conexão e tente novamente.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 bg-white" 
                  onClick={handleRetry}
                  disabled={isSubmitting}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {isSubmitting ? "Reenviando..." : "Tentar Novamente"}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent>
          <PersonalizeForm
            modeloSelecionado={modeloSelecionado}
            logoPreview={logoPreview}
            depoimentoPreviews={depoimentoPreviews}
            midiaPreviews={midiaPreviews}
            midiaCaptions={midiaCaptions}
            isSubmitting={isSubmitting}
            handleLogoUpload={fileHandlers.handleLogoUpload}
            handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
            handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
            handleMidiaUpload={fileHandlers.handleMidiaUpload}
            handleRemoveMidia={fileHandlers.handleRemoveMidia}
            handleUpdateMidiaCaption={fileHandlers.handleUpdateMidiaCaption}
            onSubmit={handleSubmit}
          />
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Powered by MonteSite CRM
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

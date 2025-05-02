
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModelTemplateByCustomUrl } from "@/services/modelTemplateService";
import { findModeloByCustomUrl, modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";
import { Loader2 } from "lucide-react";

export default function PublicPersonalizeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { modelo: modeloParam } = useParams<{ modelo: string }>();
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File state management - same as PersonalizeSite component
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // Model state
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);

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

  // Initialize form submission handler
  const { onSubmit, isSubmitting } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions
  });

  // Handle model loading from URL parameter
  useEffect(() => {
    async function loadModel() {
      if (!modeloParam) {
        setModeloSelecionado("Modelo 1"); // Default model
        setLoading(false);
        return;
      }
      
      try {
        // First try to find the model in the database by custom URL
        const dbModel = await getModelTemplateByCustomUrl(modeloParam);
        
        if (dbModel) {
          setModeloSelecionado(dbModel.id);
          setLoading(false);
          return;
        }
        
        // If not found in DB, fallback to the static data (for backward compatibility)
        const staticModelId = findModeloByCustomUrl(modeloParam);
        
        if (staticModelId) {
          setModeloSelecionado(staticModelId);
        } else {
          // If still not found, check if the parameter itself is a valid model ID
          const modelExists = modelosDisponiveis.some(m => m.id === modeloParam);
          if (modelExists) {
            setModeloSelecionado(modeloParam);
          } else {
            setError(`Modelo não encontrado: ${modeloParam}`);
          }
        }
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Erro ao carregar modelo. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [modeloParam, toast]);

  // Get modelo details for display
  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p>Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
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
              <ModeloDetails modelo={modeloDetails} />
            </div>
          )}
        </CardHeader>
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
            onSubmit={onSubmit}
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

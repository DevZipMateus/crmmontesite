
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { FormValues } from "@/components/site-personalize/PersonalizeBasicForm";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";

export default function PersonalizeSite() {
  const { toast } = useToast();
  const location = useLocation();
  
  // File state management
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // Get modelo from URL parameter
  const queryParams = new URLSearchParams(location.search);
  const modeloParam = queryParams.get("modelo") || "";
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(modeloParam);

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

  useEffect(() => {
    if (modeloParam) {
      setModeloSelecionado(modeloParam);
    } else {
      toast({
        title: "Modelo não especificado",
        description: "Por favor, acesse esta página através de um link com o modelo especificado.",
        variant: "destructive",
      });
    }
  }, [modeloParam, toast]);

  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Personalize Seu Site</CardTitle>
          <CardDescription>
            {!modeloSelecionado 
              ? "Por favor, acesse esta página através de um link com o modelo especificado."
              : `Preencha o formulário abaixo com as informações do seu escritório contábil para personalizar seu site no modelo ${modeloSelecionado}.`}
          </CardDescription>
          <ModeloDetails modelo={modeloDetails} />
        </CardHeader>
        <CardContent>
          {modeloSelecionado ? (
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
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                É necessário especificar um modelo através da URL para continuar.
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Exemplo: /personalize-site?modelo=Modelo%201
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

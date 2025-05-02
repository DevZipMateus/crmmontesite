
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
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { LoadingState } from "@/components/site-personalize/LoadingState";
import { ErrorState } from "@/components/site-personalize/ErrorState";
import { useModelFromUrl } from "@/components/site-personalize/useModelFromUrl";

export default function PublicPersonalizeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { modelo: modeloParam } = useParams<{ modelo: string }>();
  
  // Use the hook to load model data
  const { modeloSelecionado, loading, error } = useModelFromUrl(modeloParam);

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

  // Initialize form submission handler
  const { onSubmit, isSubmitting } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions
  });

  // Get modelo details for display
  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

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

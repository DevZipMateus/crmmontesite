
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PersonalizeSite() {
  const { toast } = useToast();
  const location = useLocation();
  const params = useParams();
  
  // File state management
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // Get modelo from URL parameter or path parameter
  const queryParams = new URLSearchParams(location.search);
  const modeloParam = queryParams.get("modelo") || params.modelo || "";
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(modeloParam || "basic"); // Default to "basic" if no model specified

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
    }
  }, [modeloParam]);

  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

  const handleModeloChange = (value: string) => {
    setModeloSelecionado(value);
  };

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Personalize Seu Site</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo com as informações do seu escritório contábil para personalizar seu site.
          </CardDescription>
          
          <div className="pt-4">
            <label htmlFor="modelo-select" className="text-sm font-medium mb-2 block">
              Selecione um modelo:
            </label>
            <Select 
              value={modeloSelecionado || "basic"} 
              onValueChange={handleModeloChange}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelosDisponiveis.map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {modeloDetails && <ModeloDetails modelo={modeloDetails} />}
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
      </Card>
    </div>
  );
}

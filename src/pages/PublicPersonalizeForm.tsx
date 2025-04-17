
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";
import ModeloDetails from "@/components/site-personalize/ModeloDetails";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { Logo } from "@/components/ui/logo";

export default function PublicPersonalizeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  
  // File state management
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // Get modelo from URL parameter
  const modeloParam = params.modelo || "";
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(modeloParam || "modelo1");

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

  // Update modelo when URL parameter changes
  useEffect(() => {
    if (modeloParam) {
      const isValidModelo = modelosDisponiveis.some(m => m.id === modeloParam);
      if (isValidModelo) {
        setModeloSelecionado(modeloParam);
      } else {
        setModeloSelecionado("modelo1"); // Default if invalid model
        toast({
          title: "Modelo não encontrado",
          description: "O modelo especificado não existe. Utilizando o modelo padrão.",
          variant: "destructive",
        });
      }
    }
  }, [modeloParam, toast]);

  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

  // Custom submission handler for the public form 
  const handlePublicSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      // Navigate to a thank you page or show a thank you message
      toast({
        title: "Formulário enviado com sucesso!",
        description: "Obrigado por personalizar seu site. Entraremos em contato em breve.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container py-6 md:py-10 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold mt-4">Personalização de Site</h1>
          <p className="text-gray-500 mt-2">Preencha os detalhes abaixo para personalizar seu site</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl md:text-3xl font-bold">Modelo Selecionado: {modeloDetails?.name}</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo com as informações do seu escritório contábil para personalizar seu site.
            </CardDescription>
            
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
              onSubmit={handlePublicSubmit}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CRM Monte seu Site. Todos os direitos reservados.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

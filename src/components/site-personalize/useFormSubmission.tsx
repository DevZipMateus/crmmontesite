
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FormValues } from "./PersonalizeBasicForm";
import { SubmissionProps, UploadProgress } from "./types/submission";
import { submitPartnerClient } from "./services/partnerSubmissionService";
import { uploadFiles } from "./services/fileUploadService";
import { savePersonalizationData, createProject } from "./services/directClientService";

export const useFormSubmission = (props: SubmissionProps) => {
  const { 
    logoFile, 
    depoimentoFiles, 
    midiaFiles, 
    midiaCaptions = [], 
    modeloSelecionado, 
    projectHash, 
    hashFromUrl,
    onSuccess 
  } = props;
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  
  // Helper to handle upload progress
  const updateProgress = (fileType: string, index: number, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [`${fileType}_${index}`]: progress
    }));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    console.log("=== FORM SUBMISSION STARTED ===");
    const hash = projectHash || hashFromUrl;
    console.log("Hash from URL:", hash);
    console.log("Form data:", data);
    console.log("Submission type:", hash ? "Partner client (update existing)" : "Direct client (create new)");

    try {
      // Validate required fields
      if (!data.nome_empresa || !data.telefone || !data.email) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // FLUXO PARA CLIENTES DE PARCEIROS (COM HASH)
      if (hash) {
        await submitPartnerClient(data, modeloSelecionado || "Modelo 1", hash);

        toast({
          title: "Formulário enviado com sucesso!",
          description: "Suas informações foram processadas e o projeto foi atualizado.",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/confirmacao");
        }
        return;
      }

      // FLUXO PARA CLIENTES DIRETOS (SEM HASH) - CRIAR NOVO PROJETO
      console.log("🆕 Processing as direct client - creating new project");

      const formData = {
        ...data,
        modelo: modeloSelecionado || "Modelo 1",
        created_at: new Date().toISOString(),
      };

      console.log("Form data prepared for new project:", formData);
      
      // Upload all files
      const { logoUrl, depoimentoUrls, midiaItems } = await uploadFiles(
        logoFile,
        depoimentoFiles,
        midiaFiles,
        midiaCaptions,
        updateProgress,
        toast
      );

      // Save personalization data
      const personalizationId = await savePersonalizationData(
        formData,
        logoUrl,
        depoimentoUrls,
        midiaItems
      );

      // Create project
      await createProject(formData, personalizationId, toast);

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas e um projeto foi criado.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/confirmacao");
      }
    } catch (error) {
      console.error("💥 Form submission error:", error);
      
      let errorMessage = "Ocorreu um erro ao enviar o formulário. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check if it's a connectivity error
      if (errorMessage.toLowerCase().includes('failed to fetch') || 
          errorMessage.toLowerCase().includes('network error') ||
          errorMessage.toLowerCase().includes('connection')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const retrySubmit = async (data: FormValues) => {
    console.log("🔄 Retrying form submission...");
    await onSubmit(data);
  };

  return { 
    onSubmit, 
    retrySubmit, 
    isSubmitting, 
    uploadProgress 
  };
};

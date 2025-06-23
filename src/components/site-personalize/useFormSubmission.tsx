
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  
  // Helper to handle upload progress
  const updateProgress = (fileType: string, index: number, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [`${fileType}_${index}`]: progress
    }));
  };

  // Helper to redirect to confirmation with timeout
  const redirectToConfirmation = () => {
    console.log("🔄 Iniciando redirecionamento para página de confirmação...");
    
    if (onSuccess) {
      onSuccess();
    } else {
      // Redirecionamento imediato
      navigate("/confirmacao", { replace: true });
      
      // Fallback com timeout caso o redirecionamento não funcione
      setTimeout(() => {
        if (window.location.pathname !== "/confirmacao") {
          console.log("🔄 Redirecionamento de fallback ativado");
          window.location.href = "/confirmacao";
        }
      }, 1000);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Prevenir múltiplas submissões
    if (isSubmitting || isSubmitted) {
      console.log("⚠️ Submissão bloqueada - formulário já foi enviado");
      return;
    }

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

      let formProcessedSuccessfully = false;

      // FLUXO PARA CLIENTES DE PARCEIROS (COM HASH)
      if (hash) {
        console.log("📤 Processing partner client submission...");
        
        try {
          // Primeiro, criar os dados de personalização
          const result = await submitPartnerClient(data, modeloSelecionado || "Modelo 1", hash);
          formProcessedSuccessfully = true;
          
          // Se temos arquivos para upload e um personalization_id
          if ((logoFile || depoimentoFiles.length > 0 || midiaFiles.length > 0) && result.personalization_id) {
            console.log("📤 Uploading files for partner client...");
            
            try {
              await uploadFiles(
                logoFile,
                depoimentoFiles,
                midiaFiles,
                midiaCaptions,
                updateProgress,
                toast,
                result.personalization_id
              );
              console.log("✅ Files uploaded successfully");
            } catch (uploadError) {
              console.error("⚠️ File upload failed, but form was processed:", uploadError);
              // Não falhar a operação principal se o formulário foi processado
              toast({
                title: "Formulário enviado com avisos",
                description: "Suas informações foram processadas, mas alguns arquivos podem não ter sido enviados.",
                variant: "default",
              });
            }
          }

          // Marcar como enviado com sucesso
          setIsSubmitted(true);

          toast({
            title: "Formulário enviado com sucesso!",
            description: "Suas informações foram processadas e o projeto foi atualizado.",
          });

          // Redirecionar para confirmação
          redirectToConfirmation();
          return;

        } catch (partnerError) {
          console.error("❌ Partner client submission failed:", partnerError);
          
          // Se foi erro de formulário já enviado, ainda redirecionar para confirmação
          if (partnerError instanceof Error && 
              (partnerError.message.includes("já foi preenchido") || 
               partnerError.message.includes("already filled"))) {
            console.log("ℹ️ Form already filled, redirecting to confirmation");
            setIsSubmitted(true);
            redirectToConfirmation();
            return;
          }
          
          throw partnerError;
        }
      }

      // FLUXO PARA CLIENTES DIRETOS (SEM HASH) - CRIAR NOVO PROJETO
      console.log("🆕 Processing as direct client - creating new project");

      const formData = {
        ...data,
        modelo: modeloSelecionado || "Modelo 1",
        created_at: new Date().toISOString(),
      };

      console.log("Form data prepared for new project:", formData);
      
      try {
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
        formProcessedSuccessfully = true;

        // Marcar como enviado com sucesso
        setIsSubmitted(true);

        toast({
          title: "Personalização salva com sucesso!",
          description: "Suas informações foram enviadas e um projeto foi criado.",
        });

        // Redirecionar para confirmação
        redirectToConfirmation();

      } catch (directError) {
        console.error("❌ Direct client submission failed:", directError);
        throw directError;
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
    // Reset submitted state for retry
    setIsSubmitted(false);
    await onSubmit(data);
  };

  return { 
    onSubmit, 
    retrySubmit, 
    isSubmitting, 
    isSubmitted,
    uploadProgress 
  };
};


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FormValues } from "./PersonalizeBasicForm";
import { SubmissionProps, UploadProgress } from "./types/submission";
import { submitPartnerClient } from "./services/partnerSubmissionService";
import { uploadFiles } from "./services/fileUploadService";
import { savePersonalizationData, createProject } from "./services/directClientService";
import { supabase } from "@/integrations/supabase/client";

export const useFormSubmission = (props: SubmissionProps) => {
  const { 
    logoFile, 
    depoimentoFiles, 
    midiaFiles, 
    midiaCaptions = [], 
    modeloSelecionado, 
    projectHash, 
    hashFromUrl,
    onSuccess,
    leadFormHash
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

  // Helper to redirect to confirmation - SIMPLIFIED
  const redirectToConfirmation = () => {
    console.log("🔄 INICIANDO REDIRECIONAMENTO PARA CONFIRMAÇÃO");
    
    // Marcar como enviado ANTES do redirecionamento
    setIsSubmitted(true);
    
    // Usar callback se fornecido
    if (onSuccess) {
      console.log("📞 Chamando callback onSuccess");
      onSuccess();
      return;
    }
    
    // Redirecionamento direto com replace
    console.log("➡️ Redirecionando para /confirmacao");
    navigate("/confirmacao", { replace: true });
    
    // Fallback adicional para garantir redirecionamento
    setTimeout(() => {
      console.log("🔄 Verificando se redirecionamento funcionou...");
      if (window.location.pathname !== "/confirmacao") {
        console.log("⚠️ Redirecionamento falhou, usando window.location");
        window.location.href = "/confirmacao";
      }
    }, 500);
  };

  const onSubmit = async (data: FormValues) => {
    console.log("=== INÍCIO DA SUBMISSÃO DO FORMULÁRIO ===");
    console.log("Estados atuais:", { isSubmitting, isSubmitted });
    
    // Prevenir múltiplas submissões
    if (isSubmitting || isSubmitted) {
      console.log("⚠️ SUBMISSÃO BLOQUEADA - Formulário já processado");
      return;
    }

    setIsSubmitting(true);
    
    const hash = projectHash || hashFromUrl;
    console.log("Hash detectada:", hash);
    console.log("Lead form hash:", leadFormHash);
    console.log("Tipo de submissão:", leadFormHash ? "Lead form" : hash ? "Cliente de parceiro" : "Cliente direto");
    console.log("Dados do formulário:", data);

    try {
      // FLUXO PARA FORMULÁRIOS DE LEAD (COM leadFormHash)
      if (leadFormHash) {
        console.log("📤 Processando formulário de lead...");
        
        const leadFormData = {
          form_hash: leadFormHash,
          modelo: modeloSelecionado || "Modelo 1",
          email: data.email,
          officenome: data.nome_empresa,
          responsavelnome: data.nome_empresa,
          telefone: data.telefone,
          endereco: data.endereco,
          // Campos separados
          cnpj_cpf: data.cnpj_cpf || "",
          visao_missao_valores: data.visao_missao_valores || "",
          historia_empresa: data.historia_empresa || "",
          mercado_atuacao: data.mercado_atuacao || "",
          produtos: data.produtos || "",
          depoimentos: data.depoimentos || "",
          // Campos existentes
          descricao: data.visao_missao_valores || "",
          servicos: data.servicosOferecidos || "",
          redessociais: data.redes_sociais,
          slogan: data.slogan,
          paletacores: data.cores_preferidas,
          fonte: "",
          estilo_visual: "",
          possuiplanos: data.possuiPlanos,
          planos: data.planos,
          possuimapa: data.possuiMapa,
          linkmapa: data.linkMapa,
          horario_funcionamento: data.horario_funcionamento,
          botaowhatsapp: data.botaoWhatsapp
        };

        const response = await supabase.functions.invoke('receive-lead-form-data', {
          body: leadFormData
        });

        if (response.error) {
          throw new Error(response.error.message || 'Erro ao processar formulário');
        }

        const responseData = response.data;
        
        // Upload de arquivos se necessário
        if ((logoFile || depoimentoFiles.length > 0 || midiaFiles.length > 0) && responseData?.personalization_id) {
          console.log("📤 Fazendo upload de arquivos para lead...");
          
          try {
            await uploadFiles(
              logoFile,
              depoimentoFiles,
              midiaFiles,
              midiaCaptions,
              updateProgress,
              toast,
              responseData.personalization_id
            );
            console.log("✅ Upload de arquivos do lead concluído");
          } catch (uploadError) {
            console.error("⚠️ Erro no upload de arquivos:", uploadError);
            // Não falhar a operação principal se o formulário foi processado
          }
        }

        toast({
          title: "Formulário enviado com sucesso!",
          description: "Suas informações foram processadas e o projeto foi criado.",
        });

        console.log("🎯 Formulário de lead processado - redirecionando...");
        redirectToConfirmation();
        return;
      }
      // Validate required fields - VALIDAÇÃO REFORÇADA incluindo CNPJ/CPF obrigatório
      if (!data.nome_empresa || !data.telefone || !data.email || !data.cnpj_cpf || !data.visao_missao_valores || !data.historia_empresa || !data.mercado_atuacao) {
        const missingFields = [];
        if (!data.nome_empresa) missingFields.push("Nome da empresa");
        if (!data.telefone) missingFields.push("Telefone");
        if (!data.email) missingFields.push("Email");
        if (!data.cnpj_cpf) missingFields.push("CNPJ ou CPF");
        if (!data.visao_missao_valores) missingFields.push("Visão, missão e valores");
        if (!data.historia_empresa) missingFields.push("História da empresa");
        if (!data.mercado_atuacao) missingFields.push("Mercado de atuação");
        
        throw new Error(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(", ")}`);
      }

      // Validação adicional do CNPJ/CPF
      const cleanCnpjCpf = data.cnpj_cpf.replace(/\D/g, '');
      if (cleanCnpjCpf.length !== 11 && cleanCnpjCpf.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos");
      }

      let formProcessedSuccessfully = false;

      // FLUXO PARA CLIENTES DE PARCEIROS (COM HASH)
      if (hash) {
        console.log("📤 Processando cliente de parceiro...");
        
        try {
          const result = await submitPartnerClient(data, modeloSelecionado || "Modelo 1", hash);
          console.log("✅ Dados do parceiro processados com sucesso:", result);
          formProcessedSuccessfully = true;
          
          // Upload de arquivos se necessário
          if ((logoFile || depoimentoFiles.length > 0 || midiaFiles.length > 0) && result.personalization_id) {
            console.log("📤 Fazendo upload de arquivos...");
            
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
              console.log("✅ Upload de arquivos concluído");
            } catch (uploadError) {
              console.error("⚠️ Erro no upload de arquivos:", uploadError);
              // Não falhar a operação principal se o formulário foi processado
            }
          }

          toast({
            title: "Formulário enviado com sucesso!",
            description: "Suas informações foram processadas e o projeto foi atualizado.",
          });

          // REDIRECIONAMENTO GARANTIDO
          console.log("🎯 Formulário processado com sucesso - redirecionando...");
          redirectToConfirmation();
          return;

        } catch (partnerError) {
          console.error("❌ Erro na submissão do parceiro:", partnerError);
          
          // Se foi erro de formulário já enviado, ainda redirecionar
          if (partnerError instanceof Error && 
              (partnerError.message.includes("já foi preenchido") || 
               partnerError.message.includes("already filled") ||
               partnerError.message.includes("já foi processado"))) {
            console.log("ℹ️ Formulário já foi preenchido - redirecionando para confirmação");
            toast({
              title: "Formulário já processado",
              description: "Suas informações já foram recebidas anteriormente.",
            });
            redirectToConfirmation();
            return;
          }
          
          throw partnerError;
        }
      }

      // FLUXO PARA CLIENTES DIRETOS (SEM HASH)
      console.log("🆕 Processando cliente direto - criando novo projeto");

      const formData = {
        ...data,
        modelo: modeloSelecionado || "Modelo 1",
        created_at: new Date().toISOString(),
      };

      console.log("Dados preparados para novo projeto:", formData);
      
      try {
        // Upload de arquivos
        const { logoUrl, depoimentoUrls, midiaItems } = await uploadFiles(
          logoFile,
          depoimentoFiles,
          midiaFiles,
          midiaCaptions,
          updateProgress,
          toast
        );

        // Salvar dados de personalização
        const personalizationId = await savePersonalizationData(
          formData,
          logoUrl,
          depoimentoUrls,
          midiaItems
        );

        // Criar projeto
        await createProject(formData, personalizationId, toast);
        formProcessedSuccessfully = true;

        toast({
          title: "Personalização salva com sucesso!",
          description: "Suas informações foram enviadas e um projeto foi criado.",
        });

        // REDIRECIONAMENTO GARANTIDO
        console.log("🎯 Cliente direto processado com sucesso - redirecionando...");
        redirectToConfirmation();

      } catch (directError) {
        console.error("❌ Erro na submissão do cliente direto:", directError);
        throw directError;
      }

    } catch (error) {
      console.error("💥 Erro geral na submissão:", error);
      
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
      console.log("=== FIM DA SUBMISSÃO DO FORMULÁRIO ===");
    }
  };

  const retrySubmit = async (data: FormValues) => {
    console.log("🔄 Tentando reenviar formulário...");
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

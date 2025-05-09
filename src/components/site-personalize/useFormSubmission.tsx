
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FormValues } from "./PersonalizeBasicForm";
import { supabase } from "@/integrations/supabase/client";
import { uploadFileWithRetry } from "@/lib/file-upload-service";
import { sanitizeFileName } from "@/lib/sanitize-file";

export interface SubmissionProps {
  logoFile: File | null;
  depoimentoFiles: File[];
  midiaFiles: File[];
  midiaCaptions?: string[];
}

// Maximum file size in MB
const MAX_FILE_SIZE_MB = 10;

export const useFormSubmission = (props: SubmissionProps) => {
  const { logoFile, depoimentoFiles, midiaFiles, midiaCaptions = [] } = props;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // Helper to handle upload progress
  const updateProgress = (fileType: string, index: number, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [`${fileType}_${index}`]: progress
    }));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log("Starting form submission process...");

    try {
      // Validate required fields
      if (!data.officeNome || !data.responsavelNome || !data.telefone || 
          !data.email || !data.endereco || !data.descricao || !data.servicos) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      const formData = {
        ...data,
        modelo: data.modelo,
        created_at: new Date().toISOString(),
      };

      console.log("Form data prepared:", formData);
      console.log("Selected model:", data.modelo);
      
      // Process logo upload with retry
      let logoUrl = null;
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name);
        
        const { success, filePath, error } = await uploadFileWithRetry(logoFile, {
          folderPath: "logos",
          onProgress: (progress) => updateProgress("logo", 0, progress)
        });
        
        if (!success || !filePath) {
          console.error("Logo upload error:", error);
          throw new Error(`Erro ao fazer upload da logo: ${error?.message || 'Falha desconhecida'}`);
        }

        logoUrl = filePath;
        console.log("Logo uploaded successfully:", logoUrl);
      }

      // Process depoimento uploads with retry - Store as a string array
      const depoimentoUrls: string[] = [];
      for (let i = 0; i < depoimentoFiles.length; i++) {
        const file = depoimentoFiles[i];
        console.log("Uploading depoimento file:", file.name);
        
        try {
          const { success, filePath, error } = await uploadFileWithRetry(file, {
            folderPath: "depoimentos",
            onProgress: (progress) => updateProgress("depoimento", i, progress)
          });
          
          if (!success || !filePath) {
            console.error("Depoimento upload error:", error);
            throw error;
          }

          depoimentoUrls.push(filePath);
          console.log("Depoimento uploaded successfully:", filePath);
        } catch (fileError) {
          console.error("Error in depoimento upload:", fileError);
          // Continue with other files instead of failing completely
          toast({
            description: `Erro ao enviar ${file.name}. Tentando continuar com os outros arquivos.`,
            variant: "destructive",
          });
        }
      }

      // Process media items with captions and retry - Ensure they are stored as serialized JSON strings
      const midiaItems: string[] = [];
      
      for (let i = 0; i < midiaFiles.length; i++) {
        const file = midiaFiles[i];
        const caption = i < midiaCaptions.length ? midiaCaptions[i] : "";
        
        console.log(`Uploading midia file ${i+1}/${midiaFiles.length}:`, file.name, "Caption:", caption);
        
        try {
          const { success, filePath, error } = await uploadFileWithRetry(file, {
            folderPath: "midias",
            onProgress: (progress) => updateProgress("midia", i, progress)
          });
          
          if (!success || !filePath) {
            console.error("Midia upload error:", error);
            throw error;
          }

          // Create media object and serialize to JSON string
          const mediaItemObj = {
            url: filePath,
            caption: caption
          };
          
          // Serialize the object to a JSON string
          const serializedMediaItem = JSON.stringify(mediaItemObj);
          midiaItems.push(serializedMediaItem);
          
          console.log("Midia uploaded successfully with caption:", filePath, caption);
          console.log("Serialized media item:", serializedMediaItem);
        } catch (fileError) {
          console.error("Error in midia upload:", fileError);
          // Continue with other files instead of failing completely
          toast({
            description: `Erro ao enviar ${file.name}. Tentando continuar com os outros arquivos.`,
            variant: "destructive",
          });
        }
      }

      console.log("All files uploaded successfully, saving to database...");
      console.log("Depoimento URLs:", depoimentoUrls);
      console.log("Midia Items (serialized):", midiaItems);

      // Step 1: Insert into site_personalizacoes first to get the personalization ID
      const { data: personalizationData, error: personalizationError } = await supabase
        .from("site_personalizacoes")
        .insert({
          officenome: formData.officeNome,
          responsavelnome: formData.responsavelNome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          redessociais: formData.redesSociais,
          fonte: formData.fonte,
          paletacores: formData.paletaCores,
          descricao: formData.descricao,
          slogan: formData.slogan,
          possuiplanos: formData.possuiPlanos,
          planos: formData.planos,
          servicos: formData.servicos,
          depoimentos: formData.depoimentos,
          botaowhatsapp: formData.botaoWhatsapp,
          possuimapa: formData.possuiMapa,
          linkmapa: formData.linkMapa,
          modelo: formData.modelo,
          logo_url: logoUrl,
          depoimento_urls: depoimentoUrls.length > 0 ? depoimentoUrls : null,
          midia_urls: midiaItems.length > 0 ? midiaItems : null,
          created_at: formData.created_at
        })
        .select();

      if (personalizationError) {
        console.error("Personalization error:", personalizationError);
        throw new Error(`Erro ao salvar personalização: ${personalizationError.message}`);
      }

      console.log("Personalization saved successfully:", personalizationData);
      const personalizationId = personalizationData[0].id;

      // Step 2: Create project with reference to the personalization using personalization_id field
      try {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .insert({
            client_name: formData.officeNome,
            responsible_name: formData.responsavelNome,
            template: formData.modelo,
            status: "Recebido",
            client_type: "cliente_final",
            personalization_id: personalizationId
          })
          .select();

        if (projectError) {
          console.error("Project creation error:", projectError);
          // We don't throw here because the personalization was successful
          toast({
            title: "Aviso",
            description: "Sua personalização foi salva, mas houve um problema na criação do projeto.",
          });
        } else {
          console.log("Project created successfully:", projectData);
        }
      } catch (projectError) {
        console.error("Project creation exception:", projectError);
        // We don't throw here because the personalization was successful
      }

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas e um projeto foi criado.",
      });

      navigate("/confirmacao");
    } catch (error) {
      console.error("Form submission error:", error);
      
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
    console.log("Retrying form submission...");
    await onSubmit(data);
  };

  return { 
    onSubmit, 
    retrySubmit, 
    isSubmitting, 
    uploadProgress 
  };
};

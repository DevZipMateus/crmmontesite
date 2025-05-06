
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { FormValues } from "./PersonalizeBasicForm";
import { supabase } from "@/integrations/supabase/client";

export interface SubmissionProps {
  logoFile: File | null;
  depoimentoFiles: File[];
  midiaFiles: File[];
  midiaCaptions?: string[];
}

export const useFormSubmission = (props: SubmissionProps) => {
  const { logoFile, depoimentoFiles, midiaFiles, midiaCaptions = [] } = props;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData = {
        ...data,
        modelo: data.modelo,
        created_at: new Date().toISOString(),
      };

      // Process file uploads
      let logoUrl = null;
      if (logoFile) {
        const fileName = `logos/${Date.now()}_${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, logoFile);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da logo: ${uploadError.message}`);
        }

        logoUrl = fileName;
      }

      const depoimentoUrls: string[] = [];
      for (const file of depoimentoFiles) {
        const fileName = `depoimentos/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de depoimento: ${uploadError.message}`);
        }

        depoimentoUrls.push(fileName);
      }

      // Process media items with captions
      const midiaItems = [];
      
      for (let i = 0; i < midiaFiles.length; i++) {
        const file = midiaFiles[i];
        const caption = i < midiaCaptions.length ? midiaCaptions[i] : "";
        
        const fileName = `midias/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de mídia: ${uploadError.message}`);
        }

        midiaItems.push({
          url: fileName,
          caption: caption
        });
      }

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
        throw personalizationError;
      }

      const personalizationId = personalizationData[0].id;

      // Step 2: Create project with reference to the personalization using personalization_id field
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_name: formData.officeNome,
          responsible_name: formData.responsavelNome,
          template: formData.modelo,
          status: "Recebido",
          client_type: "cliente_final",
          personalization_id: personalizationId  // Use the new personalization_id field
        })
        .select();

      if (projectError) {
        console.error("Erro ao criar projeto automático:", projectError);
      } else {
        console.log("Projeto criado automaticamente com referência à personalização:", projectData);
      }

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas e um projeto foi criado.",
      });

      navigate("/confirmacao");
    } catch (error) {
      console.error("Erro ao salvar personalização:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { onSubmit, isSubmitting };
};

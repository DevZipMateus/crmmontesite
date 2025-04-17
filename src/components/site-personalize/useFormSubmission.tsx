
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { FormValues } from "./PersonalizeBasicForm";

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
      const supabase = getSupabaseClient();

      const formData = {
        ...data,
        modelo: data.modelo,
        created_at: new Date().toISOString(),
      };

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

      // Create an array to store media items with captions
      const midiaItems: { url: string; caption: string }[] = [];
      
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

      const { data: insertData, error: insertError } = await supabase
        .from("site_personalizacoes")
        .insert([{
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
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([{
          client_name: formData.officeNome,
          responsible_name: formData.responsavelNome,
          template: formData.modelo,
          status: "Recebido",
          client_type: "cliente_final"
        }])
        .select();

      if (projectError) {
        console.error("Erro ao criar projeto automático:", projectError);
      } else {
        console.log("Projeto criado automaticamente:", projectData);
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

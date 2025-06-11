
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../PersonalizeBasicForm";

export const savePersonalizationData = async (
  formData: any,
  logoUrl: string | null,
  depoimentoUrls: string[],
  midiaItems: string[]
) => {
  console.log("✅ All files uploaded successfully, saving to database...");
  
  const { data: personalizationData, error: personalizationError } = await supabase
    .from("site_personalizacoes")
    .insert({
      officenome: formData.nome_empresa,
      responsavelnome: formData.nome_empresa,
      telefone: formData.telefone,
      email: formData.email,
      endereco: formData.endereco || "",
      redessociais: formData.redes_sociais || "",
      fonte: "",
      paletacores: formData.cores_preferidas || "",
      descricao: formData.sobre_empresa || "",
      slogan: "",
      possuiplanos: formData.possuiPlanos || false,
      planos: formData.planos || "",
      servicos: formData.servicos || "",
      depoimentos: formData.depoimentos || "",
      botaowhatsapp: formData.botaoWhatsapp || false,
      possuimapa: formData.possuiMapa || false,
      linkmapa: formData.linkMapa || "",
      modelo: formData.modelo,
      logo_url: logoUrl,
      depoimento_urls: depoimentoUrls.length > 0 ? depoimentoUrls : null,
      midia_urls: midiaItems.length > 0 ? midiaItems : null,
      created_at: formData.created_at
    })
    .select();

  if (personalizationError) {
    console.error("❌ Personalization error:", personalizationError);
    throw new Error(`Erro ao salvar personalização: ${personalizationError.message}`);
  }

  console.log("✅ Personalization saved successfully:", personalizationData);
  return personalizationData[0].id;
};

export const createProject = async (formData: any, personalizationId: string, toast: any) => {
  try {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert({
        client_name: formData.nome_empresa,
        responsible_name: formData.nome_empresa,
        template: formData.modelo,
        status: "Recebido",
        client_type: "cliente_final",
        personalization_id: personalizationId
      })
      .select();

    if (projectError) {
      console.error("❌ Project creation error:", projectError);
      toast({
        title: "Aviso",
        description: "Sua personalização foi salva, mas houve um problema na criação do projeto.",
      });
    } else {
      console.log("✅ Project created successfully:", projectData);
    }
  } catch (projectError) {
    console.error("❌ Project creation exception:", projectError);
  }
};

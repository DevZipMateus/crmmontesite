
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
      descricao: `${formData.visao_missao_valores || ""} | ${formData.historia_empresa || ""} | ${formData.mercado_atuacao || ""}`,
      slogan: formData.slogan || "",
      horario_funcionamento: formData.horario_funcionamento || "",
      possuiplanos: formData.possuiPlanos || false,
      planos: formData.planos || "",
      servicos: [
        formData.possuiProdutos && formData.produtos ? `Produtos: ${formData.produtos}` : '',
        formData.servicosOferecidos ? `Serviços: ${formData.servicosOferecidos}` : '',
        formData.possuiPlanos && formData.planos ? `Planos: ${formData.planos}` : ''
      ].filter(Boolean).join(' | ') || "",
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
  console.log("🔄 Creating project for personalization:", personalizationId);
  
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      client_name: formData.nome_empresa,
      responsible_name: formData.nome_empresa,
      template: formData.modelo,
      status: "Recebido",
      client_type: "cliente_final",
      personalization_id: personalizationId,
      cnpj: formData.cnpj_cpf || null,
      telefone: formData.telefone || null
    })
    .select();

  if (projectError) {
    console.error("❌ CRITICAL: Project creation failed:", projectError);
    toast({
      title: "Erro Crítico",
      description: "Falha ao criar projeto. O formulário não será processado corretamente.",
      variant: "destructive"
    });
    throw new Error(`Falha crítica na criação do projeto: ${projectError.message}`);
  }

  if (!projectData || projectData.length === 0) {
    console.error("❌ CRITICAL: Project created but no data returned");
    toast({
      title: "Erro Crítico", 
      description: "Projeto criado mas dados não retornados. Contate o suporte.",
      variant: "destructive"
    });
    throw new Error("Projeto criado mas dados não retornados");
  }

  console.log("✅ Project created successfully:", projectData[0]);
  return projectData[0];
};

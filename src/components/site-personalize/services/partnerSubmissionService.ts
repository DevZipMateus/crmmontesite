
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../PersonalizeBasicForm";

export const submitPartnerClient = async (
  data: FormValues, 
  modeloSelecionado: string, 
  projectHash: string
) => {
  console.log("🔄 Processing as partner client with hash:", projectHash);
  
  // Primeiro, buscar o projeto para obter ID
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('partner_hash', projectHash)
    .single();

  if (projectError || !project) {
    throw new Error(`Projeto não encontrado para hash: ${projectHash}`);
  }

  // Criar dados de personalização estruturados
  const personalizationData = {
    officenome: data.nome_empresa,
    responsavelnome: data.nome_empresa,
    telefone: data.telefone,
    email: data.email,
    endereco: data.endereco || "",
    redessociais: data.redes_sociais || "",
    fonte: "",
    paletacores: data.cores_preferidas || "",
    descricao: data.sobre_empresa || "",
    slogan: "", // Extraído das observações se fornecido
    possuiplanos: data.possuiPlanos || false,
    planos: data.planos || "",
    servicos: data.servicos || "",
    depoimentos: data.depoimentos || "",
    botaowhatsapp: data.botaoWhatsapp || false,
    possuimapa: data.possuiMapa || false,
    linkmapa: data.linkMapa || "",
    modelo: modeloSelecionado || "Modelo 1",
    logo_url: null, // Será atualizado após upload
    depoimento_urls: null, // Será atualizado após upload
    midia_urls: null, // Será atualizado após upload
    created_at: new Date().toISOString()
  };

  console.log("📝 Creating personalization data:", personalizationData);

  // Inserir dados de personalização
  const { data: personalizationResult, error: personalizationError } = await supabase
    .from("site_personalizacoes")
    .insert(personalizationData)
    .select()
    .single();

  if (personalizationError) {
    console.error("❌ Error creating personalization:", personalizationError);
    throw new Error(`Erro ao criar personalização: ${personalizationError.message}`);
  }

  console.log("✅ Personalization created:", personalizationResult);

  // Preparar observações estruturadas (mantém compatibilidade)
  const observacoes = data.sobre_empresa + 
    (data.servicos ? ` | Serviços: ${data.servicos}` : '') +
    (data.depoimentos ? ` | Depoimentos: ${data.depoimentos}` : '') +
    (data.planos ? ` | Planos: ${data.planos}` : '');

  // Preparar dados para o endpoint receive-form-data
  const formPayload = {
    modelo: modeloSelecionado || "Modelo 1",
    observacoes: observacoes,
    email: data.email,
    hash: projectHash
  };

  console.log("📤 Sending to receive-form-data endpoint:");
  console.log("Payload:", formPayload);

  // Chamar a edge function para atualizar projeto existente
  const { data: result, error } = await supabase.functions.invoke('receive-form-data', {
    body: formPayload
  });

  console.log("📥 Response from receive-form-data:");
  console.log("Result:", result);
  console.log("Error:", error);

  if (error) {
    console.error("❌ Error from receive-form-data:", error);
    throw new Error(`Erro ao processar formulário: ${error.message}`);
  }

  // Atualizar projeto com personalization_id
  const { error: updateError } = await supabase
    .from('projects')
    .update({ 
      personalization_id: personalizationResult.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', project.id);

  if (updateError) {
    console.error("❌ Error updating project with personalization_id:", updateError);
    // Não vamos falhar aqui, apenas logar o erro
  }

  console.log("✅ Partner project updated successfully:", result);
  return {
    ...result,
    personalization_id: personalizationResult.id
  };
};

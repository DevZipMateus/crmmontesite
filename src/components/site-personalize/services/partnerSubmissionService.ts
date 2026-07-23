
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../PersonalizeBasicForm";
import { buildEnderecoCompleto } from "@/utils/enderecoUtils";

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
    endereco: data.endereco || buildEnderecoCompleto(data as any),
    cep: data.cep || null,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    complemento: data.complemento || null,
    bairro: data.bairro || null,
    cidade: data.cidade || null,
    estado: data.estado || null,
    redessociais: data.redes_sociais || "",
    fonte: "",
    paletacores: data.cores_preferidas || "",
    // Campos separados
    cnpj_cpf: data.cnpj_cpf || "",
    visao_missao_valores: data.visao_missao_valores || "",
    historia_empresa: data.historia_empresa || "",
    mercado_atuacao: data.mercado_atuacao || "",
    produtos: data.produtos || "",
    // Manter descricao concatenada para compatibilidade
    descricao: `${data.visao_missao_valores || ""} | ${data.historia_empresa || ""} | ${data.mercado_atuacao || ""}`,
    slogan: data.slogan || "",
    horario_funcionamento: data.horario_funcionamento || "",
    possuiplanos: data.possuiPlanos || false,
    planos: data.planos || "",
    servicos: [
      data.possuiProdutos && data.produtos ? `Produtos: ${data.produtos}` : '',
      data.servicosOferecidos ? `Serviços: ${data.servicosOferecidos}` : '',
      data.possuiPlanos && data.planos ? `Planos: ${data.planos}` : ''
    ].filter(Boolean).join(' | ') || "",
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
  const servicosCompletos = [
    data.possuiProdutos && data.produtos ? `Produtos: ${data.produtos}` : '',
    data.servicosOferecidos ? `Serviços: ${data.servicosOferecidos}` : '',
    data.possuiPlanos && data.planos ? `Planos: ${data.planos}` : ''
  ].filter(Boolean).join(' | ');
  
  const observacoes = `${data.visao_missao_valores || ""} | ${data.historia_empresa || ""} | ${data.mercado_atuacao || ""}` + 
    (servicosCompletos ? ` | ${servicosCompletos}` : '') +
    (data.depoimentos ? ` | Depoimentos: ${data.depoimentos}` : '') +
    (data.slogan ? ` | Slogan: ${data.slogan}` : '');

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

  // Atualizar projeto com personalization_id, CNPJ e telefone
  const { error: updateError } = await supabase
    .from('projects')
    .update({ 
      personalization_id: personalizationResult.id,
      cnpj: data.cnpj_cpf || null,
      telefone: data.telefone || null,
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

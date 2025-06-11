
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../PersonalizeBasicForm";

export const submitPartnerClient = async (
  data: FormValues, 
  modeloSelecionado: string, 
  projectHash: string
) => {
  console.log("🔄 Processing as partner client with hash:", projectHash);
  
  // Preparar dados para o endpoint receive-form-data
  const formPayload = {
    modelo: modeloSelecionado || "Modelo 1",
    observacoes: data.sobre_empresa + (data.servicos ? ` | Serviços: ${data.servicos}` : '') +
                (data.depoimentos ? ` | Depoimentos: ${data.depoimentos}` : '') +
                (data.planos ? ` | Planos: ${data.planos}` : ''),
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

  console.log("✅ Partner project updated successfully:", result);
  return result;
};

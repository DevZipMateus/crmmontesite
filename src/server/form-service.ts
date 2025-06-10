
import { supabase } from "@/integrations/supabase/client";

export interface FormData {
  modelo: string;
  observacoes?: string;
  email?: string;
  hash: string;
}

export async function processFormData(formData: FormData) {
  try {
    const response = await supabase.functions.invoke('receive-form-data', {
      body: formData
    });

    if (response.error) {
      throw new Error(response.error.message || 'Erro ao processar formulário');
    }

    const result = response.data;
    console.log('Form data processed:', result);
    return result;
  } catch (error) {
    console.error('Error processing form data:', error);
    throw error;
  }
}

// Função helper para gerar URL do formulário
export function generateFormUrl(hash: string): string {
  return `https://montesite.com.br/${hash}`;
}

// Função para verificar se projeto tem formulário preenchido
export function hasFormCompleted(project: any): boolean {
  return project.formulario_preenchido === true && !!project.modelo_escolhido;
}

// Função para obter status do formulário
export function getFormStatus(project: any): 'pending' | 'completed' | 'not_applicable' {
  if (!project.partner_hash) return 'not_applicable';
  if (hasFormCompleted(project)) return 'completed';
  return 'pending';
}

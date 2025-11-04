import { supabase } from "@/integrations/supabase/client";

export interface LeadFormData {
  form_hash: string;
  modelo: string;
  observacoes?: string;
  email?: string;
  // Dados completos do formulário
  officenome: string;
  responsavelnome: string;
  telefone: string;
  endereco: string;
  descricao: string;
  servicos: string;
  redessociais?: string;
  slogan?: string;
  paletacores?: string;
  fonte?: string;
  estilo_visual?: string;
  possuiplanos?: boolean;
  planos?: string;
  possuimapa?: boolean;
  linkmapa?: string;
  horario_funcionamento?: string;
  botaowhatsapp?: boolean;
}

/**
 * Processa dados do formulário de lead
 */
export async function processLeadFormData(formData: LeadFormData) {
  try {
    const response = await supabase.functions.invoke('receive-lead-form-data', {
      body: formData
    });

    if (response.error) {
      throw new Error(response.error.message || 'Erro ao processar formulário');
    }

    const result = response.data;
    console.log('Lead form data processed:', result);
    return result;
  } catch (error) {
    console.error('Error processing lead form data:', error);
    throw error;
  }
}

/**
 * Gera hash para lead (se não existir)
 */
export async function generateLeadFormHash(leadId: string): Promise<string> {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('form_hash')
      .eq('id', leadId)
      .single();

    if (error) throw error;

    // Se já tem hash, retorna
    if (lead.form_hash) {
      return lead.form_hash;
    }

    // Gerar novo hash
    const newHash = generateRandomHash();
    
    const { error: updateError } = await supabase
      .from('leads')
      .update({ form_hash: newHash })
      .eq('id', leadId);

    if (updateError) throw updateError;

    return newHash;
  } catch (error) {
    console.error('Error generating lead form hash:', error);
    throw error;
  }
}

/**
 * Busca lead pelo form_hash
 */
export async function getLeadByFormHash(hash: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('form_hash', hash)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lead by form hash:', error);
    return null;
  }
}

/**
 * Gera URL do formulário para o lead
 */
export function generateLeadFormUrl(hash: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/formulario/lead/${hash}`;
}

/**
 * Verifica status do formulário (preenchido ou pendente)
 */
export async function checkLeadFormStatus(leadId: string): Promise<'completed' | 'pending'> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('project_id')
      .eq('id', leadId)
      .single();

    if (error) throw error;
    
    return data.project_id ? 'completed' : 'pending';
  } catch (error) {
    console.error('Error checking lead form status:', error);
    return 'pending';
  }
}

/**
 * Gera hash aleatório (16 bytes em hexadecimal = 32 caracteres)
 */
function generateRandomHash(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

import { supabase } from "@/integrations/supabase/client";

export async function processWebhookQueue() {
  try {
    const response = await supabase.functions.invoke('send-status-webhook', {
      body: {}
    });

    if (response.error) {
      throw new Error(response.error.message || 'Erro ao processar webhooks');
    }

    const result = response.data;
    console.log('Webhook queue processed:', result);
    return result;
  } catch (error) {
    console.error('Error processing webhook queue:', error);
    throw error;
  }
}

export async function createPartnerProject(partnerData: {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  hash: string;
}) {
  try {
    const response = await supabase.functions.invoke('receive-partner-data', {
      body: partnerData
    });

    if (response.error) {
      throw new Error(response.error.message || 'Erro ao criar projeto do parceiro');
    }

    const result = response.data;
    console.log('Partner project created:', result);
    return result;
  } catch (error) {
    console.error('Error creating partner project:', error);
    throw error;
  }
}

// Função para marcar projetos de parceiros visualmente
export function isPartnerProject(project: any): boolean {
  return project.project_source === 'parceiro' || !!project.partner_hash;
}

// Função para obter o nome do parceiro
export async function getPartnerName(hash: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('name')
      .eq('hash', hash)
      .single();

    if (error || !data) return null;
    return data.name;
  } catch (error) {
    console.error('Error fetching partner name:', error);
    return null;
  }
}

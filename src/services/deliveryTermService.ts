import { supabase } from "@/integrations/supabase/client";
import { DeliveryTerm } from "@/types/deliveryTerm";

// Gerar hash único para o termo de entrega
export const generateTermHash = (): string => {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
};

// Buscar projeto pelo hash do termo
export const getProjectByTermHash = async (hash: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, client_name, domain, delivery_term_hash')
    .eq('delivery_term_hash', hash)
    .single();

  if (error) throw error;
  return data;
};

// Verificar se termo já foi preenchido para um projeto
export const checkTermExists = async (projectId: string): Promise<DeliveryTerm | null> => {
  const { data, error } = await supabase
    .from('delivery_terms')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  return data as DeliveryTerm | null;
};

// Submeter termo de entrega
export const submitDeliveryTerm = async (data: {
  project_id: string;
  nota_atendimento: number;
  comentarios?: string;
  nome_completo: string;
  cpf: string;
}) => {
  const { data: result, error } = await supabase
    .from('delivery_terms')
    .insert({
      project_id: data.project_id,
      nota_atendimento: data.nota_atendimento,
      comentarios: data.comentarios || null,
      nome_completo: data.nome_completo,
      cpf: data.cpf,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

// Atualizar hash do projeto para gerar link
export const updateProjectTermHash = async (projectId: string) => {
  const hash = generateTermHash();
  
  const { data, error } = await supabase
    .from('projects')
    .update({ delivery_term_hash: hash })
    .eq('id', projectId)
    .select('delivery_term_hash')
    .single();

  if (error) throw error;
  return data.delivery_term_hash;
};

// Buscar todos os projetos com status do termo
export const getAllProjectsWithTermStatus = async () => {
  // Buscar projetos
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, client_name, domain, delivery_term_hash')
    .order('created_at', { ascending: false });

  if (projectsError) throw projectsError;

  // Buscar todos os termos
  const { data: terms, error: termsError } = await supabase
    .from('delivery_terms')
    .select('*');

  if (termsError) throw termsError;

  // Combinar dados
  const projectsWithTerms = projects.map(project => ({
    ...project,
    delivery_term: terms.find(t => t.project_id === project.id) || null,
  }));

  return projectsWithTerms;
};

// Buscar termo por ID do projeto
export const getTermByProjectId = async (projectId: string): Promise<DeliveryTerm | null> => {
  const { data, error } = await supabase
    .from('delivery_terms')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  return data as DeliveryTerm | null;
};

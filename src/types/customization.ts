
export type CustomizationStatus = 'Solicitado' | 'Em andamento' | 'Concluído' | 'Cancelado';
export type CustomizationPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface ProjectCustomization {
  id: string;
  project_id: string;
  description: string;
  status: CustomizationStatus;
  priority: CustomizationPriority;
  requested_at: string;
  completed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

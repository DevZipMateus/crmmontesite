export interface SalesLandingPage {
  id: string;
  nome_completo: string;
  email_profissional: string;
  telefone_whatsapp: string;
  foto_profissional_url?: string;
  area_atuacao: string;
  cidade_regiao?: string;
  mini_bio: string;
  slogan?: string;
  redes_sociais?: string;
  principais_servicos: string;
  diferenciais?: string;
  cores_preferidas?: string;
  estilo_visual?: string;
  status: string;
  comando_gerado: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesLandingPageInsert {
  nome_completo: string;
  email_profissional: string;
  telefone_whatsapp: string;
  foto_profissional_url?: string;
  area_atuacao: string;
  cidade_regiao?: string;
  mini_bio: string;
  slogan?: string;
  redes_sociais?: string;
  principais_servicos: string;
  diferenciais?: string;
  cores_preferidas?: string;
  estilo_visual?: string;
}
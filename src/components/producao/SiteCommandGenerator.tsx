
import React from "react";
import { Project } from "@/types/project";
import { fetchPersonalizationData } from "@/services/personalizationService";
import { formatBooleanField, formatArrayField, formatTextField } from "@/utils/formatters";
import { isPartnerProject } from "@/server/webhook-service";

export interface SiteCommandGeneratorProps {
  project: Project;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedText: (text: string) => void;
}

/**
 * Extrai informações estruturadas do campo observacoes_cliente
 */
const parseObservacoes = (observacoes: string | null) => {
  if (!observacoes) return {};
  
  const data: { [key: string]: string } = {};
  
  // Split por " | " para separar os campos
  const sections = observacoes.split(' | ');
  
  sections.forEach(section => {
    if (section.includes(':')) {
      const [key, ...valueParts] = section.split(':');
      const value = valueParts.join(':').trim();
      
      if (key.toLowerCase().includes('serviços') || key.toLowerCase().includes('servicos')) {
        data.servicos = value;
      } else if (key.toLowerCase().includes('depoimento')) {
        data.depoimentos = value;
      } else if (key.toLowerCase().includes('plano')) {
        data.planos = value;
      } else if (key.toLowerCase().includes('slogan')) {
        data.slogan = value;
      }
    }
  });
  
  return data;
};

/**
 * Gera comando para projetos de parceiros usando dados da tabela projects
 */
const generatePartnerCommand = (project: Project) => {
  const observacoesData = parseObservacoes(project.observacoes_cliente);
  
  return `Vou lhe mantar as informações de uma empresa para implementar nesse layout. Otimize o site para SEO e cuide para não quebrar no mobile e deixar rolagem na horizontal. Mantenha responsivo.
Logo é a imagem que lhe envio 
Paleta de cores use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco

## INFORMAÇÕES BÁSICAS DA EMPRESA
Nome da empresa: ${project.client_name || 'Não informado'}
Responsável: ${project.responsible_name || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}
Telefone: ${project.telefone || 'Não informado'}
Email: ${project.email_complementar || 'Não informado'}
CNPJ: ${project.cnpj || 'Não informado'}

## MODELO E PERSONALIZAÇÃO
Modelo escolhido: ${project.modelo_escolhido || 'Não informado'}
${observacoesData.slogan ? `Slogan: ${observacoesData.slogan}` : ''}

## SERVIÇOS E CONTEÚDO
${observacoesData.servicos ? `Serviços: ${observacoesData.servicos}` : 'Serviços: Não informado'}
${observacoesData.depoimentos ? `Depoimentos: ${observacoesData.depoimentos}` : ''}
${observacoesData.planos ? `Planos: ${observacoesData.planos}` : ''}

## STATUS DO FORMULÁRIO
Formulário preenchido: ${project.formulario_preenchido ? 'Sim' : 'Não'}
${project.data_formulario ? `Data do preenchimento: ${new Date(project.data_formulario).toLocaleDateString('pt-BR')}` : ''}

## OBSERVAÇÕES COMPLETAS
${project.observacoes_cliente || 'Nenhuma observação adicional'}`;
};

/**
 * Generates a detailed command for site implementation based on project and personalization data
 */
export const generateSiteCommand = async ({ 
  project, 
  setIsGenerating, 
  setGeneratedText 
}: SiteCommandGeneratorProps) => {
  setIsGenerating(true);
  
  try {
    // Verifica se é um projeto de parceiro
    if (isPartnerProject(project)) {
      const partnerCommandText = generatePartnerCommand(project);
      setGeneratedText(partnerCommandText);
      return;
    }
    
    // Verifica se o projeto tem um ID de personalização
    if (!project.personalization_id) {
      // Se não tiver, gera comando básico como antes
      const basicCommandText = `Vou lhe mantar as informações de uma empresa para implementar nesse layout. Otimize o site para SEO e cuide para não quebrar no mobile e deixar rolagem na horizontal. Mantenha responsivo.
Logo é a imagem que lhe envio 
Paleta de cores use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco

Nome da empresa: ${project.client_name || 'Não informado'}
Responsável: ${project.responsible_name || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}`;

      setGeneratedText(basicCommandText);
      return;
    }
    
    // Busca dados adicionais da personalização
    const personalizationData = await fetchPersonalizationData(project.personalization_id);
    
    if (personalizationData) {
      // Gera um comando completo com todos os dados disponíveis
      const completeCommandText = `Vou lhe mantar as informações de uma empresa para implementar nesse layout. Otimize o site para SEO e cuide para não quebrar no mobile e deixar rolagem na horizontal. Mantenha responsivo.
Logo é a imagem que lhe envio 
${personalizationData.paletacores ? `Paleta de cores: ${personalizationData.paletacores}` : 'Paleta de cores: use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco'}

## INFORMAÇÕES BÁSICAS DA EMPRESA
Nome da empresa: ${project.client_name || personalizationData.officenome || 'Não informado'}
Responsável: ${project.responsible_name || personalizationData.responsavelnome || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}
Telefone: ${formatTextField(personalizationData.telefone)}
Email: ${formatTextField(personalizationData.email)}
Endereço: ${formatTextField(personalizationData.endereco)}
Redes Sociais: ${formatTextField(personalizationData.redessociais)}

## IDENTIDADE VISUAL
Fonte: ${formatTextField(personalizationData.fonte)}
Descrição: ${formatTextField(personalizationData.descricao)}
Slogan: ${formatTextField(personalizationData.slogan)}

## SERVIÇOS E PLANOS
Possui planos: ${formatBooleanField(personalizationData.possuiplanos)}
${personalizationData.possuiplanos ? `Planos:\n${formatTextField(personalizationData.planos)}` : ''}
Serviços: ${formatTextField(personalizationData.servicos)}
Depoimentos: ${formatTextField(personalizationData.depoimentos)}

## CONFIGURAÇÕES ADICIONAIS
Botão WhatsApp: ${formatBooleanField(personalizationData.botaowhatsapp)}
Possui Mapa: ${formatBooleanField(personalizationData.possuimapa)}
${personalizationData.possuimapa ? `Link do Mapa: ${formatTextField(personalizationData.linkmapa)}` : ''}
Modelo escolhido: ${formatTextField(personalizationData.modelo)}

## ARQUIVOS
Logo: ${personalizationData.logo_url ? 'Disponível' : 'Não fornecido'}
Depoimentos (imagens): ${formatArrayField(personalizationData.depoimento_urls)}
Mídias (fotos, vídeos): ${formatArrayField(personalizationData.midia_urls)}`;

      setGeneratedText(completeCommandText);
    } else {
      // Fallback para o formato básico
      const basicCommandText = `Vou lhe mantar as informações de uma empresa para implementar nesse layout. Otimize o site para SEO e cuide para não quebrar no mobile e deixar rolagem na horizontal. Mantenha responsivo.
Logo é a imagem que lhe envio 
Paleta de cores use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco

Nome da empresa: ${project.client_name || 'Não informado'}
Responsável: ${project.responsible_name || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}`;

      setGeneratedText(basicCommandText);
    }
  } catch (error) {
    console.error('Erro ao gerar comando:', error);
  } finally {
    setIsGenerating(false);
  }
};

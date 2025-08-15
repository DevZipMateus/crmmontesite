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
 * Nova introdução melhorada para todos os comandos
 */
const getImprovedIntroduction = () => {
  return `Crie um site institucional completo com base nas informações da empresa que irei fornecer a seguir.

⚙️ CONFIGURAÇÕES TÉCNICAS
Otimizar completamente o site para SEO, aplicando:

Heading tags bem estruturadas (H1, H2, H3)

Meta descriptions exclusivas e atrativas

URLs amigáveis

Texto alternativo (alt) em todas as imagens

Criar automaticamente os arquivos:

sitemap.xml (para indexação nos buscadores)

robots.txt (permitindo todos os bots, exceto caminhos irrelevantes como /admin ou /login)

O site deve ser totalmente responsivo, adaptando-se a celulares, tablets e desktops, sem rolagem horizontal e com bom desempenho em 3G.

Garantir carregamento rápido, otimizando imagens e elementos visuais.

Inserir botão flutuante do WhatsApp com número informado.

Embutir um mapa interativo com a localização exata da empresa (caso endereço seja fornecido).

Incluir menu fixo no topo com navegação por âncoras suaves para as seções: "Início", "Sobre", "Serviços", "Planos", "Depoimentos", "Localização", "Contato".

Usar a logo enviada como referência de identidade visual.

Paleta de cores baseada na regra 60/30/10:

60% branco (plano de fundo principal)

30% cor primária da logo

10% cor de destaque da logo

🎨 ESTILO VISUAL (ESTÉTICA E PERSONALIDADE)
Evitar visual genérico ou padrão. Criar um layout moderno, bonito e único.

Usar fontes elegantes ou aconchegantes (dependendo do segmento).

Usar ícones personalizados e imagens com boa resolução.

Aplicar transições suaves entre seções e scroll leve.

Valorização dos diferenciais da empresa em seções visuais com destaque.

Trabalhar com espaços em branco bem distribuídos, blocos bem definidos e harmonia visual.

♿ ACESSIBILIDADE (UX INCLUSIVO)
Garantir bom contraste de cores.

Utilizar textos legíveis, com espaçamento adequado.

Tornar o site navegável por teclado e compatível com leitores de tela.

Evitar texto em imagens quando possível.

📊 OPCIONAIS DE RASTREAMENTO E MÍDIA
Preparar estrutura do site para futura integração com Google Analytics e Pixel do Facebook.

Incluir meta tags para Open Graph (OG) e Twitter Card, para uma boa visualização ao compartilhar o site nas redes sociais.`;
};

/**
 * Extrai informações estruturadas do campo observacoes_cliente
 */
const parseObservacoes = (observacoes: string | null) => {
  if (!observacoes) return {};
  
  const data: { [key: string]: string } = {};
  
  // Split por " | " para separar os campos
  const sections = observacoes.split(' | ');
  
  // Primeira seção pode ser a descrição da empresa (se não tiver ":")
  if (sections.length > 0 && !sections[0].includes(':')) {
    data.descricao = sections[0].trim();
  }
  
  sections.forEach(section => {
    if (section.includes(':')) {
      const [key, ...valueParts] = section.split(':');
      const value = valueParts.join(':').trim();
      const keyLower = key.toLowerCase();
      
      if (keyLower.includes('serviços') || keyLower.includes('servicos')) {
        data.servicos = value;
      } else if (keyLower.includes('depoimento')) {
        data.depoimentos = value;
      } else if (keyLower.includes('plano')) {
        data.planos = value;
      } else if (keyLower.includes('slogan')) {
        data.slogan = value;
      } else if (keyLower.includes('paleta') || keyLower.includes('cores')) {
        data.paletacores = value;
      } else if (keyLower.includes('endereço') || keyLower.includes('endereco')) {
        data.endereco = value;
      } else if (keyLower.includes('redes') || keyLower.includes('social')) {
        data.redessociais = value;
      } else if (keyLower.includes('descrição') || keyLower.includes('descricao')) {
        // Se há uma descrição explícita, ela sobrescreve a primeira seção
        data.descricao = value;
      } else if (keyLower.includes('fonte')) {
        data.fonte = value;
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
  
  return `${getImprovedIntroduction()}
${observacoesData.paletacores ? `Paleta de cores: ${observacoesData.paletacores}` : 'Paleta de cores: use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco'}

## INFORMAÇÕES BÁSICAS DA EMPRESA
Nome da empresa: ${formatTextField(project.client_name)}
Responsável: ${formatTextField(project.responsible_name)}
Domínio: ${formatTextField(project.domain)}
CNPJ/CPF: ${formatTextField(project.cnpj)}
Telefone: ${formatTextField(project.telefone)}
Email: ${formatTextField(project.email_complementar)}
${observacoesData.endereco ? `Endereço: ${formatTextField(observacoesData.endereco)}` : ''}
${observacoesData.redessociais ? `Redes Sociais: ${formatTextField(observacoesData.redessociais)}` : ''}

## IDENTIDADE VISUAL
Fonte: ${formatTextField(observacoesData.fonte)}
Descrição: ${formatTextField(observacoesData.descricao)}
Slogan: ${formatTextField(observacoesData.slogan)}

## SERVIÇOS E PLANOS
Possui planos: ${observacoesData.planos ? 'Sim' : 'Não'}
${observacoesData.planos ? `Planos:\n${formatTextField(observacoesData.planos)}` : ''}
Serviços: ${formatTextField(observacoesData.servicos)}
Depoimentos: ${formatTextField(observacoesData.depoimentos)}

## CONFIGURAÇÕES ADICIONAIS
Botão WhatsApp: Sim
Possui Mapa: Não informado
Modelo escolhido: ${formatTextField(project.modelo_escolhido)}

## ARQUIVOS
Logo: Não informado
Depoimentos (imagens): Nenhum
Mídias (fotos, vídeos): Nenhum`;
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
      // Se não tiver, gera comando básico com nova introdução
      const basicCommandText = `${getImprovedIntroduction()}

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
      const completeCommandText = `${getImprovedIntroduction()}
${personalizationData.paletacores ? `Paleta de cores: ${personalizationData.paletacores}` : 'Paleta de cores: use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco'}

## INFORMAÇÕES BÁSICAS DA EMPRESA
Nome da empresa: ${project.client_name || personalizationData.officenome || 'Não informado'}
Responsável: ${project.responsible_name || personalizationData.responsavelnome || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}
CNPJ/CPF: ${formatTextField(project.cnpj)}
Telefone: ${formatTextField(personalizationData.telefone)}
Email: ${formatTextField(personalizationData.email)}
Endereço: ${formatTextField(personalizationData.endereco)}
Horário de funcionamento: ${formatTextField(personalizationData.horario_funcionamento)}
Redes Sociais: ${formatTextField(personalizationData.redessociais)}

## IDENTIDADE VISUAL
Fonte: ${formatTextField(personalizationData.fonte)}
Descrição: ${formatTextField(personalizationData.descricao)}
Slogan: ${formatTextField(personalizationData.slogan)}
Estilo visual preferido: ${formatTextField(personalizationData.estilo_visual)}

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
      // Fallback para o formato básico com nova introdução
      const basicCommandText = `${getImprovedIntroduction()}

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

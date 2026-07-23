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
  return `⚠️ CONFIGURAÇÃO CRÍTICA DE IDIOMA ⚠️

ATENÇÃO: Este é um site em PORTUGUÊS BRASILEIRO.

NUNCA use lang="en" ou qualquer outro idioma.
SEMPRE use lang="pt-BR" na tag <html>.

Exemplo CORRETO:
<html lang="pt-BR">

Exemplo INCORRETO (NÃO FAZER):
<html lang="en">

Esta configuração é OBRIGATÓRIA e não pode ser ignorada.

---

Crie um site institucional completo com base nas informações da empresa que irei fornecer a seguir.

⚙️ CONFIGURAÇÕES TÉCNICAS

🌐 IDIOMA E LOCALIZAÇÃO (OBRIGATÓRIO)

⚠️ IMPORTANTE: O atributo lang da tag <html> DEVE SER SEMPRE "pt-BR" (português brasileiro).

❌ NUNCA USE: lang="en" ou lang="en-US"
✅ SEMPRE USE: lang="pt-BR"

Exemplo da estrutura HTML correta:
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    ...
  </head>
  <body>
    ...
  </body>
</html>

Motivos desta configuração:
• SEO: Motores de busca identificam corretamente o idioma português
• Acessibilidade: Leitores de tela pronunciam corretamente em português brasileiro
• Corretor ortográfico: Navegadores sugerem palavras em português
• Compatibilidade: Evita conflitos entre idioma do HTML e conteúdo do site

Esta especificação é OBRIGATÓRIA e CRÍTICA para o funcionamento correto do site.

SEO e Metadados:

Estruturar corretamente headings (H1, H2, H3) em ordem hierárquica.

O H1 do site deve estar sempre na seção Hero e deve ser o nome da empresa.

O H2 da seção Hero deve ser o texto criado pelo Lovable para descrever a empresa.

O restante do site deve respeitar a hierarquia correta, utilizando H2 para títulos das divisões principais (ex: sobre, serviços, contato) e H3 para subtítulos internos quando necessário.

Criar <title> exclusivos e descritivos para cada página.

O título da aba do Google (browser tab) deve ser sempre o nome da empresa.

Criar <meta name="description"> únicas, objetivas e atrativas para cada página.

Organizar todas as tags <meta> de forma limpa e sem duplicações.

Criar Open Graph tags para otimizar compartilhamento em redes sociais:

og:title → mesmo conteúdo do <title>.

og:description → mesmo conteúdo do <meta name="description">.

og:image → sempre usar a logo fornecida como imagem padrão.

og:type → website.

og:url → URL da página.

O favicon do site deve ser sempre a logo fornecida.

Garantir URLs amigáveis.

Adicionar texto alternativo (alt) em todas as imagens.

Gerar automaticamente sitemap.xml e robots.txt.

Desempenho e responsividade:

Site 100% responsivo.

Carregamento rápido e otimizado.

Funcionalidades extras:

Botão flutuante de WhatsApp (ver regra abaixo).

O botão flutuante do WhatsApp não deve pular, piscar ou ter animações chamativas, devendo permanecer fixo e discreto.

Mapa interativo (se endereço for fornecido).

Menu fixo com navegação por âncoras.

Rodapé dinâmico MonteSite (OBRIGATÓRIO):

Implementar o sistema de rodapé dinâmico desenvolvido pelo MonteSite. Este rodapé é controlado por um painel admin e atualiza automaticamente todos os sites.

Passos de implementação:
1. Abra o arquivo index.html
2. Localize a tag <body>
3. Logo após a linha <div id="root"></div>, adicione estas 2 linhas:

<!-- Rodapé MonteSite - Atualização Automática -->
<div id="montesite-footer-badge"></div>
<script src="https://vaabpicspdbolvutnscp.supabase.co/functions/v1/get-footer-iframe"></script>

Importante: O rodapé será carregado automaticamente e se adaptará ao design do site.

Regras de Header e Hero:

O header deve estar sempre fixo (grudado) no topo da página.

A seção Hero deve começar somente após o header, sem sobreposição.

Não adicionar botões ou ícones de seta/mouse na parte inferior da Hero, pois atrapalham a visualização.

📲 RASTREAMENTO DE BOTÕES DE WHATSAPP (Google Tag Manager)
Todos os botões de contato que direcionam para o WhatsApp devem conter no href a URL completa com domínio wa.me ou api.whatsapp.com, como:
href="https://wa.me/5599999999999"
href="https://api.whatsapp.com/send?phone=5599999999999"
Proibições:

Não usar redirecionamentos via JavaScript que ocultem a URL original.

Não usar funções de clique que envolvam o botão e escondam o link.

Objetivo: garantir que a variável Click URL capture a palavra "whatsapp" para configuração correta no GTM.
Manter o estilo visual e a funcionalidade original dos botões.

🎨 ESTILO VISUAL

Layout moderno, bonito e único.

Fontes elegantes e ícones personalizados.

Transições suaves.

Paleta de cores 60/30/10:

60% branco,

30% cor primária,

10% cor de destaque.

♿ ACESSIBILIDADE

Garantir contraste adequado e textos legíveis.

Navegabilidade por teclado.

Compatibilidade com leitores de tela.

🎨 REGRAS DE CONTRASTE PARA BOTÕES (WCAG AA)
Objetivo: garantir contraste adequado entre texto e fundo em todos os estados: normal, hover, focus, active.
✅ CHECKLIST:

Estado Normal:

Contraste mínimo 4.5:1.

Texto visível sobre o fundo.

Estado Hover:

Nunca usar texto branco sobre fundo branco.

Nunca usar texto escuro sobre fundo escuro.

Botões Transparentes/Semitransparentes:

Sempre adicionar um fundo visível (bg-white/10, bg-primary/20).

Botões Outline:

Borda visível no contexto (border-white/60 ou border-primary/60).

🔧 Implementação prática:
Fundo escuro:
/* Normal */
bg-white/10 text-white border-white/60
/* Hover */
hover:bg-accent hover:text-accent-foreground hover:border-accent
Fundo claro:
/* Normal */
bg-primary/10 text-primary border-primary/60
/* Hover */
hover:bg-primary hover:text-primary-foreground hover:border-primary
⚠️ Nunca fazer:
text-white hover:bg-white
text-black hover:bg-black
⚠️ Bordas fracas (<30% opacidade)
✅ Sempre fazer:

Testar visualmente todos os estados.

Usar ferramentas de contraste para validar.

Ajustar cores considerando o contexto.

✍️ PADRÃO DE ESCRITA

O Lovable deve seguir o padrão brasileiro de escrita, utilizando apenas a primeira letra maiúscula nas frases, e não o padrão americano em que todas as palavras começam com maiúscula.

---

✅ CHECKLIST OBRIGATÓRIO ANTES DE CRIAR O SITE

Antes de gerar o código, verifique:

1. [ ] A tag <html> está usando lang="pt-BR"? (NÃO lang="en")
2. [ ] Todos os textos estão em português brasileiro?
3. [ ] As meta tags estão configuradas para português?
4. [ ] O conteúdo está alinhado com o idioma pt-BR?

⚠️ LEMBRE-SE: Este é um site BRASILEIRO, em PORTUGUÊS BRASILEIRO, com lang="pt-BR"

`;
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

⚠️ LEMBRE-SE: Use lang="pt-BR" na tag <html>

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

⚠️ IMPORTANTE: Configure lang="pt-BR" na tag <html>


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

⚠️ CONFIGURAÇÃO CRÍTICA: lang="pt-BR" na tag <html> (não use lang="en")

${personalizationData.paletacores ? `Paleta de cores: ${personalizationData.paletacores}` : 'Paleta de cores: use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco'}

## INFORMAÇÕES BÁSICAS DA EMPRESA
Nome da empresa: ${project.client_name || personalizationData.officenome || 'Não informado'}
Responsável: ${project.responsible_name || personalizationData.responsavelnome || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}
CNPJ/CPF: ${formatTextField(personalizationData.cnpj_cpf || project.cnpj)}
Telefone: ${formatTextField(personalizationData.telefone)}
Email: ${formatTextField(personalizationData.email)}
Endereço: ${formatTextField([
  [(personalizationData as any).logradouro, (personalizationData as any).numero].filter(Boolean).join(', '),
  (personalizationData as any).complemento,
  (personalizationData as any).bairro,
  [(personalizationData as any).cidade, (personalizationData as any).estado].filter(Boolean).join('/'),
  (personalizationData as any).cep,
].filter(Boolean).join(' - ') || personalizationData.endereco)}
CEP: ${formatTextField((personalizationData as any).cep)}
Cidade/UF: ${formatTextField([(personalizationData as any).cidade, (personalizationData as any).estado].filter(Boolean).join('/'))}
Bairro: ${formatTextField((personalizationData as any).bairro)}
Horário de funcionamento: ${formatTextField(personalizationData.horario_funcionamento)}
Redes Sociais: ${formatTextField(personalizationData.redessociais)}

## IDENTIDADE VISUAL
Fonte: ${formatTextField(personalizationData.fonte)}
Slogan: ${formatTextField(personalizationData.slogan)}
Estilo visual preferido: ${formatTextField(personalizationData.estilo_visual)}

## SOBRE A EMPRESA
${personalizationData.visao_missao_valores ? `Visão, Missão e Valores:\n${formatTextField(personalizationData.visao_missao_valores)}\n\n` : ''}${personalizationData.historia_empresa ? `História da Empresa:\n${formatTextField(personalizationData.historia_empresa)}\n\n` : ''}${personalizationData.mercado_atuacao ? `Mercado de Atuação:\n${formatTextField(personalizationData.mercado_atuacao)}\n\n` : ''}${!personalizationData.visao_missao_valores && !personalizationData.historia_empresa && !personalizationData.mercado_atuacao && personalizationData.descricao ? `Descrição:\n${formatTextField(personalizationData.descricao)}` : ''}
## PRODUTOS E SERVIÇOS
${personalizationData.produtos ? `Produtos:\n${formatTextField(personalizationData.produtos)}\n\n` : ''}Serviços: ${formatTextField(personalizationData.servicos)}
Depoimentos: ${formatTextField(personalizationData.depoimentos)}

## PLANOS
Possui planos: ${formatBooleanField(personalizationData.possuiplanos)}
${personalizationData.possuiplanos ? `Planos:\n${formatTextField(personalizationData.planos)}` : ''}

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

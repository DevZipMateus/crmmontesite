
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useProjects } from "@/hooks/use-projects";
import { Construction, Copy, FileText, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ProducaoSites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loading } = useProjects("Recebido");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Busca dados da personalização usando o ID da personalização
  const fetchPersonalizationData = async (personalizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('site_personalizacoes')
        .select('*')
        .eq('id', personalizationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de personalização:', error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível obter os dados de personalização.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Formata campos booleanos para exibição em texto
  const formatBooleanField = (value: boolean | null | undefined) => {
    if (value === undefined || value === null) return 'Não informado';
    return value ? 'Sim' : 'Não';
  };

  // Formata arrays e objetos para exibição em texto
  const formatArrayField = (arr: any[] | null | undefined) => {
    if (!arr || arr.length === 0) return 'Nenhum';
    return `${arr.length} item(ns)`;
  };

  // Formata qualquer campo de texto para exibição
  const formatTextField = (text: string | null | undefined) => {
    if (text === undefined || text === null || text.trim() === '') return 'Não informado';
    return text;
  };

  const handleGenerateCommand = async (project: any) => {
    setSelectedProjectId(project.id);
    setIsGenerating(true);
    
    try {
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
        setIsGenerating(false);
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
      toast({
        title: "Erro ao gerar comando",
        description: "Ocorreu um erro ao processar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateEgestorCommand = (project: any) => {
    setSelectedProjectId(project.id);
    
    // Create component code with the partner's link
    const partnerLink = project.partner_link || project.blaster_link || "link do parceiro";
    
    const egestorCode = `import React from 'react';
import { Button } from '@/components/ui/button';

const EgestorERP = () => {
  // Link for both the title and button
  const egestorLink = "${partnerLink}";

  return <section className="py-16 bg-white overflow-hidden">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Two-column layout for desktop, stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-8 lg:gap-12 mb-10">
          {/* Left column - Header Text */}
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0 animate-fade-in">
            <a href={egestorLink} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90 transition-opacity">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">Sistema de gestão empresarial</h2>
            </a>
            <p className="text-lg md:text-xl text-gray-600 font-normal">
              Dobre seus lucros otimizando sua gestão
            </p>
          </div>
          
          {/* Right column - Video Container */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl animate-fade-in">
            <video className="w-full aspect-video object-cover" autoPlay muted loop playsInline poster="/lovable-uploads/00b6d73e-0139-4a17-ad97-b66dac2be5f8.png">
              <source src="https://egestor.com.br/assets/img/egestor-gestao-simples-para-crescer.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        </div>
        
        {/* CTA Button - Centered below both columns */}
        <div className="flex justify-center animate-fade-in">
          <a href={egestorLink} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-sm">
            <button className="w-full py-3 bg-[#7CFFA0] hover:bg-[#6DF090] text-black font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              Teste grátis
            </button>
          </a>
        </div>
      </div>
    </section>;
};

export default EgestorERP;`;

    const commandText = `Vou lhe mantar as informações para adicionar uma seção de anúncio do eGestor no site. 
Insira o seguinte componente no site:

${egestorCode}`;

    setGeneratedText(commandText);
  };

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
        .then(() => {
          toast({
            title: "Copiado com sucesso!",
            description: "O comando foi copiado para a área de transferência."
          });
        })
        .catch(() => {
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o texto. Tente novamente.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <PageLayout title="Produção de Sites">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-apple text-center">
            <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Nenhum projeto recebido</h2>
            <p className="mb-6 text-muted-foreground">
              Não há projetos com status "Recebido" para produção no momento.
            </p>
            <Button 
              onClick={() => navigate("/projetos")}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              Voltar para Projetos
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Projetos Recebidos para Produção</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do cliente</TableHead>
                    <TableHead>Modelo escolhido</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Tipo de cliente</TableHead>
                    <TableHead>Data de recebimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{project.client_name}</TableCell>
                      <TableCell>{project.template || "—"}</TableCell>
                      <TableCell>{project.responsible_name || "—"}</TableCell>
                      <TableCell>{project.client_type || "—"}</TableCell>
                      <TableCell>{formatDate(project.created_at)}</TableCell>
                      <TableCell className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateCommand(project)}
                          className="flex items-center gap-2 w-full"
                          disabled={isGenerating}
                        >
                          {isGenerating && selectedProjectId === project.id ? (
                            <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full mr-2" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          Gerar Comando
                        </Button>
                        
                        {project.client_type?.toLowerCase() === "parceiro" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateEgestorCommand(project)}
                            className="flex items-center gap-2 w-full mt-2"
                          >
                            <Award className="h-4 w-4" />
                            Gerar Anúncio eGestor
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {generatedText && (
            <div className="mt-6 p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Comando Gerado</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm">
                  {generatedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

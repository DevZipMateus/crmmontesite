import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SalesLandingPage } from "@/types/salesLandingPage";
import { PageLayout } from "@/components/layout/PageLayout";
import { Search, Copy, Eye, Terminal, Users, ExternalLink, Image, FileText, Trash2, Download } from "lucide-react";
import { VendedorImageViewer } from "@/components/site-personalize/VendedorImageViewer";
import { CurriculoPDFGenerator } from "@/components/site-personalize/CurriculoPDFGenerator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSignedUrl } from "@/lib/supabase/storage";

export default function LandingPagesVendedores() {
  const [landingPages, setLandingPages] = useState<SalesLandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<SalesLandingPage | null>(null);
  const [generatedCommand, setGeneratedCommand] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar landing pages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = landingPages.filter(page =>
    page.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.email_profissional.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.area_atuacao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateCommand = (page: SalesLandingPage) => {
    const command = `# Comando para criar Landing Page do Vendedor
# Vendedor: ${page.nome_completo}
# Email: ${page.email_profissional}
# Área: ${page.area_atuacao}

## Dados do Vendedor:
Nome: ${page.nome_completo}
Email: ${page.email_profissional}
Telefone/WhatsApp: ${page.telefone_whatsapp}
Área de Atuação: ${page.area_atuacao}
${page.cargo ? `Cargo: ${page.cargo}` : ''}
${page.cidade_regiao ? `Região: ${page.cidade_regiao}` : ''}

## Apresentação:
${page.mini_bio}
${page.slogan ? `Slogan: "${page.slogan}"` : ''}

${page.formacao_certificacoes ? `## Qualificações:
${page.formacao_certificacoes}` : ''}

## Serviços Oferecidos:
${page.principais_servicos}

${page.diferenciais ? `## Diferenciais:
${page.diferenciais}` : ''}

${page.redes_sociais ? `## Redes Sociais:
${page.redes_sociais}` : ''}

## Configurações de Estilo:
${page.cores_preferidas ? `Cores: ${page.cores_preferidas}` : 'Cores: Usar padrão da empresa'}
${page.estilo_visual ? `Estilo: ${page.estilo_visual}` : 'Estilo: Profissional'}

${page.foto_profissional_url ? `## Foto do Vendedor:
URL: ${page.foto_profissional_url}` : ''}

## Instruções de Criação:
1. Criar página responsiva e moderna
2. Incluir seção hero com foto e apresentação
3. Destacar qualificações e experiências profissionais
4. Seção de serviços destacando os principais oferecidos
5. Área de contato com WhatsApp em evidência
6. Aplicar cores e estilo visual solicitados
7. Otimizar para conversão e geração de leads

Data de criação: ${new Date().toLocaleDateString('pt-BR')}
`;

    setGeneratedCommand(command);
    setSelectedPage(page);

    // Marcar como comando gerado
    updateCommandGenerated(page.id);
  };

  const updateCommandGenerated = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('sales_landing_pages')
        .update({ comando_gerado: true, status: 'comando_gerado' })
        .eq('id', pageId);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setLandingPages(prev =>
        prev.map(page =>
          page.id === pageId
            ? { ...page, comando_gerado: true, status: 'comando_gerado' }
            : page
        )
      );
    } catch (error) {
      console.error('Error updating command status:', error);
    }
  };

  const deleteLandingPage = async (pageId: string, pageName: string) => {
    try {
      const { error } = await supabase
        .from('sales_landing_pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        throw error;
      }

      // Atualizar estado local removendo a página excluída
      setLandingPages(prev => prev.filter(page => page.id !== pageId));
      
      toast({
        title: "Excluído com sucesso!",
        description: `Landing page de ${pageName} foi excluída.`,
      });
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir landing page.",
        variant: "destructive",
      });
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(generatedCommand);
    toast({
      title: "Copiado!",
      description: "Comando copiado para a área de transferência.",
    });
  };

  const getStatusBadge = (status: string, comandoGerado: boolean) => {
    if (comandoGerado) {
      return <Badge variant="default">Comando Gerado</Badge>;
    }
    
    switch (status) {
      case 'novo':
        return <Badge variant="secondary">Novo</Badge>;
      case 'processado':
        return <Badge variant="outline">Processado</Badge>;
      case 'concluido':
        return <Badge variant="default">Concluído</Badge>;
      default:
        return <Badge variant="secondary">Novo</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadMediaFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download iniciado!",
        description: `Download de ${filename} iniciado.`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Erro no download",
        description: "Erro ao baixar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const downloadAllMedia = async (mediaUrls: string, vendedorName: string) => {
    if (!mediaUrls) return;
    
    try {
      // Parse JSON array of media URLs
      let urls: string[] = [];
      try {
        urls = JSON.parse(mediaUrls);
      } catch (parseError) {
        console.error('Error parsing media URLs JSON:', parseError);
        toast({
          title: "Erro no parsing",
          description: "Formato de URLs de mídia inválido.",
          variant: "destructive",
        });
        return;
      }
      
      if (!Array.isArray(urls) || urls.length === 0) {
        toast({
          title: "Nenhuma mídia encontrada",
          description: "Este vendedor não possui mídias para download.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Download iniciado!",
        description: `Iniciando download de ${urls.length} arquivo(s) de ${vendedorName}.`,
      });

      for (let i = 0; i < urls.length; i++) {
        const filePath = urls[i].trim();
        
        // Generate signed URL for the file
        const signedUrl = await getSignedUrl(filePath, 'vendedor-fotos');
        
        if (!signedUrl) {
          console.error(`Failed to generate signed URL for: ${filePath}`);
          toast({
            title: "Erro no download",
            description: `Erro ao gerar URL para o arquivo ${i + 1}.`,
            variant: "destructive",
          });
          continue;
        }
        
        const filename = `${vendedorName}_midia_${i + 1}.${filePath.split('.').pop() || 'bin'}`;
        await downloadMediaFile(signedUrl, filename);
        
        // Delay entre downloads para evitar sobrecarga
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error downloading media files:', error);
      toast({
        title: "Erro no download",
        description: "Erro ao baixar as mídias.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout title="Landing Pages para Vendedores">
      <div className="space-y-6">
        
        {/* Card com informações e link público */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Formulário Público para Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Compartilhe este link com seus vendedores internos para que eles preencham o formulário e solicitem suas landing pages personalizadas:
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm">
                {window.location.origin}/formulario-vendedor
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/formulario-vendedor`);
                  toast({
                    title: "Link copiado!",
                    description: "Link do formulário copiado para a área de transferência.",
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${window.location.origin}/formulario-vendedor`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção de busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Formulários Recebidos ({filteredPages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou área de atuação..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Área / Cargo</TableHead>
                          <TableHead>Mídias</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.nome_completo}</TableCell>
                        <TableCell>{page.email_profissional}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{page.area_atuacao}</div>
                            {page.cargo && <div className="text-sm text-muted-foreground">{page.cargo}</div>}
                          </div>
                        </TableCell>
                         <TableCell>
                           {page.media_urls ? (
                             <div className="flex items-center gap-2">
                               <FileText className="h-4 w-4 text-blue-600" />
                               <span className="text-sm text-blue-600">
                                 {(() => {
                                   try {
                                     const urls = JSON.parse(page.media_urls);
                                     return Array.isArray(urls) ? urls.length : 0;
                                   } catch {
                                     return 0;
                                   }
                                 })()} arquivo(s)
                               </span>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => downloadAllMedia(page.media_urls!, page.nome_completo)}
                                 title="Download todas as mídias"
                               >
                                 <Download className="h-4 w-4" />
                               </Button>
                             </div>
                           ) : (
                             <span className="text-sm text-muted-foreground">Nenhuma mídia</span>
                           )}
                         </TableCell>
                        <TableCell>{getStatusBadge(page.status, page.comando_gerado)}</TableCell>
                        <TableCell>{formatDate(page.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Detalhes - {page.nome_completo}</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[60vh]">
                                  <div className="space-y-4 p-1">
                                    <div>
                                      <h4 className="font-semibold">Informações Pessoais</h4>
                                      <p><strong>Nome:</strong> {page.nome_completo}</p>
                                      <p><strong>Email:</strong> {page.email_profissional}</p>
                                      <p><strong>Telefone:</strong> {page.telefone_whatsapp}</p>
                                      {page.foto_profissional_url && (
                                        <div className="mt-3">
                                          <p className="font-semibold mb-2">Foto Profissional:</p>
                                          <VendedorImageViewer 
                                            imageUrl={page.foto_profissional_url}
                                            vendedorName={page.nome_completo}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold">Perfil Profissional</h4>
                                      <p><strong>Área:</strong> {page.area_atuacao}</p>
                                      {page.cargo && <p><strong>Cargo:</strong> {page.cargo}</p>}
                                      {page.cidade_regiao && <p><strong>Região:</strong> {page.cidade_regiao}</p>}
                                      <p><strong>Bio:</strong> {page.mini_bio}</p>
                                      {page.slogan && <p><strong>Slogan:</strong> {page.slogan}</p>}
                                      {page.redes_sociais && <p><strong>Redes Sociais:</strong> {page.redes_sociais}</p>}
                                    </div>

                                    {page.formacao_certificacoes && (
                                      <div>
                                        <h4 className="font-semibold">Formação e Certificações</h4>
                                        <p>{page.formacao_certificacoes}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="font-semibold">Serviços</h4>
                                      <p><strong>Principais Serviços:</strong> {page.principais_servicos}</p>
                                      {page.diferenciais && <p><strong>Diferenciais:</strong> {page.diferenciais}</p>}
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold">Estilo</h4>
                                      {page.cores_preferidas && <p><strong>Cores:</strong> {page.cores_preferidas}</p>}
                                      {page.estilo_visual && <p><strong>Estilo:</strong> {page.estilo_visual}</p>}
                                    </div>
                                   </div>
                                 </ScrollArea>
                               </DialogContent>
                             </Dialog>
                             
                              <div className="flex">
                                <CurriculoPDFGenerator vendedor={page} />
                              </div>
                             
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => generateCommand(page)}
                             >
                               <Terminal className="h-4 w-4" />
                             </Button>

                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="destructive" size="sm">
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     Tem certeza que deseja excluir a landing page de <strong>{page.nome_completo}</strong>?
                                     <br />
                                     Esta ação não pode ser desfeita.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                   <AlertDialogAction
                                     onClick={() => deleteLandingPage(page.id, page.nome_completo)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                   >
                                     Excluir
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção do comando gerado */}
        {selectedPage && generatedCommand && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Comando Gerado para {selectedPage.nome_completo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={generatedCommand}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={copyCommand}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Comando
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedCommand("")}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useProjects } from "@/hooks/use-projects";
import { Construction, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProducaoSites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loading } = useProjects("Recebido");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleGenerateCommand = (project: any) => {
    setSelectedProjectId(project.id);
    
    // Generate the command text
    const commandText = `Vou lhe mantar as informações de uma empresa para implementar nesse layout. Otimize o site para SEO e cuide para não quebrar no mobile e deixar rolagem na horizontal. Mantenha responsivo.
Logo é a imagem que lhe envio 
Paleta de cores use as cores da logo e utilize a regra 60,30,10 para as proporções das cores onde 60% é branco

Nome da empresa: ${project.client_name || 'Não informado'}
Template escolhido: ${project.template || 'Não informado'}
Responsável: ${project.responsible_name || 'Não informado'}
Domínio: ${project.domain || 'Não informado'}
Tipo de cliente: ${project.client_type || 'Não informado'}
Link blaster: ${project.blaster_link || 'Não informado'}
Data de criação: ${formatDate(project.created_at)}`;

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
                      <TableCell>{formatDate(project.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateCommand(project)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Gerar Comando
                        </Button>
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

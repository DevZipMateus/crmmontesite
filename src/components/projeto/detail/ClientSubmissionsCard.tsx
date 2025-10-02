import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientSubmissionService } from "@/services/clientSubmissionService";
import { ClientMediaSubmission } from "@/types/clientSubmission";
import { useToast } from "@/hooks/use-toast";
import { 
  Images, 
  Calendar, 
  User, 
  Mail, 
  MessageSquare, 
  Eye, 
  Check, 
  X, 
  Copy,
  Download,
  Trash2,
  Folder
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ClientSubmissionsBulkDownloader } from "./ClientSubmissionsBulkDownloader";
import JSZip from 'jszip';

interface ClientSubmissionsCardProps {
  projectId: string;
  clientSubmissionHash?: string;
  projectName?: string;
}

export function ClientSubmissionsCard({ projectId, clientSubmissionHash, projectName = "Projeto" }: ClientSubmissionsCardProps) {
  const [submissions, setSubmissions] = useState<ClientMediaSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();
  }, [projectId]);

  const loadSubmissions = async () => {
    try {
      const data = await ClientSubmissionService.getProjectSubmissions(projectId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar envios do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (submissionId: string, status: string) => {
    try {
      await ClientSubmissionService.updateSubmissionStatus(submissionId, status);
      await loadSubmissions();
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status.",
        variant: "destructive",
      });
    }
  };

  const copySubmissionLink = () => {
    if (clientSubmissionHash) {
      const link = `${window.location.origin}/cliente-images/${clientSubmissionHash}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: "Link do formulário copiado para a área de transferência.",
      });
    }
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Envios do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              Envios do Cliente
            </CardTitle>
            <CardDescription>
              Imagens enviadas pelo cliente para o projeto
            </CardDescription>
          </div>
          {clientSubmissionHash && (
            <Button variant="outline" size="sm" onClick={copySubmissionLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum envio do cliente ainda</p>
            {clientSubmissionHash && (
              <p className="text-sm mt-2">
                Compartilhe o link do formulário com o cliente para que ele possa enviar imagens
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <ClientSubmissionsBulkDownloader 
              submissions={submissions}
              projectName={projectName}
            />
            
            <div className="space-y-4">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onStatusUpdate={updateStatus}
                  onSubmissionUpdate={loadSubmissions}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SubmissionCardProps {
  submission: ClientMediaSubmission;
  onStatusUpdate: (submissionId: string, status: string) => void;
  onSubmissionUpdate: () => void;
}

function SubmissionCard({ submission, onStatusUpdate, onSubmissionUpdate }: SubmissionCardProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'viewed': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'viewed': return 'Visualizado';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  useEffect(() => {
    const loadImageUrls = async () => {
      const urls = await Promise.all(
        submission.media_urls.map(async (media) => {
          return await ClientSubmissionService.getImageUrl(media.url);
        })
      );
      setImageUrls(urls);
    };

    loadImageUrls();
  }, [submission.media_urls]);

  const handleDeleteImage = async (imageIndex: number) => {
    try {
      await ClientSubmissionService.deleteImageFromSubmission(submission.id, imageIndex);
      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso.",
      });
      onSubmissionUpdate();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmission = async () => {
    try {
      await ClientSubmissionService.deleteEntireSubmission(submission.id);
      toast({
        title: "Sucesso",
        description: "Envio excluído completamente.",
      });
      onSubmissionUpdate();
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir envio.",
        variant: "destructive",
      });
    }
  };

  const downloadSubmissionImages = async () => {
    setIsDownloading(true);
    const zip = new JSZip();
    
    try {
      const submissionDate = new Date(submission.submission_date).toLocaleDateString('pt-BR').replace(/\//g, '-');
      const zipName = `${submission.client_name}_${submissionDate}_envio.zip`;
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < submission.media_urls.length; i++) {
        const media = submission.media_urls[i];
        
        try {
          const imageUrl = await ClientSubmissionService.getImageUrl(media.url);
          
          if (imageUrl) {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Detectar extensão do arquivo
            const extension = media.url.split('.').pop()?.toLowerCase() || 'jpg';
            
            // Nome do arquivo com informações úteis
            let fileName = media.name || `imagem_${i + 1}`;
            if (!fileName.includes('.')) {
              fileName = `${fileName}.${extension}`;
            }
            
            // Adicionar categoria ao caminho se existir
            const folderPath = media.category ? `${media.category}/` : '';
            
            zip.file(`${folderPath}${fileName}`, blob);
            successCount++;
          }
        } catch (error) {
          console.error(`Error downloading image ${i}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = zipName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download concluído!",
          description: `${successCount} imagem(ns) baixada(s)${errorCount > 0 ? `. ${errorCount} erro(s).` : '.'}`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível baixar nenhuma imagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating zip:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar arquivo ZIP.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{submission.client_name}</span>
            <Badge variant={getStatusColor(submission.status) as any}>
              {getStatusText(submission.status)}
            </Badge>
          </div>
          
          {submission.client_email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {submission.client_email}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(submission.submission_date).toLocaleString('pt-BR')}
          </div>
        </div>

        <Select
          value={submission.status}
          onValueChange={(value) => onStatusUpdate(submission.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="viewed">Visualizado</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submission.message && (
        <div className="flex items-start gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-muted-foreground">{submission.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {submission.media_urls.length} imagem(ns)
        </span>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadSubmissionImages}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Baixando..." : "Baixar Envio"}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Imagens
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Imagens - {submission.client_name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {/* Group images by category */}
              {(() => {
                const groupedByCategory = submission.media_urls.reduce((acc, media, index) => {
                  const category = media.category || 'Geral';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push({ media, index, url: imageUrls[index] });
                  return acc;
                }, {} as Record<string, Array<{ media: any; index: number; url: string }>>);

                return Object.entries(groupedByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-background py-2 border-b">
                      <Folder className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm">{category} ({items.length})</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                      {items.map(({ media, index, url }) => (
                        <div key={index} className="space-y-2 border rounded-lg p-3">
                          <img
                            src={url}
                            alt={`${media.name || `Imagem ${index + 1}`}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="space-y-2">
                            {media.name && (
                              <p className="text-sm font-medium">
                                {media.name}
                              </p>
                            )}
                            {media.description && (
                              <p className="text-xs text-muted-foreground">
                                {media.description}
                              </p>
                            )}
                            {media.price && (
                              <p className="text-sm font-semibold text-green-600">
                                R$ {media.price.toFixed(2)}
                              </p>
                            )}
                            {media.caption && (
                              <p className="text-xs text-muted-foreground">
                                {media.caption}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir imagem</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteImage(index)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {submission.media_urls.length} imagem(ns) total
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Envio Completo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir envio completo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este envio completo? Todas as imagens serão removidas permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSubmission}>
                      Excluir Tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
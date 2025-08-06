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
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientSubmissionsBulkDownloader } from "./ClientSubmissionsBulkDownloader";

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
}

function SubmissionCard({ submission, onStatusUpdate }: SubmissionCardProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {imageUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {submission.media_urls[index]?.caption && (
                    <p className="text-xs text-muted-foreground">
                      {submission.media_urls[index].caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Lead } from '@/types/lead';
import { useLeadFormUrl } from '@/hooks/useLeadFormUrl';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadFormUrlGeneratorProps {
  lead: Lead;
  compact?: boolean;
}

export const LeadFormUrlGenerator: React.FC<LeadFormUrlGeneratorProps> = ({ 
  lead, 
  compact = false 
}) => {
  const { 
    formUrl, 
    formStatus, 
    isGenerating, 
    generateUrl, 
    copyUrl, 
    openForm,
    checkStatus 
  } = useLeadFormUrl(lead);

  useEffect(() => {
    // Verificar status ao montar componente
    checkStatus();
  }, [lead.project_id]);

  const isCompleted = formStatus === 'completed' || !!lead.project_id;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isGenerating ? (
          <Skeleton className="h-9 w-32" />
        ) : formUrl ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrl}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openForm}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {isCompleted && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Preenchido
              </Badge>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={generateUrl}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Gerar Formulário
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Formulário de Personalização</h3>
            </div>
            {isCompleted ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Preenchido
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-4 w-4 mr-1" />
                Pendente
              </Badge>
            )}
          </div>

          {isGenerating ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : formUrl ? (
            <>
              <div className="p-3 bg-muted rounded-md break-all text-sm font-mono">
                {formUrl}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyUrl}
                  className="flex-1 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </Button>
                <Button
                  variant="outline"
                  onClick={openForm}
                  className="flex-1 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Formulário
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={generateUrl}
              className="w-full flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Gerar URL do Formulário
            </Button>
          )}

          {isCompleted && (
            <p className="text-sm text-muted-foreground">
              Este formulário já foi preenchido pelo cliente e o projeto foi criado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
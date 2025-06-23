
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EGestorProjectService } from "@/services/egestorProjectService";
import { processWebhookQueue } from "@/server/webhook-service";
import { 
  Settings, 
  RefreshCw, 
  Send, 
  CheckCircle,
  AlertCircle,
  Hash
} from "lucide-react";

export function EGestorProjectManager() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateResult, setUpdateResult] = useState<number | null>(null);

  const handleUpdateEGestorProjects = async () => {
    setIsUpdating(true);
    try {
      const updatedCount = await EGestorProjectService.updateExistingEGestorProjects();
      setUpdateResult(updatedCount);
      
      toast({
        title: "Projetos atualizados",
        description: `${updatedCount} projetos do eGestor foram identificados e configurados.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os projetos do eGestor.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessWebhooks = async () => {
    setIsProcessing(true);
    try {
      const result = await processWebhookQueue();
      
      toast({
        title: "Webhooks processados",
        description: `${result.processed || 0} webhooks foram processados com a nova lógica.`,
      });
    } catch (error) {
      console.error('Erro ao processar webhooks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar os webhooks.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const testHash = "0b3c2302b3132f47a837b0ba8212d4de";
  const isEGestorHash = EGestorProjectService.isEGestorHash(testHash);

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-600" />
          Gerenciamento de Projetos eGestor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Identificação Automática</h4>
          <p className="text-sm text-muted-foreground mb-3">
            O sistema agora identifica automaticamente projetos do eGestor baseado no padrão dos hashes.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Teste com hash atual:</span>
              <code className="text-xs bg-white px-2 py-1 rounded">
                {testHash}
              </code>
              {isEGestorHash ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reconhecido como eGestor
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não reconhecido
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Atualização de Projetos Existentes</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Identifica e configura projetos existentes do eGestor que ainda não possuem webhook configurado.
          </p>
          
          {updateResult !== null && (
            <div className="mb-3">
              <Badge className="bg-green-100 text-green-700">
                {updateResult} projetos atualizados
              </Badge>
            </div>
          )}
          
          <Button 
            onClick={handleUpdateEGestorProjects} 
            className="flex items-center gap-2"
            disabled={isUpdating}
            variant="outline"
          >
            <Settings className="h-4 w-4" />
            {isUpdating ? 'Atualizando...' : 'Atualizar Projetos Existentes'}
          </Button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Processar Webhooks Pendentes</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Processa novamente os webhooks que falharam, agora com a nova lógica de identificação.
          </p>
          
          <Button 
            onClick={handleProcessWebhooks} 
            className="flex items-center gap-2"
            disabled={isProcessing}
          >
            <Send className="h-4 w-4" />
            {isProcessing ? 'Processando...' : 'Processar Webhooks Pendentes'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">Como funciona:</h4>
          <ul className="space-y-1">
            <li>✅ Identifica hashes do eGestor automaticamente (padrão: 32 caracteres hexadecimais)</li>
            <li>✅ Configura URL e token do webhook automaticamente</li>
            <li>✅ Processa webhooks de formulários preenchidos</li>
            <li>✅ Mantém compatibilidade com o sistema existente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

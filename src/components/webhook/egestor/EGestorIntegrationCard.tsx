import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EGestorIntegrationService } from "@/services/egestorIntegration";
import { 
  Shield, 
  Globe, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Settings,
  ExternalLink
} from "lucide-react";
import { EGestorProjectManager } from "./EGestorProjectManager";

export function EGestorIntegrationCard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const handleSetupEGestor = async () => {
    setIsLoading(true);
    try {
      const partner = await EGestorIntegrationService.ensureEGestorPartner();
      toast({
        title: "eGestor configurado",
        description: `Parceiro ${partner.name} configurado com sucesso.`,
      });
      console.log('Parceiro eGestor configurado:', partner);
    } catch (error) {
      console.error('Erro ao configurar eGestor:', error);
      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar o parceiro eGestor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await EGestorIntegrationService.testWebhookConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Conexão bem-sucedida",
          description: result.message,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Falha na conexão",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Erro no teste de conexão:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar a conexão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro na Conexão</Badge>;
      default:
        return <Badge variant="secondary">Não Testado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Integração eGestor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">URL do Webhook:</span>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-xs bg-white px-2 py-1 rounded block break-all">
                https://v4.egestor.com.br/parceiros2/webhook_receiver.php
              </code>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <span className="font-medium">Token de Autenticação:</span>
              <code className="text-xs bg-white px-2 py-1 rounded block break-all">
                whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12
              </code>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">Status da Conexão:</span>
            </div>
            {getStatusBadge()}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">Funcionalidades:</h4>
              <ul className="space-y-1">
                <li>✅ Recebimento de hashes de projetos</li>
                <li>✅ Envio de mudanças de status</li>
                <li>✅ Validação de token de autenticação</li>
                <li>✅ Logs de comunicação completos</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSetupEGestor} 
              className="flex items-center gap-2 flex-1"
              disabled={isLoading}
            >
              <Settings className="h-4 w-4" />
              {isLoading ? 'Configurando...' : 'Configurar Parceiro'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConnection} 
              className="flex items-center gap-2 flex-1"
              disabled={isLoading}
            >
              <TestTube className="h-4 w-4" />
              {isLoading ? 'Testando...' : 'Testar Conexão'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <EGestorProjectManager />
    </div>
  );
}

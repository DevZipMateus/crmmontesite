
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  TestTube, 
  Copy, 
  AlertCircle, 
  CheckCircle,
  Globe,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WebhookConfiguration = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");

  const handleSave = () => {
    toast({
      title: "Configuração salva",
      description: "As configurações do webhook foram atualizadas com sucesso.",
    });
  };

  const handleTest = () => {
    toast({
      title: "Teste iniciado",
      description: "Enviando webhook de teste para a URL configurada...",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Webhook Receiver Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuração do Receptor de Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://seu-site.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl, "URL do webhook")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-token">Token de Autenticação</Label>
            <div className="flex gap-2">
              <Input
                id="auth-token"
                type="password"
                placeholder="Token secreto para validação"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(authToken, "Token de autenticação")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito deste webhook..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="webhook-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="webhook-active">Webhook Ativo</Label>
            </div>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Configuração
            </Button>
            <Button variant="outline" onClick={handleTest} className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testar Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Our Webhook Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Nossos Endpoints para Recebimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Endpoint para Dados de Parceiros</h4>
            <div className="flex items-center gap-2 mb-2">
              <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(
                  "https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-partner-data",
                  "URL do endpoint"
                )}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Endpoint ativo e funcionando
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800">Importante</h4>
                <p className="text-sm text-orange-700">
                  Certifique-se de que sua aplicação está configurada para enviar dados para nossos endpoints
                  usando o método POST com Content-Type: application/json.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

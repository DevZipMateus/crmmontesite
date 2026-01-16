import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Save, 
  TestTube, 
  Loader2, 
  Key, 
  Link, 
  FileText,
  Zap,
  AlertCircle
} from "lucide-react";

interface IntegrationSettings {
  id: string;
  integration_name: string;
  webhook_url: string | null;
  api_key: string | null;
  active: boolean;
  description: string | null;
}

export function MakeIntegration() {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Fetch Make.com integration settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['integration-settings', 'make_delivery_term'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('integration_name', 'make_delivery_term')
        .single();
      
      if (error) throw error;
      return data as IntegrationSettings;
    }
  });

  // Fetch any partner API key to display as "our key"
  const { data: partnerToken } = useQuery({
    queryKey: ['partner-api-key'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('auth_token, name')
        .eq('active', true)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.webhook_url || "");
      setIsActive(settings.active);
    }
  }, [settings]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { webhook_url: string; active: boolean }) => {
      const { error } = await supabase
        .from('integration_settings')
        .update({
          webhook_url: data.webhook_url || null,
          active: data.active,
        })
        .eq('integration_name', 'make_delivery_term');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    }
  });

  const handleSave = () => {
    updateMutation.mutate({ webhook_url: webhookUrl, active: isActive });
  };

  const handleCopyToken = () => {
    if (partnerToken?.auth_token) {
      navigator.clipboard.writeText(partnerToken.auth_token);
      setCopied(true);
      toast.success("Token copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestConnection = async () => {
    if (!webhookUrl) {
      toast.error("Configure a URL do webhook primeiro");
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test_connection',
          timestamp: new Date().toISOString(),
          message: 'Teste de conexão do CRM MonteSite',
        }),
      });

      if (response.ok) {
        toast.success("Conexão testada com sucesso!");
      } else {
        toast.error(`Erro na conexão: ${response.status}`);
      }
    } catch (error) {
      toast.error("Erro ao testar conexão. Verifique a URL.");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-500" />
            Integração Make.com
          </h2>
          <p className="text-muted-foreground">
            Configure a integração para enviar termos de entrega automaticamente
          </p>
        </div>
        <Badge variant={isActive ? "default" : "secondary"} className="text-sm">
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {/* Our API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Nossa Chave de Autenticação
          </CardTitle>
          <CardDescription>
            Use esta chave no Make.com para autenticar chamadas de volta ao nosso sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partnerToken ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={partnerToken.auth_token || ""}
                    readOnly
                    className="pr-20 font-mono text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCopyToken}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Uso no Make.com:</strong> Adicione este token no header das requisições:
                </p>
                <code className="text-xs bg-background p-2 rounded block mt-2">
                  Authorization: Bearer [token]
                </code>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                Nenhum parceiro ativo encontrado. Crie um parceiro na aba "Parceiros" para gerar um token.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Make.com Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Webhook do Make.com
          </CardTitle>
          <CardDescription>
            Configure a URL do webhook para receber os dados do termo de entrega
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hook.us1.make.com/xxxxx"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Crie um webhook no Make.com e cole a URL aqui
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Integração Ativa</Label>
              <p className="text-xs text-muted-foreground">
                Ative para enviar dados automaticamente ao Make.com
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || !webhookUrl}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payload Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados Enviados ao Make.com
          </CardTitle>
          <CardDescription>
            Quando o cliente confirma o termo de entrega, estes dados são enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">📋 Dados do Projeto</p>
                <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                  <li>• Nome do cliente</li>
                  <li>• Domínio</li>
                  <li>• E-mail</li>
                  <li>• Telefone</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">✅ Dados do Termo</p>
                <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                  <li>• Nome completo</li>
                  <li>• CPF</li>
                  <li>• E-mail (para cópia)</li>
                  <li>• Nota de atendimento</li>
                  <li>• Comentários</li>
                  <li>• Data de aceite</li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="font-medium text-sm">📅 Datas Importantes</p>
              <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                <li>• <strong>reminder_date:</strong> Data para lembrete (30 dias após aceite)</li>
                <li>• <strong>timestamp:</strong> Data/hora do envio</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
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
  Lock,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthTokenService } from "@/services/authTokenService";

interface WebhookConfig {
  id?: string;
  name: string;
  webhook_url: string;
  auth_token: string;
  active: boolean;
  description?: string;
}

export const WebhookConfiguration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<WebhookConfig>({
    name: "Sistema Principal",
    webhook_url: "",
    auth_token: "",
    active: true,
    description: ""
  });
  
  const [showToken, setShowToken] = useState(false);

  // Buscar configuração existente
  const { data: partners } = useQuery({
    queryKey: ['webhook-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('name', 'Sistema Principal')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Atualizar estado quando dados carregarem
  useEffect(() => {
    if (partners) {
      setConfig({
        id: partners.id,
        name: partners.name,
        webhook_url: partners.webhook_url || "",
        auth_token: partners.auth_token || "",
        active: partners.active,
        description: ""
      });
    }
  }, [partners]);

  // Mutação para salvar configuração
  const saveConfigMutation = useMutation({
    mutationFn: async (data: WebhookConfig) => {
      if (data.id) {
        // Atualizar existente
        const { error } = await supabase
          .from('partners')
          .update({
            webhook_url: data.webhook_url || null,
            active: data.active
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Criar novo
        const authToken = await AuthTokenService.generateToken();
        
        const { data: newPartner, error } = await supabase
          .from('partners')
          .insert({
            name: data.name,
            hash: 'system_' + Date.now(),
            webhook_url: data.webhook_url || null,
            active: data.active
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Salvar token
        await AuthTokenService.saveTokenForPartner(newPartner.id, authToken);
        
        setConfig(prev => ({ 
          ...prev, 
          id: newPartner.id,
          auth_token: authToken.token 
        }));
      }
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva",
        description: "As configurações do webhook foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['webhook-config'] });
    },
    onError: (error) => {
      console.error('Error saving config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  });

  // Mutação para gerar novo token
  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      // Gerar o token primeiro
      const authToken = await AuthTokenService.generateToken();
      
      // Se não existe configuração, criar uma nova
      if (!config.id) {
        const { data: newPartner, error } = await supabase
          .from('partners')
          .insert({
            name: config.name,
            hash: 'system_' + Date.now(),
            webhook_url: config.webhook_url || null,
            active: config.active
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Salvar token para o novo parceiro
        await AuthTokenService.saveTokenForPartner(newPartner.id, authToken);
        
        // Atualizar estado local
        setConfig(prev => ({ 
          ...prev, 
          id: newPartner.id,
          auth_token: authToken.token 
        }));
        
        return authToken.token;
      } else {
        // Se já existe configuração, apenas regenerar o token
        await AuthTokenService.saveTokenForPartner(config.id, authToken);
        return authToken.token;
      }
    },
    onSuccess: (newToken) => {
      setConfig(prev => ({ ...prev, auth_token: newToken }));
      toast({
        title: "Token regenerado",
        description: "Um novo token de autenticação foi gerado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['webhook-config'] });
    },
    onError: (error) => {
      console.error('Error generating token:', error);
      toast({
        title: "Erro ao gerar token",
        description: "Não foi possível gerar um novo token.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const handleGenerateToken = () => {
    generateTokenMutation.mutate();
  };

  const handleTest = async () => {
    if (!config.webhook_url) {
      toast({
        title: "URL necessária",
        description: "Configure uma URL antes de testar.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Teste iniciado",
      description: "Enviando webhook de teste para a URL configurada...",
    });

    try {
      const testPayload = {
        type: "test",
        message: "Webhook de teste do sistema",
        timestamp: new Date().toISOString()
      };

      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.auth_token}`
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Teste bem-sucedido",
          description: "O webhook respondeu corretamente.",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Teste falhou",
        description: "Erro ao conectar com o webhook.",
        variant: "destructive"
      });
    }
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
      {/* Configuração Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuração de Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://seu-site.com/webhook"
                value={config.webhook_url}
                onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(config.webhook_url, "URL do webhook")}
                disabled={!config.webhook_url}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auth-token">Token de Autenticação</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateToken}
                  disabled={generateTokenMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 ${generateTokenMutation.isPending ? 'animate-spin' : ''}`} />
                  Gerar Novo
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="auth-token"
                type={showToken ? "text" : "password"}
                value={config.auth_token}
                readOnly
                className="bg-muted"
                placeholder={config.auth_token ? "Token configurado" : "Nenhum token gerado"}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(config.auth_token, "Token de autenticação")}
                disabled={!config.auth_token}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Este token deve ser usado no header Authorization: Bearer [token]
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="webhook-active"
                checked={config.active}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="webhook-active">Webhook Ativo</Label>
            </div>
            <Badge variant={config.active ? "default" : "secondary"}>
              {config.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex items-center gap-2"
              disabled={saveConfigMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTest} 
              className="flex items-center gap-2"
              disabled={!config.webhook_url || !config.auth_token}
            >
              <TestTube className="h-4 w-4" />
              Testar Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nossos Endpoints */}
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
              Endpoint ativo com autenticação por token
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Autenticação</h4>
                <p className="text-sm text-blue-700">
                  Todos os requests devem incluir o header: <code>Authorization: Bearer [seu-token]</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

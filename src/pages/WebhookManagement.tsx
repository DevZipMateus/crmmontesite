
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook, 
  Send, 
  Download as ReceiveIcon, 
  Settings, 
  Plus,
  ExternalLink,
  Code,
  Book,
  AlertCircle,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";
import { WebhookConfiguration } from "@/components/webhook/WebhookConfiguration";
import { WebhookDocumentation } from "@/components/webhook/WebhookDocumentation";
import { WebhookLogs } from "@/components/webhook/WebhookLogs";
import { ApiManagement } from "@/components/webhook/ApiManagement";
import { AuthenticationLogs } from "@/components/webhook/AuthenticationLogs";

export default function WebhookManagement() {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <PageLayout 
      title="Gerenciamento de Webhooks"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-700">
            <Zap className="h-3 w-3 mr-1" />
            Processamento Automático
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            <Webhook className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Automation Status Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Processamento Automático Ativado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Webhooks são processados automaticamente quando criados</p>
              <p>✅ Notificações instantâneas para parceiros</p>
              <p>✅ Falhas são registradas automaticamente</p>
              <p className="text-xs text-green-600 mt-2">
                O sistema agora processa webhooks em tempo real usando triggers do banco de dados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">URLs Configuradas</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Endpoints ativos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dados Recebidos</CardTitle>
              <ReceiveIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Webhooks processados hoje
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dados Enviados</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                Notificações enviadas hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="docs">
              <Book className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Code className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="auth">
              <Shield className="h-4 w-4 mr-2" />
              Autenticação
            </TabsTrigger>
            <TabsTrigger value="apis">
              <ExternalLink className="h-4 w-4 mr-2" />
              APIs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <WebhookConfiguration />
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <WebhookDocumentation />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <WebhookLogs />
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <AuthenticationLogs />
          </TabsContent>

          <TabsContent value="apis" className="space-y-4">
            <ApiManagement />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Webhook, FileText, Send, ExternalLink } from "lucide-react";

export const QuickSetupGuide = () => {
  const openFormExample = () => {
    window.open('https://montesite.com.br/exemplo123', '_blank');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Guia de Configuração Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" />
                Para Enviar Dados
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  Obtenha seu token de autenticação
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  Configure endpoint receive-partner-data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  Teste criação de projetos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  Monitore logs de autenticação
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Para Receber Notificações
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">1.</span>
                  Configure sua URL de webhook
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">2.</span>
                  Implemente receptor HTTP POST
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">3.</span>
                  Teste conectividade
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">4.</span>
                  Monitore logs de webhook
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              Configuração de Formulários
            </h4>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
              <p className="text-sm text-blue-800">
                <strong>Novo Sistema de Formulários:</strong> Agora os clientes podem preencher formulários de personalização através de URLs únicas.
              </p>
              
              <div className="space-y-2">
                <p className="text-sm text-blue-700"><strong>Fluxo:</strong></p>
                <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                  <li>Parceiro cria projeto via API → Sistema gera hash única</li>
                  <li>Cliente acessa https://montesite.com.br/{"{hash}"}</li>
                  <li>Cliente escolhe modelo e preenche preferências</li>
                  <li>Dados são enviados automaticamente para o sistema</li>
                  <li>Projeto é atualizado e webhooks são disparados</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Endpoint: /receive-form-data</Badge>
                <Badge variant="outline" className="text-xs">Público (sem autenticação)</Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={openFormExample}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Exemplo de Formulário
              </Button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Sistema Totalmente Automatizado</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Projetos são criados automaticamente quando os dados chegam</li>
              <li>• Formulários preenchidos atualizam projetos em tempo real</li>
              <li>• Webhooks são enviados automaticamente nas mudanças</li>
              <li>• Logs completos para debugging e auditoria</li>
              <li>• Interface visual mostra status de cada projeto</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

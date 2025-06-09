
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

export const QuickSetupGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Guia de Configuração Rápida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Para Receber Dados</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Configure sua URL de webhook</li>
              <li>• Defina um token de autenticação</li>
              <li>• Teste a conectividade</li>
              <li>• Monitore os logs</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Para Enviar Dados</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Adicione APIs de destino</li>
              <li>• Configure autenticação</li>
              <li>• Teste os endpoints</li>
              <li>• Ative as notificações</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

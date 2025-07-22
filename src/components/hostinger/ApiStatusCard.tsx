
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const ApiStatusCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Status da API Hostinger DNS
        </CardTitle>
        <CardDescription>
          Informações sobre a disponibilidade da API de DNS da Hostinger
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Não Disponível Publicamente</AlertTitle>
          <AlertDescription>
            Nossa investigação indica que a API de DNS da Hostinger não está disponível publicamente ou requer 
            credenciais especiais. Os testes realizados retornam erro 1016 (Cloudflare) ou erro 530.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">O que isso significa?</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>A Hostinger não parece disponibilizar uma API pública para gerenciamento de DNS</li>
            <li>O token fornecido pode ser para outro serviço da Hostinger (como VPS ou Hospedagem)</li>
            <li>O gerenciamento de DNS na Hostinger provavelmente é restrito ao painel de controle (hPanel)</li>
            <li>Alterações de DNS precisam ser feitas manualmente através da interface web da Hostinger</li>
          </ul>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Verificações Realizadas</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
              <p className="text-gray-700">
                $ curl -X GET "https://api.hostinger.com/dns/v1/zones" \<br />
                -H "Authorization: Bearer [TOKEN]" \<br />
                -H "Content-Type: application/json"
              </p>
              <p className="text-red-500 mt-2">error code: 1016</p>
            </div>
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">Erro 1016:</span> Origem indisponível (Cloudflare). 
              Isso indica que o servidor origem não existe ou não está acessível publicamente.
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Próximos Passos Recomendados</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="min-w-5 mt-1">
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                <strong>Contate o Suporte da Hostinger:</strong> Pergunte se existe uma API pública para 
                gerenciamento de DNS e solicite a documentação oficial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-5 mt-1">
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                <strong>Utilize o hPanel:</strong> Gerencie seus registros DNS manualmente através 
                do painel de controle da Hostinger.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-5 mt-1">
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                <strong>Considere alternativas:</strong> Se automação é essencial, considere 
                migrar para provedores de DNS com APIs públicas bem documentadas.
              </span>
            </li>
          </ul>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Última verificação: {new Date().toLocaleDateString()}
          </div>
          <a 
            href="https://www.hostinger.com/contact" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            Contatar Suporte Hostinger <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusCard;

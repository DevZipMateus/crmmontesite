
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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>API Disponível em Acesso Restrito</AlertTitle>
          <AlertDescription>
            A API de DNS da Hostinger está documentada em developers.hostinger.com e utiliza 
            endpoints como <code>/api/dns/v1/zones/{'{domain}'}</code>. O acesso pode requerer 
            permissões especiais na sua conta Hostinger.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Detalhes da API</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>A API DNS da Hostinger é documentada oficialmente</li>
            <li>Os endpoints para gerenciamento de DNS estão em <code>/api/dns/v1/zones</code></li>
            <li>É necessário um token de API com permissões adequadas</li>
            <li>O acesso pode ser limitado a contas específicas ou planos empresariais</li>
          </ul>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endpoints Principais</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
              <p className="text-gray-700">
                GET /api/dns/v1/zones/{'{domain}'}<br />
                # Lista todos os registros DNS para um domínio
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
              <p className="text-gray-700">
                PUT /api/dns/v1/zones/{'{domain}'}<br />
                # Atualiza registros DNS para um domínio
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
              <p className="text-gray-700">
                POST /api/dns/v1/zones/{'{domain}'}/reset<br />
                # Redefine registros DNS para os padrões
              </p>
            </div>
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
                <strong>Verifique o acesso à API:</strong> Tente autenticar com seu token e verifique se você tem 
                permissões para gerenciar DNS na API da Hostinger.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-5 mt-1">
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                <strong>Contate o Suporte da Hostinger:</strong> Caso não consiga acessar a API de DNS, 
                pergunte ao suporte se sua conta tem permissões ou se há requisitos adicionais.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-5 mt-1">
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                <strong>Utilize o hPanel para gerenciamento manual:</strong> Se a API não estiver acessível, 
                você ainda pode gerenciar seus registros DNS manualmente através do painel de controle da Hostinger.
              </span>
            </li>
          </ul>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Última atualização: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <a 
              href="https://developers.hostinger.com/api/dns/v1/zones" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              Documentação API <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://www.hostinger.com/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              Contatar Suporte <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusCard;

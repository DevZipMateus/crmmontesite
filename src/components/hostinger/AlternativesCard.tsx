import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, Cloud, Globe, Shield, Zap, Info } from 'lucide-react';

interface ProviderCardProps {
  name: string;
  logo: React.ReactNode;
  description: string;
  features: string[];
  apiLink: string;
  docsLink: string;
  pricing: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ name, logo, description, features, apiLink, docsLink, pricing }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            {logo}
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Recursos principais:</p>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-sm">
          <p className="font-medium">Preço:</p>
          <p>{pricing}</p>
        </div>
        
        <Separator />
        
        <div className="flex gap-2 flex-wrap">
          <Button asChild size="sm" variant="outline">
            <a href={apiLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              API <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={docsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              Documentação <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AlternativesCard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Alternativas para Gerenciamento de DNS
          </CardTitle>
          <CardDescription>
            Provedores de DNS com APIs públicas bem documentadas para automação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <p className="text-blue-800 font-medium">Por que considerar alternativas?</p>
                <p className="text-sm text-blue-700">
                  Como a API de DNS da Hostinger não parece estar publicamente disponível,
                  você pode considerar migrar seus serviços de DNS para provedores que oferecem
                  APIs robustas e bem documentadas, permitindo automação e gerenciamento programático.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProviderCard 
              name="Cloudflare"
              logo={<Cloud className="h-6 w-6 text-orange-500" />}
              description="Proteção DDoS e gerenciamento DNS avançado"
              features={[
                "API REST completa para gerenciamento de DNS",
                "Proteção DDoS gratuita",
                "CDN global integrada",
                "Regras de firewall e segurança",
                "Documentação completa e SDKs"
              ]}
              apiLink="https://api.cloudflare.com/"
              docsLink="https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records"
              pricing="Plano gratuito disponível com recursos essenciais"
            />
            
            <ProviderCard 
              name="AWS Route 53"
              logo={<Cloud className="h-6 w-6 text-blue-700" />}
              description="Serviço DNS de alta disponibilidade da Amazon"
              features={[
                "API completa para gerenciamento automatizado",
                "Alta disponibilidade global",
                "Integração com outros serviços AWS",
                "DNS avançado com health checks",
                "Gerenciamento de tráfego sofisticado"
              ]}
              apiLink="https://docs.aws.amazon.com/Route53/latest/APIReference/Welcome.html"
              docsLink="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html"
              pricing="Pay-per-use, $0.50 por zona/mês + queries"
            />
            
            <ProviderCard 
              name="DigitalOcean DNS"
              logo={<Cloud className="h-6 w-6 text-blue-500" />}
              description="DNS gerenciado simples e eficiente"
              features={[
                "API REST fácil de usar",
                "Interface simplificada",
                "Boa integração com outros serviços",
                "Documentação clara e objetiva",
                "Gerenciamento de domínios"
              ]}
              apiLink="https://docs.digitalocean.com/reference/api/api-reference/#tag/Domains"
              docsLink="https://docs.digitalocean.com/products/networking/dns/"
              pricing="Gratuito com conta DigitalOcean"
            />
            
            <ProviderCard 
              name="Namecheap FreeDNS"
              logo={<Shield className="h-6 w-6 text-green-600" />}
              description="DNS gerenciado gratuito com API"
              features={[
                "API para gerenciamento de registros",
                "Interface web simples",
                "Tempos de propagação rápidos",
                "Suporte para registros básicos e avançados",
                "Integração com registro de domínios"
              ]}
              apiLink="https://www.namecheap.com/support/api/intro/"
              docsLink="https://www.namecheap.com/support/knowledgebase/article.aspx/29/11/how-to-use-namecheaps-freedns-service/"
              pricing="Gratuito para uso básico"
            />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Como migrar seu DNS</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Exporte seus registros DNS atuais</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      No painel da Hostinger, acesse a seção DNS e anote todos os registros existentes 
                      (tipo, nome, valor, TTL). Isso garantirá que você não perca nenhuma configuração.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Crie uma conta no novo provedor DNS</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Registre-se em um dos provedores sugeridos acima e adicione seu domínio à plataforma.
                      Não altere os nameservers do seu domínio ainda.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Recrie seus registros DNS</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Adicione todos os registros que você exportou no passo 1 ao seu novo provedor de DNS.
                      Verifique cada registro com cuidado para evitar erros.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Atualize os nameservers do seu domínio</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      No painel da Hostinger, altere os nameservers do seu domínio para os fornecidos pelo 
                      novo provedor DNS. Esta alteração pode levar até 48 horas para se propagar globalmente.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Configure a API e automatize</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Gere as credenciais de API no novo provedor e utilize-as para automatizar o 
                      gerenciamento de DNS conforme necessário.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlternativesCard;

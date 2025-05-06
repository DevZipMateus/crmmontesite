
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface PersonalizationDataProps {
  personalization: any;
}

export const PersonalizationData: React.FC<PersonalizationDataProps> = ({ personalization }) => {
  if (!personalization) return null;
  
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle>Dados da Personalização</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Informações Básicas</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Nome da Empresa:</span> {personalization.officenome}</p>
                <p><span className="font-medium">Responsável:</span> {personalization.responsavelnome}</p>
                <p><span className="font-medium">Telefone:</span> {personalization.telefone}</p>
                <p><span className="font-medium">Email:</span> {personalization.email}</p>
                <p><span className="font-medium">Endereço:</span> {personalization.endereco}</p>
              </div>
            </div>
            
            {personalization.redessociais && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Redes Sociais</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.redessociais}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Identidade Visual</h3>
              <div className="mt-2 space-y-2">
                {personalization.fonte && (
                  <p><span className="font-medium">Fonte:</span> {personalization.fonte}</p>
                )}
                {personalization.paletacores && (
                  <p><span className="font-medium">Paleta de cores:</span> {personalization.paletacores}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
              <p className="mt-2">{personalization.descricao}</p>
            </div>
            
            {personalization.slogan && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Slogan</h3>
                <p className="mt-2">{personalization.slogan}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Serviços</h3>
          <p className="whitespace-pre-line">{personalization.servicos}</p>
        </div>
        
        {personalization.possuiplanos && personalization.planos && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Planos</h3>
            <p className="whitespace-pre-line">{personalization.planos}</p>
          </div>
        )}
        
        {personalization.depoimentos && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Depoimentos</h3>
            <p className="whitespace-pre-line">{personalization.depoimentos}</p>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Configurações Adicionais</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Botão WhatsApp:</span> {personalization.botaowhatsapp ? 'Sim' : 'Não'}</p>
            <p><span className="font-medium">Possui mapa:</span> {personalization.possuimapa ? 'Sim' : 'Não'}</p>
            {personalization.possuimapa && personalization.linkmapa && (
              <p>
                <span className="font-medium">Link do mapa:</span>{' '}
                <a 
                  href={personalization.linkmapa} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Ver mapa <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


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
                {personalization.cnpj_cpf && (
                  <p><span className="font-medium">CNPJ/CPF:</span> {personalization.cnpj_cpf}</p>
                )}
                <p><span className="font-medium">Telefone:</span> {personalization.telefone}</p>
                <p><span className="font-medium">Email:</span> {personalization.email}</p>
                {(personalization.cep || personalization.logradouro || personalization.cidade) ? (
                  <div className="space-y-1">
                    <p><span className="font-medium">Endereço:</span></p>
                    <div className="pl-3 text-sm text-muted-foreground space-y-0.5">
                      {personalization.cep && <p>CEP: {personalization.cep}</p>}
                      {(personalization.logradouro || personalization.numero) && (
                        <p>{[personalization.logradouro, personalization.numero].filter(Boolean).join(", ")}</p>
                      )}
                      {personalization.complemento && <p>Complemento: {personalization.complemento}</p>}
                      {personalization.bairro && <p>Bairro: {personalization.bairro}</p>}
                      {(personalization.cidade || personalization.estado) && (
                        <p>{[personalization.cidade, personalization.estado].filter(Boolean).join("/")}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p><span className="font-medium">Endereço:</span> {personalization.endereco}</p>
                )}
                {personalization.horario_funcionamento && (
                  <p><span className="font-medium">Horário de Funcionamento:</span> {personalization.horario_funcionamento}</p>
                )}
                {personalization.status && (
                  <p><span className="font-medium">Status:</span> {personalization.status}</p>
                )}
              </div>
            </div>
            
            {personalization.redessociais && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Redes Sociais</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.redessociais}</p>
              </div>
            )}
            
            {personalization.modelo && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                <p className="mt-2">{personalization.modelo}</p>
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
            
            {personalization.visao_missao_valores && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Visão, Missão e Valores</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.visao_missao_valores}</p>
              </div>
            )}
            
            {personalization.historia_empresa && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">História da Empresa</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.historia_empresa}</p>
              </div>
            )}
            
            {personalization.mercado_atuacao && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mercado de Atuação</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.mercado_atuacao}</p>
              </div>
            )}
            
            {personalization.descricao && !personalization.visao_missao_valores && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="mt-2 whitespace-pre-line">{personalization.descricao}</p>
              </div>
            )}
            
            {personalization.slogan && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Slogan</h3>
                <p className="mt-2">{personalization.slogan}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Datas</h3>
              <div className="mt-2 space-y-2">
                {personalization.created_at && (
                  <p>
                    <span className="font-medium">Criado em:</span>{' '}
                    {new Date(personalization.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {personalization.updated_at && personalization.updated_at !== personalization.created_at && (
                  <p>
                    <span className="font-medium">Atualizado em:</span>{' '}
                    {new Date(personalization.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {personalization.produtos && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Produtos</h3>
            <p className="whitespace-pre-line">{personalization.produtos}</p>
          </div>
        )}
        
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

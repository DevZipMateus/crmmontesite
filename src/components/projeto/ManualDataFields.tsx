import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const ManualDataFields: React.FC = () => {
  return (
    <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
      <h4 className="font-medium text-sm text-gray-700">Campos adicionais para preenchimento manual</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="office_name">Nome do escritório/empresa</Label>
          <Input 
            id="office_name" 
            placeholder="Ex: Advocacia Silva" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            placeholder="Ex: (11) 99999-9999"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="services">Serviços oferecidos</Label>
        <Textarea 
          id="services" 
          placeholder="Liste os principais serviços separados por vírgula"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input 
          id="address" 
          placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Ex: contato@empresa.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="social_media">Redes sociais</Label>
          <Input 
            id="social_media" 
            placeholder="Ex: @empresa"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do negócio</Label>
        <Textarea 
          id="description" 
          placeholder="Descreva brevemente o negócio e sua proposta de valor"
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slogan">Slogan</Label>
        <Input 
          id="slogan" 
          placeholder="Ex: Soluções jurídicas para o seu negócio"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="font">Fonte preferida</Label>
        <Input 
          id="font" 
          placeholder="Ex: Roboto, Open Sans, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="colorPalette">Paleta de cores</Label>
        <Input 
          id="colorPalette" 
          placeholder="Ex: Azul, cinza e branco"
        />
      </div>
      
      <div className="space-y-2 pt-2">
        <h5 className="font-medium text-sm text-gray-700 mb-2">Planos de negócio</h5>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox id="hasPlans" />
          <label
            htmlFor="hasPlans"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Possui planos de negócios
          </label>
        </div>
        <Textarea 
          id="businessPlans" 
          placeholder="Descreva os planos oferecidos (nome, valor, serviços incluídos)"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="testimonials">Depoimentos de clientes</Label>
        <Textarea 
          id="testimonials" 
          placeholder="Inclua depoimentos de clientes no formato: Nome, empresa: Depoimento"
          rows={3}
        />
      </div>
      
      <div className="mt-4 space-y-2">
        <h5 className="font-medium text-sm text-gray-700 mb-2">Configurações adicionais</h5>
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="whatsappButton" defaultChecked />
            <label
              htmlFor="whatsappButton"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir botão do WhatsApp
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="hasMap" />
            <label
              htmlFor="hasMap"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir mapa do Google
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mapLink">Link do Google Maps</Label>
        <Input 
          id="mapLink" 
          placeholder="Cole aqui o link compartilhável do Google Maps"
        />
        <p className="text-xs text-muted-foreground">
          Copie o link do seu endereço no Google Maps clicando em "Compartilhar" e depois em "Incorporar um mapa"
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="uploadLogo">Upload da Logo</Label>
        <Input 
          id="uploadLogo"
          type="file"
          accept="image/*"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="uploadImages">Upload de imagens adicionais</Label>
        <Input 
          id="uploadImages"
          type="file"
          accept="image/*,video/*,.gif"
          multiple
        />
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: imagens (JPG, PNG), vídeos (MP4) e GIFs.
        </p>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Estes campos são opcionais e complementam as informações básicas do projeto.
      </p>
    </div>
  );
};

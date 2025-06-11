
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LogoUploader from "./LogoUploader";
import MediaUploader from "./MediaUploader";
import { UseFormReturn } from "react-hook-form";

export interface FormValues {
  nome_empresa: string;
  email: string;
  telefone: string;
  sobre_empresa?: string;
  servicos?: string;
  endereco?: string;
  horario_funcionamento?: string;
  redes_sociais?: string;
  cores_preferidas?: string;
  estilo_visual?: string;
  observacoes?: string;
  possuiPlanos?: boolean;
  planos?: string;
  depoimentos?: string;
  botaoWhatsapp?: boolean;
  possuiMapa?: boolean;
  linkMapa?: string;
}

interface PersonalizeBasicFormProps {
  form: UseFormReturn<FormValues>;
  logoPreview: string | null;
  depoimentoPreviews: string[];
  midiaPreviews: string[];
  midiaCaptions: string[];
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLogo: () => void;
  handleDepoimentoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDepoimento: (index: number) => void;
  handleMidiaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveMidia: (index: number) => void;
  handleUpdateMidiaCaption: (index: number, caption: string) => void;
}

export const PersonalizeBasicForm: React.FC<PersonalizeBasicFormProps> = ({
  form,
  logoPreview,
  depoimentoPreviews,
  midiaPreviews,
  midiaCaptions,
  handleLogoUpload,
  handleRemoveLogo,
  handleDepoimentoUpload,
  handleRemoveDepoimento,
  handleMidiaUpload,
  handleRemoveMidia,
  handleUpdateMidiaCaption,
}) => {
  return (
    <div className="space-y-6">
      {/* Nome da empresa */}
      <FormField
        control={form.control}
        name="nome_empresa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Empresa *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o nome da sua empresa"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="seu@email.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Telefone */}
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input 
                placeholder="(11) 99999-9999"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sobre a empresa */}
      <FormField
        control={form.control}
        name="sobre_empresa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sobre a Empresa</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Conte um pouco sobre sua empresa..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Logo Upload */}
      <LogoUploader 
        preview={logoPreview}
        onUpload={handleLogoUpload}
        onRemove={handleRemoveLogo}
      />

      {/* Depoimentos Upload */}
      <MediaUploader
        label="Depoimentos de Clientes"
        description="Faça upload de imagens com depoimentos dos seus clientes"
        accept="image/*"
        multiple={true}
        previews={depoimentoPreviews}
        onUpload={handleDepoimentoUpload}
        onRemove={handleRemoveDepoimento}
      />

      {/* Mídias Upload */}
      <MediaUploader
        label="Mídias da Empresa"
        description="Fotos, vídeos ou outras mídias da sua empresa"
        accept="image/*,video/*"
        multiple={true}
        previews={midiaPreviews}
        captions={midiaCaptions}
        onUpload={handleMidiaUpload}
        onRemove={handleRemoveMidia}
        onUpdateCaption={handleUpdateMidiaCaption}
        allowCaptions={true}
      />
    </div>
  );
};

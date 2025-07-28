
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LogoUploader from "./LogoUploader";
import { UseFormReturn } from "react-hook-form";
import { formatCnpjCpf, getCnpjCpfPlaceholder } from "@/utils/documentFormatter";

export interface FormValues {
  nome_empresa: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  sobre_empresa: string;
  slogan?: string;
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
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLogo: () => void;
}

export const PersonalizeBasicForm: React.FC<PersonalizeBasicFormProps> = ({
  form,
  logoPreview,
  handleLogoUpload,
  handleRemoveLogo,
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

      {/* CNPJ/CPF */}
      <FormField
        control={form.control}
        name="cnpj_cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNPJ ou CPF *</FormLabel>
            <FormControl>
              <Input 
                placeholder={getCnpjCpfPlaceholder(field.value || "")}
                {...field}
                onChange={(e) => {
                  const formattedValue = formatCnpjCpf(e.target.value);
                  field.onChange(formattedValue);
                }}
                maxLength={18} // XX.XXX.XXX/XXXX-XX
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Endereço */}
      <FormField
        control={form.control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Rua, número, bairro, cidade - CEP"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Horário de Funcionamento */}
      <FormField
        control={form.control}
        name="horario_funcionamento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário de Funcionamento *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h"
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
            <FormLabel>Sobre a Empresa *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Conte um pouco sobre sua empresa, história, missão, valores... (obrigatório)"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slogan */}
      <FormField
        control={form.control}
        name="slogan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slogan da Empresa</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o slogan da sua empresa"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Redes Sociais */}
      <FormField
        control={form.control}
        name="redes_sociais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Redes Sociais</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Links das suas redes sociais (Instagram, Facebook, LinkedIn, etc.)"
                className="min-h-[80px]"
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

      {/* Cores Preferidas */}
      <FormField
        control={form.control}
        name="cores_preferidas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cores Preferidas</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Azul marinho, branco, dourado"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estilo Visual */}
      <FormField
        control={form.control}
        name="estilo_visual"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estilo Visual Desejado</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o estilo visual que deseja (moderno, clássico, minimalista, etc.)"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

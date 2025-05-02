import React from "react";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import LogoUploader from "./LogoUploader";

export const personalizeFormSchema = z.object({
  officeNome: z.string().min(2, "Nome da empresa/escritório é obrigatório"),
  responsavelNome: z.string().min(2, "Nome do responsável é obrigatório"),
  telefone: z.string().min(10, "Telefone deve conter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  redesSociais: z.string().optional(),
  logo: z.any().optional(),
  fonte: z.string().optional(),
  paletaCores: z.string().optional(),
  descricao: z.string().min(10, "Descreva seu escritório com pelo menos 10 caracteres"),
  slogan: z.string().optional(),
  possuiPlanos: z.boolean().default(false),
  planos: z.string().optional(),
  servicos: z.string().min(5, "Liste pelo menos um serviço de destaque"),
  depoimentos: z.string().optional(),
  botaoWhatsapp: z.boolean().default(true),
  possuiMapa: z.boolean().default(false),
  linkMapa: z.string().optional(),
  modelo: z.string().optional(),
  midias: z.any().optional(),
});

export type FormValues = z.infer<typeof personalizeFormSchema>;

interface PersonalizeBasicFormProps {
  form: UseFormReturn<FormValues>;
  logoPreview: string | null;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalizeBasicForm: React.FC<PersonalizeBasicFormProps> = ({
  form,
  logoPreview,
  handleLogoUpload,
}) => {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Básicas</h3>
        
        <FormField
          control={form.control}
          name="officeNome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa/Escritório*</FormLabel>
              <FormControl>
                <Input placeholder="Nome da sua empresa ou escritório" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsavelNome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Responsável*</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone/WhatsApp*</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail para Contato*</FormLabel>
                <FormControl>
                  <Input placeholder="seuemail@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo*</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, bairro, cidade, estado, CEP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="redesSociais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redes Sociais</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Instagram: @seuinsta&#10;Facebook: /suapagina&#10;LinkedIn: /suapagina" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Inclua os links das suas redes sociais separados por quebra de linha.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Identidade Visual</h3>
        
        <LogoUploader preview={logoPreview} onUpload={handleLogoUpload} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fonte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte Preferida (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Roboto, Open Sans, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paletaCores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paleta de Cores (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Azul, cinza e branco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Escritório*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva seu escritório, histórico, diferenciais..."
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slogan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frase ou Slogan</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Um slogan que represente seu escritório" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PersonalizeBasicForm;

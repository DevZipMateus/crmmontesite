
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LogoUploader from "./LogoUploader";
import { UseFormReturn } from "react-hook-form";
import { formatCnpjCpf, getCnpjCpfPlaceholder } from "@/utils/documentFormatter";
import { formatCep, buildEnderecoCompleto, UF_LIST } from "@/utils/enderecoUtils";

export interface FormValues {
  nome_empresa: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  visao_missao_valores: string;
  historia_empresa: string;
  mercado_atuacao: string;
  slogan?: string;
  possuiServicos?: boolean;
  servicosOferecidos?: string;
  possuiProdutos?: boolean;
  produtos?: string;
  // Endereço estruturado (novos campos)
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  // Campo legado (mantido para compatibilidade — preenchido automaticamente)
  endereco?: string;
  horario_funcionamento?: string;
  redes_sociais?: string;
  cores_preferidas?: string;
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
  logoFileName?: string | null;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLogo: () => void;
}

export const PersonalizeBasicForm: React.FC<PersonalizeBasicFormProps> = ({
  form,
  logoPreview,
  logoFileName,
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

      {/* Email Empresarial */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Empresarial *</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="contato@suaempresa.com (email por onde seu cliente entra em contato com você)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Telefone da Empresa */}
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone da Empresa *</FormLabel>
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

      {/* Endereço estruturado */}
      <div className="space-y-4 border rounded-md p-4 bg-muted/20">
        <h4 className="text-sm font-medium">Endereço *</h4>

        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  placeholder="00000-000"
                  maxLength={9}
                  {...field}
                  value={field.value || ""}
                  onChange={async (e) => {
                    const formatted = formatCep(e.target.value);
                    field.onChange(formatted);
                    const digits = formatted.replace(/\D/g, "");
                    if (digits.length === 8) {
                      const { fetchViaCep } = await import("@/utils/enderecoUtils");
                      const data = await fetchViaCep(digits);
                      if (data) {
                        form.setValue("logradouro", data.logradouro || "", { shouldValidate: true });
                        form.setValue("bairro", data.bairro || "", { shouldValidate: true });
                        form.setValue("cidade", data.cidade || "", { shouldValidate: true });
                        form.setValue("estado", data.estado || "", { shouldValidate: true });
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="logradouro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Avenida..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input placeholder="Sala, Andar, Bloco (opcional)" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Bairro" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UF_LIST.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>



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

      {/* Seção Sobre a Empresa */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Sobre a Empresa</h3>
        
        {/* Visão, Missão e Valores */}
        <FormField
          control={form.control}
          name="visao_missao_valores"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visão, Missão e Valores *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Se não tiver, coloque no ChatGPT o nome da empresa e peça para ele criar"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* História da Empresa */}
        <FormField
          control={form.control}
          name="historia_empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>História da Empresa *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Como surgiu, quando surgiu, qual o objetivo"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mercado no Qual Atuamos */}
        <FormField
          control={form.control}
          name="mercado_atuacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mercado no Qual Atuamos</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Atuamos no mercado X trazendo a melhor qualidade..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Slogan */}
      <FormField
        control={form.control}
        name="slogan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slogan (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Frase de efeito (ex: Red Bull te dá asas)"
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
        fileName={logoFileName}
        onUpload={handleLogoUpload}
        onRemove={handleRemoveLogo}
      />

      {/* Cores que Quer no Site */}
      <FormField
        control={form.control}
        name="cores_preferidas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cores que Quer no Site</FormLabel>
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
    </div>
  );
};

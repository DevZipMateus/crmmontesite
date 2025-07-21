
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PersonalizeBasicForm } from "./PersonalizeBasicForm";
import { PersonalizeServicosForm } from "./PersonalizeServicosForm";
import { PersonalizeConfigForm } from "./PersonalizeConfigForm";
import { useFileUploadHandlers } from "./FileUploadHandlers";
import { useFormSubmission } from "./useFormSubmission";
import type { FormValues } from "./PersonalizeBasicForm";
import { CheckCircle } from "lucide-react";
import { validateCnpjCpf } from "@/utils/documentFormatter";

const formSchema = z.object({
  nome_empresa: z.string().min(2, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cnpj_cpf: z.string()
    .min(11, "CNPJ ou CPF é obrigatório")
    .refine((value) => validateCnpjCpf(value), "Digite um CNPJ (14 dígitos) ou CPF (11 dígitos) válido"),
  sobre_empresa: z.string().min(10, "Sobre a empresa é obrigatório (mínimo 10 caracteres)"),
  slogan: z.string().optional(),
  servicos: z.string().optional(),
  endereco: z.string().optional(),
  horario_funcionamento: z.string().optional(),
  redes_sociais: z.string().optional(),
  cores_preferidas: z.string().optional(),
  estilo_visual: z.string().optional(),
  observacoes: z.string().optional(),
  possuiPlanos: z.boolean().optional(),
  planos: z.string().optional(),
  depoimentos: z.string().optional(),
  botaoWhatsapp: z.boolean().optional(),
  possuiMapa: z.boolean().optional(),
  linkMapa: z.string().optional(),
});

interface PersonalizeFormProps {
  modeloSelecionado: string;
  projectHash?: string;
  onSuccess?: () => void;
}

export const PersonalizeForm: React.FC<PersonalizeFormProps> = ({
  modeloSelecionado,
  projectHash,
  onSuccess
}) => {
  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  // File upload handlers
  const fileHandlers = useFileUploadHandlers({
    setLogoFile,
    setLogoPreview,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews,
    setMidiaCaptions
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_empresa: "",
      email: "",
      telefone: "",
      cnpj_cpf: "",
      sobre_empresa: "",
      slogan: "",
      servicos: "",
      endereco: "",
      horario_funcionamento: "",
      redes_sociais: "",
      cores_preferidas: "",
      estilo_visual: "",
      observacoes: "",
      possuiPlanos: false,
      planos: "",
      depoimentos: "",
      botaoWhatsapp: false,
      possuiMapa: false,
      linkMapa: "",
    },
  });

  const { isSubmitting, isSubmitted, onSubmit } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions,
    modeloSelecionado,
    projectHash,
    onSuccess
  });

  // Estado de confirmação MELHORADO
  if (isSubmitted) {
    console.log("✅ Exibindo estado de confirmação");
    return (
      <div className="space-y-6 text-center py-12">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Formulário Enviado com Sucesso!
          </h3>
          <p className="text-gray-600 mb-4">
            Suas informações foram processadas. Você será redirecionado para a página de confirmação...
          </p>
          <div className="text-sm text-gray-500">
            Se não for redirecionado automaticamente, <a href="/confirmacao" className="text-blue-600 hover:underline">clique aqui</a>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Informações Básicas */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
              <p className="text-sm text-gray-500 mt-1">Dados principais da sua empresa</p>
            </div>
            <PersonalizeBasicForm
              form={form}
              logoPreview={logoPreview}
              handleLogoUpload={fileHandlers.handleLogoUpload}
              handleRemoveLogo={fileHandlers.handleRemoveLogo}
            />
          </div>

          {/* Serviços & Conteúdo */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Serviços & Conteúdo</h3>
              <p className="text-sm text-gray-500 mt-1">Detalhes sobre seus serviços e depoimentos</p>
            </div>
            <PersonalizeServicosForm 
              form={form}
              depoimentoPreviews={depoimentoPreviews}
              handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
              handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
            />
          </div>

          {/* Configurações */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Configurações</h3>
              <p className="text-sm text-gray-500 mt-1">Configurações adicionais do seu site</p>
            </div>
            <PersonalizeConfigForm 
              form={form}
              midiaPreviews={midiaPreviews}
              midiaCaptions={midiaCaptions}
              handleMidiaUpload={fileHandlers.handleMidiaUpload}
              handleRemoveMidia={fileHandlers.handleRemoveMidia}
              handleUpdateMidiaCaption={fileHandlers.handleUpdateMidiaCaption}
            />
          </div>

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting || isSubmitted}
              className="min-w-[200px]"
            >
              {isSubmitting ? "Enviando..." : isSubmitted ? "Formulário Enviado" : "Enviar Personalização"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalizeForm;

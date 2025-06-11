
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalizeBasicForm } from "./PersonalizeBasicForm";
import { PersonalizeServicosForm } from "./PersonalizeServicosForm";
import { PersonalizeConfigForm } from "./PersonalizeConfigForm";
import { useFileUploadHandlers } from "./FileUploadHandlers";
import { useFormSubmission } from "./useFormSubmission";
import type { FormValues } from "./PersonalizeBasicForm";

const formSchema = z.object({
  nome_empresa: z.string().min(2, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  sobre_empresa: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState("basico");
  
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

  const { isSubmitting, onSubmit } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions,
    modeloSelecionado,
    projectHash,
    onSuccess
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
              <TabsTrigger value="servicos">Serviços & Conteúdo</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-6 mt-6">
              <PersonalizeBasicForm
                form={form}
                logoPreview={logoPreview}
                depoimentoPreviews={depoimentoPreviews}
                midiaPreviews={midiaPreviews}
                midiaCaptions={midiaCaptions}
                handleLogoUpload={fileHandlers.handleLogoUpload}
                handleRemoveLogo={fileHandlers.handleRemoveLogo}
                handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
                handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
                handleMidiaUpload={fileHandlers.handleMidiaUpload}
                handleRemoveMidia={fileHandlers.handleRemoveMidia}
                handleUpdateMidiaCaption={fileHandlers.handleUpdateMidiaCaption}
              />
            </TabsContent>

            <TabsContent value="servicos" className="space-y-6 mt-6">
              <PersonalizeServicosForm 
                form={form}
                depoimentoPreviews={depoimentoPreviews}
                handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
                handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
              />
            </TabsContent>

            <TabsContent value="config" className="space-y-6 mt-6">
              <PersonalizeConfigForm 
                form={form}
                midiaPreviews={midiaPreviews}
                midiaCaptions={midiaCaptions}
                handleMidiaUpload={fileHandlers.handleMidiaUpload}
                handleRemoveMidia={fileHandlers.handleRemoveMidia}
                handleUpdateMidiaCaption={fileHandlers.handleUpdateMidiaCaption}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? "Enviando..." : "Enviar Personalização"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalizeForm;

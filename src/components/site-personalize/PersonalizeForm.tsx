
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import PersonalizeBasicForm, { personalizeFormSchema, FormValues } from "./PersonalizeBasicForm";
import PersonalizeServicosForm from "./PersonalizeServicosForm";
import PersonalizeConfigForm from "./PersonalizeConfigForm";

interface PersonalizeFormProps {
  modeloSelecionado: string | null;
  logoPreview: string | null;
  depoimentoPreviews: string[];
  midiaPreviews: string[];
  midiaCaptions: string[];
  isSubmitting: boolean;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepoimentoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDepoimento: (index: number) => void;
  handleMidiaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveMidia: (index: number) => void;
  handleUpdateMidiaCaption: (index: number, caption: string) => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

const PersonalizeForm: React.FC<PersonalizeFormProps> = ({
  modeloSelecionado,
  logoPreview,
  depoimentoPreviews,
  midiaPreviews,
  midiaCaptions,
  isSubmitting,
  handleLogoUpload,
  handleDepoimentoUpload,
  handleRemoveDepoimento,
  handleMidiaUpload,
  handleRemoveMidia,
  handleUpdateMidiaCaption,
  onSubmit,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(personalizeFormSchema),
    defaultValues: {
      officeNome: "",
      responsavelNome: "",
      telefone: "",
      email: "",
      endereco: "",
      redesSociais: "",
      fonte: "",
      paletaCores: "",
      descricao: "",
      slogan: "",
      possuiPlanos: false,
      planos: "",
      servicos: "",
      depoimentos: "",
      botaoWhatsapp: true,
      possuiMapa: false,
      linkMapa: "",
      modelo: modeloSelecionado || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <PersonalizeBasicForm 
            form={form} 
            logoPreview={logoPreview}
            handleLogoUpload={handleLogoUpload}
          />
          
          <PersonalizeServicosForm 
            form={form}
            depoimentoPreviews={depoimentoPreviews}
            handleDepoimentoUpload={handleDepoimentoUpload}
            handleRemoveDepoimento={handleRemoveDepoimento}
          />
          
          <PersonalizeConfigForm 
            form={form}
            modeloSelecionado={modeloSelecionado}
            midiaPreviews={midiaPreviews}
            midiaCaptions={midiaCaptions}
            handleMidiaUpload={handleMidiaUpload}
            handleRemoveMidia={handleRemoveMidia}
            handleUpdateMidiaCaption={handleUpdateMidiaCaption}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Personalização
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonalizeForm;

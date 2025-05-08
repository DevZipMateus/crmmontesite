
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  const handleFormSubmit = async (data: FormValues) => {
    // Ensure the modelo field is properly set before submission
    if (!data.modelo && modeloSelecionado) {
      data.modelo = modeloSelecionado;
    }
    
    console.log("Form submission started with data:", data);
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Todos os campos com * são obrigatórios. O tamanho máximo para cada arquivo é de 10MB.
          </AlertDescription>
        </Alert>
        
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

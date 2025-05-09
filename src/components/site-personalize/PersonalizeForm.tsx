
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PersonalizeBasicForm, { personalizeFormSchema, FormValues } from "./PersonalizeBasicForm";
import PersonalizeServicosForm from "./PersonalizeServicosForm";
import PersonalizeConfigForm from "./PersonalizeConfigForm";
import { Progress } from "@/components/ui/progress";

interface PersonalizeFormProps {
  modeloSelecionado: string | null;
  logoPreview: string | null;
  depoimentoPreviews: string[];
  midiaPreviews: string[];
  midiaCaptions: string[];
  isSubmitting: boolean;
  uploadProgress?: {[key: string]: number};
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
  uploadProgress = {},
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

  // Calculate overall progress for display
  const calculateOverallProgress = () => {
    if (!isSubmitting || Object.keys(uploadProgress).length === 0) return 0;
    
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return 0;
    
    const totalProgress = progressValues.reduce((sum, value) => sum + value, 0);
    return Math.round(totalProgress / progressValues.length);
  };

  const handleFormSubmit = async (data: FormValues) => {
    // Ensure the modelo field is properly set before submission
    if (!data.modelo && modeloSelecionado) {
      data.modelo = modeloSelecionado;
    }
    
    console.log("Form submission started with data:", data);
    
    // Check if there are files selected for upload
    const hasFiles = logoPreview || depoimentoPreviews.length > 0 || midiaPreviews.length > 0;
    if (!hasFiles) {
      if (!window.confirm("Você não enviou nenhum arquivo (logo, depoimentos ou mídias). Deseja continuar assim mesmo?")) {
        return;
      }
    }
    
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
        
        <Alert className="bg-yellow-50 border-yellow-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-700">
            <strong>Dicas para evitar erros:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Use nomes de arquivos simples sem caracteres especiais ou acentos</li>
              <li>Verifique sua conexão com a internet antes de enviar</li>
              <li>Para arquivos grandes, aguarde o upload completo</li>
            </ul>
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

        {isSubmitting && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Enviando dados e arquivos...</span>
              <span>{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Enviando..." : "Enviar Personalização"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonalizeForm;

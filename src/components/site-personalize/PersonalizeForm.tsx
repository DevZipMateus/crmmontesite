
import React, { useState, useEffect } from "react";
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
import { useFormAutoSave } from "@/hooks/useFormAutoSave";
import { useFormProgress } from "@/hooks/useFormProgress";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { FormProgressBar } from "@/components/ui/form-progress-bar";
import { DraftRecoveryDialog } from "./DraftRecoveryDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const formSchema = z.object({
  nome_empresa: z.string().min(2, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cnpj_cpf: z.string()
    .min(1, "CNPJ ou CPF é obrigatório")
    .refine((value) => {
      const cleanValue = value.replace(/\D/g, '');
      return cleanValue.length >= 11;
    }, "Digite pelo menos 11 dígitos")
    .refine((value) => validateCnpjCpf(value), "Digite um CNPJ (14 dígitos) ou CPF (11 dígitos) válido"),
  visao_missao_valores: z.string().min(10, "Visão, missão e valores são obrigatórios (mínimo 10 caracteres)"),
  historia_empresa: z.string().min(10, "História da empresa é obrigatória (mínimo 10 caracteres)"),
  mercado_atuacao: z.string().optional(),
  slogan: z.string().optional(),
  possuiServicos: z.boolean().optional(),
  servicosOferecidos: z.string().optional(),
  possuiProdutos: z.boolean().optional(),
  produtos: z.string().optional(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  horario_funcionamento: z.string().min(1, "Horário de funcionamento é obrigatório"),
  redes_sociais: z.string().optional(),
  cores_preferidas: z.string().optional(),
  possuiPlanos: z.boolean().optional(),
  planos: z.string().optional(),
  depoimentos: z.string().optional(),
  botaoWhatsapp: z.boolean().optional(),
  possuiMapa: z.boolean().optional(),
  linkMapa: z.string().optional(),
});

interface PersonalizeFormProps {
  modeloSelecionado?: string;
  projectHash?: string;
  onSuccess?: () => void;
  leadFormHash?: string;
  leadData?: {
    empresa: string;
    nome_cliente: string;
    email?: string;
    cnpj?: string;
    telefone?: string;
  };
}

export const PersonalizeForm: React.FC<PersonalizeFormProps> = ({
  modeloSelecionado = "",
  projectHash,
  onSuccess,
  leadFormHash,
  leadData
}) => {
  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);
  
  // Draft recovery state
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // File upload handlers
  const fileHandlers = useFileUploadHandlers({
    setLogoFile,
    setLogoPreview,
    setLogoFileName,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews,
    setMidiaCaptions
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_empresa: leadData?.empresa || "",
      email: leadData?.email || "",
      telefone: leadData?.telefone || "",
      cnpj_cpf: leadData?.cnpj || "",
      visao_missao_valores: "",
      historia_empresa: "",
      mercado_atuacao: "",
      slogan: "",
      possuiServicos: false,
      servicosOferecidos: "",
      possuiProdutos: false,
      produtos: "",
      endereco: "",
      horario_funcionamento: "",
      redes_sociais: "",
      cores_preferidas: "",
      possuiPlanos: false,
      planos: "",
      depoimentos: "",
      botaoWhatsapp: false,
      possuiMapa: false,
      linkMapa: "",
    },
  });

  // Auto-save configuration
  const storageKey = projectHash 
    ? `personalize-form-${projectHash}` 
    : leadFormHash 
      ? `personalize-form-lead-${leadFormHash}`
      : `personalize-form-${modeloSelecionado}`;

  const {
    hasSavedData,
    lastSavedAt,
    isSaving,
    restoreSavedData,
    clearSavedData,
    saveFileMetadata,
    loadFileMetadata,
    getSavedTimestamp
  } = useFormAutoSave(form, {
    storageKey,
    excludeFields: [] // No sensitive fields in this form
  });

  // Check for saved draft on mount
  useEffect(() => {
    if (hasSavedData && !leadData) {
      setShowDraftDialog(true);
    }
  }, [hasSavedData, leadData]);

  // Save file metadata when files change
  useEffect(() => {
    if (logoPreview || logoFileName || depoimentoPreviews.length > 0 || midiaPreviews.length > 0) {
      saveFileMetadata({
        logoPreview,
        depoimentoPreviews,
        midiaPreviews,
        midiaCaptions
      });
    }
  }, [logoPreview, logoFileName, depoimentoPreviews, midiaPreviews, midiaCaptions]);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const restored = restoreSavedData();
    if (restored) {
      // Try to restore file metadata
      const fileMetadata = loadFileMetadata();
      if (fileMetadata) {
        if (fileMetadata.logoPreview) {
          setLogoPreview(fileMetadata.logoPreview);
          // Extract filename from preview if it's a PDF placeholder
          if (fileMetadata.logoPreview === 'pdf-placeholder') {
            // We can't recover the filename perfectly, but we'll show indicator
            setLogoFileName('arquivo.pdf');
          }
        }
        if (fileMetadata.depoimentoPreviews) setDepoimentoPreviews(fileMetadata.depoimentoPreviews);
        if (fileMetadata.midiaPreviews) setMidiaPreviews(fileMetadata.midiaPreviews);
        if (fileMetadata.midiaCaptions) setMidiaCaptions(fileMetadata.midiaCaptions);
      }
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearSavedData();
    setShowDraftDialog(false);
  };

  // Form progress tracking
  const { progress, filledFields, totalFields, isComplete } = useFormProgress(form, {
    requiredFields: [
      'nome_empresa',
      'email',
      'telefone',
      'cnpj_cpf',
      'visao_missao_valores',
      'historia_empresa',
      'endereco',
      'horario_funcionamento'
    ],
    optionalFields: [
      'mercado_atuacao',
      'slogan',
      'servicosOferecidos',
      'produtos',
      'redes_sociais',
      'cores_preferidas',
      'planos',
      'depoimentos',
      'linkMapa'
    ]
  });

  const { isSubmitting, isSubmitted, onSubmit: originalOnSubmit } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions,
    modeloSelecionado,
    projectHash,
    onSuccess,
    leadFormHash
  });

  // Wrap onSubmit to clear draft on success
  const onSubmit = async (data: FormValues) => {
    await originalOnSubmit(data);
    // Clear draft after successful submission
    if (!isSubmitted) {
      clearSavedData();
    }
  };

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
      <DraftRecoveryDialog
        open={showDraftDialog}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        savedTimestamp={getSavedTimestamp()}
      />

      {/* Progress Bar - Always visible */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-sm">
        <FormProgressBar
          progress={progress}
          filledFields={filledFields}
          totalFields={totalFields}
          showDetails={true}
        />
      </div>

      {hasSavedData && !showDraftDialog && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              Você está editando um rascunho salvo automaticamente.
            </span>
            <AutoSaveIndicator 
              isSaving={isSaving} 
              lastSavedAt={lastSavedAt}
              className="ml-4"
            />
          </AlertDescription>
        </Alert>
      )}

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
              logoFileName={logoFileName}
              handleLogoUpload={fileHandlers.handleLogoUpload}
              handleRemoveLogo={fileHandlers.handleRemoveLogo}
            />
          </div>

          {/* Produtos, Serviços & Avaliações */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Produtos, Serviços e Planos</h3>
              <p className="text-sm text-gray-500 mt-1">Detalhes sobre seus produtos, serviços e avaliações de clientes</p>
            </div>
            <PersonalizeServicosForm 
              form={form}
              depoimentoPreviews={depoimentoPreviews}
              handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
              handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
            />
          </div>

          {/* Mídias do Site */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Mídias do Site</h3>
              <p className="text-sm text-gray-500 mt-1">Imagens e vídeos para o seu site</p>
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

          <div className="flex flex-col items-center gap-3 pt-6">
            <AutoSaveIndicator 
              isSaving={isSaving} 
              lastSavedAt={lastSavedAt}
            />
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

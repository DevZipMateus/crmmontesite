
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalizeBasicForm } from "./PersonalizeBasicForm";
import { PersonalizeServicosForm } from "./PersonalizeServicosForm";
import { PersonalizeConfigForm } from "./PersonalizeConfigForm";
import { useFileUploadHandlers } from "./FileUploadHandlers";
import { useFormSubmission } from "./useFormSubmission";
import type { FormValues } from "./PersonalizeBasicForm";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, ArrowLeft, ArrowRight, Check, Building2, ShoppingBag, Image, Settings } from "lucide-react";
import { validateCnpjCpf } from "@/utils/documentFormatter";
import { useFormAutoSave } from "@/hooks/useFormAutoSave";
import { useFormProgress } from "@/hooks/useFormProgress";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { FormProgressBar } from "@/components/ui/form-progress-bar";
import { CloudSyncIndicator } from "@/components/ui/cloud-sync-indicator";
import { DraftRecoveryDialog } from "./DraftRecoveryDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { ExistingPersonalizationData } from "@/hooks/useExistingPersonalization";
import { getCloudDraft, saveCloudDraft, clearCloudDraft } from "@/services/leadFormDraftService";
import { useDebounce } from "@/hooks/useDebounce";

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
  endereco: z.string().optional(),
  cep: z.string().min(1, "CEP é obrigatório"),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
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

const WIZARD_STEPS = [
  { label: "Dados básicos", icon: Building2 },
  { label: "Serviços", icon: ShoppingBag },
  { label: "Mídias", icon: Image },
  { label: "Configurações", icon: Settings },
];

const FormWizardSteps: React.FC<{ currentStep: number; onStepClick: (step: number) => void }> = ({ currentStep, onStepClick }) => (
  <div className="flex items-center justify-between gap-2 mb-2">
    {WIZARD_STEPS.map((step, i) => {
      const StepIcon = step.icon;
      const isDone = i < currentStep;
      const isActive = i === currentStep;
      return (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className={`flex-1 h-0.5 ${isDone ? 'bg-primary' : 'bg-border'}`} />
          )}
          <button
            type="button"
            onClick={() => onStepClick(i)}
            className={`flex flex-col items-center gap-1.5 group ${isActive ? 'text-primary' : isDone ? 'text-primary/70' : 'text-muted-foreground'}`}
          >
            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${isActive ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' : isDone ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}`}>
              {isDone ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
            </div>
            <span className="text-xs font-medium whitespace-nowrap hidden sm:block">{step.label}</span>
          </button>
        </React.Fragment>
      );
    })}
  </div>
);

const FormWizardReview: React.FC<{
  form: UseFormReturn<any>;
  logoPreview: string | null;
  midiaCount: number;
  depoimentoCount: number;
}> = ({ form, logoPreview, midiaCount, depoimentoCount }) => {
  const values = form.getValues();
  const sections = [
    { title: "Empresa", items: [
      { label: "Nome", value: values.nome_empresa },
      { label: "E-mail", value: values.email },
      { label: "Telefone", value: values.telefone },
      { label: "CNPJ/CPF", value: values.cnpj_cpf },
      { label: "Endereço", value: values.endereco },
    ]},
    { title: "Identidade", items: [
      { label: "Slogan", value: values.slogan },
      { label: "Cores preferidas", value: values.cores_preferidas },
      { label: "Logo", value: logoPreview ? "Enviado" : "Não enviado" },
    ]},
    { title: "Conteúdo", items: [
      { label: "Serviços", value: values.servicosOferecidos ? "Informados" : "Não informado" },
      { label: "Produtos", value: values.produtos ? "Informados" : "Não informado" },
      { label: "Mídias", value: midiaCount > 0 ? `${midiaCount} arquivo(s)` : "Nenhum" },
      { label: "Depoimentos", value: depoimentoCount > 0 ? `${depoimentoCount} arquivo(s)` : "Nenhum" },
    ]},
    { title: "Configurações", items: [
      { label: "WhatsApp", value: values.botaoWhatsapp ? "Ativado" : "Desativado" },
      { label: "Mapa", value: values.possuiMapa ? "Ativado" : "Desativado" },
      { label: "Horário", value: values.horario_funcionamento || "Não informado" },
    ]},
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium truncate ml-2 max-w-[60%] text-right ${item.value && item.value !== "Não enviado" && item.value !== "Não informado" && item.value !== "Nenhum" && item.value !== "Desativado" ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

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
  existingData?: ExistingPersonalizationData | null;
}

export const PersonalizeForm: React.FC<PersonalizeFormProps> = ({
  modeloSelecionado = "",
  projectHash,
  onSuccess,
  leadFormHash,
  leadData,
  existingData
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
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(0);

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
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      horario_funcionamento: "",
      redes_sociais: "",
      cores_preferidas: "",
      possuiPlanos: false,
      planos: "",
      depoimentos: "",
      botaoWhatsapp: true,
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
    saveFiles,
    loadFiles,
    savedFileToFile,
    getSavedTimestamp
  } = useFormAutoSave(form, {
    storageKey,
    excludeFields: [] // No sensitive fields in this form
  });

  // Silent draft restoration on mount — restore form fields + files automatically
  // (only when there's no fresher existingData from server)
  const didRestoreRef = React.useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    if (!hasSavedData) return;
    if (existingData) return; // server data takes precedence

    didRestoreRef.current = true;
    const restored = restoreSavedData();
    if (!restored) return;

    // Restore previews/captions metadata
    const meta = loadFileMetadata();
    if (meta) {
      if (meta.logoPreview) setLogoPreview(meta.logoPreview);
      if (meta.logoFileName) setLogoFileName(meta.logoFileName);
      if (meta.depoimentoPreviews) setDepoimentoPreviews(meta.depoimentoPreviews);
      if (meta.midiaPreviews) setMidiaPreviews(meta.midiaPreviews);
      if (meta.midiaCaptions) setMidiaCaptions(meta.midiaCaptions);
    }

    // Restore actual file blobs (so submit reuploads them)
    const files = loadFiles();
    if (files) {
      if (files.logo) {
        const f = savedFileToFile(files.logo);
        if (f) setLogoFile(f);
      }
      if (files.depoimentos?.length) {
        const fs = files.depoimentos.map(savedFileToFile).filter(Boolean) as File[];
        if (fs.length) setDepoimentoFiles(fs);
      }
      if (files.midias?.length) {
        const fs = files.midias.map(savedFileToFile).filter(Boolean) as File[];
        if (fs.length) setMidiaFiles(fs);
      }
    }
  }, [hasSavedData, existingData, restoreSavedData, loadFileMetadata, loadFiles, savedFileToFile]);

  // ===== Cloud sync (texts only) — sincroniza rascunho entre dispositivos via banco =====
  const cloudRestoredRef = React.useRef(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [lastCloudSyncedAt, setLastCloudSyncedAt] = useState<Date | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState(false);

  // Restaura rascunho da nuvem ao carregar (se não houver dados do servidor já enviados)
  useEffect(() => {
    if (cloudRestoredRef.current) return;
    if (!leadFormHash) return;
    if (existingData) return; // dados já enviados têm prioridade
    cloudRestoredRef.current = true;

    (async () => {
      const cloud = await getCloudDraft(leadFormHash);
      if (!cloud?.draft_data) return;

      // Marca como já sincronizado (timestamp da nuvem)
      setLastCloudSyncedAt(new Date(cloud.updated_at));

      // Compara com timestamp local: usa o mais recente
      const localTs = getSavedTimestamp();
      const cloudTs = cloud.updated_at;
      const cloudIsNewer = !localTs || new Date(cloudTs) > new Date(localTs);
      if (!cloudIsNewer) return;

      // Aplica os campos do rascunho da nuvem ao formulário
      Object.entries(cloud.draft_data).forEach(([k, v]) => {
        form.setValue(k as any, v as any, { shouldDirty: false });
      });
    })();
  }, [leadFormHash, existingData, form, getSavedTimestamp]);

  // Salva rascunho na nuvem com debounce (apenas textos — não envia arquivos)
  const debouncedCloudSave = useDebounce((data: FormValues) => {
    if (!leadFormHash) return;
    setCloudSyncing(true);
    saveCloudDraft(leadFormHash, data)
      .then((ok) => {
        if (ok) {
          setLastCloudSyncedAt(new Date());
          setCloudSyncError(false);
        } else {
          setCloudSyncError(true);
        }
      })
      .finally(() => setCloudSyncing(false));
  }, 1500);

  useEffect(() => {
    if (!leadFormHash) return;
    const sub = form.watch((data) => {
      debouncedCloudSave(data as FormValues);
    });
    return () => sub.unsubscribe();
  }, [leadFormHash, form.watch]);


  // Populate form with existing data when available
  useEffect(() => {
    if (existingData) {
      console.log("Populando formulário com dados existentes:", existingData);
      
      // Reset form with existing values
      form.reset({
        nome_empresa: existingData.officenome || leadData?.empresa || "",
        email: existingData.email || leadData?.email || "",
        telefone: existingData.telefone || leadData?.telefone || "",
        cnpj_cpf: existingData.cnpj_cpf || leadData?.cnpj || "",
        visao_missao_valores: existingData.visao_missao_valores || "",
        historia_empresa: existingData.historia_empresa || "",
        mercado_atuacao: existingData.mercado_atuacao || "",
        slogan: existingData.slogan || "",
        possuiServicos: !!existingData.servicos,
        servicosOferecidos: existingData.servicos || "",
        possuiProdutos: !!existingData.produtos,
        produtos: existingData.produtos || "",
        endereco: existingData.endereco || "",
        cep: (existingData as any).cep || "",
        logradouro: (existingData as any).logradouro || "",
        numero: (existingData as any).numero || "",
        complemento: (existingData as any).complemento || "",
        bairro: (existingData as any).bairro || "",
        cidade: (existingData as any).cidade || "",
        estado: (existingData as any).estado || "",
        horario_funcionamento: existingData.horario_funcionamento || "",
        redes_sociais: existingData.redessociais || "",
        cores_preferidas: existingData.paletacores || "",
        possuiPlanos: existingData.possuiplanos || false,
        planos: existingData.planos || "",
        depoimentos: existingData.depoimentos || "",
        botaoWhatsapp: existingData.botaowhatsapp !== false,
        possuiMapa: existingData.possuimapa || false,
        linkMapa: existingData.linkmapa || "",
      });

      // Set existing logo preview
      if (existingData.logo_url) {
        setLogoPreview(existingData.logo_url);
        // Check if it's a PDF by URL
        if (existingData.logo_url.includes('.pdf')) {
          setLogoFileName('logo.pdf');
        }
      }

      // Set existing media previews
      if (existingData.midia_urls && existingData.midia_urls.length > 0) {
        const urls = existingData.midia_urls.map(item => item.url);
        const captions = existingData.midia_urls.map(item => item.caption || "");
        setMidiaPreviews(urls);
        setMidiaCaptions(captions);
      }

      // Set existing depoimento previews
      if (existingData.depoimento_urls && existingData.depoimento_urls.length > 0) {
        setDepoimentoPreviews(existingData.depoimento_urls);
      }
    }
  }, [existingData, form, leadData]);

  // Save file metadata when files change
  useEffect(() => {
    if (logoPreview || logoFileName || depoimentoPreviews.length > 0 || midiaPreviews.length > 0) {
      saveFileMetadata({
        logoPreview,
        logoFileName,
        depoimentoPreviews,
        midiaPreviews,
        midiaCaptions
      });
    }
  }, [logoPreview, logoFileName, depoimentoPreviews, midiaPreviews, midiaCaptions]);

  // Persist file blobs as base64 so they survive page reload
  useEffect(() => {
    if (!logoFile && depoimentoFiles.length === 0 && midiaFiles.length === 0) return;
    saveFiles({
      logo: logoFile,
      depoimentos: depoimentoFiles,
      midias: midiaFiles,
    });
  }, [logoFile, depoimentoFiles, midiaFiles]);

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
      'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado',
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

  const { toast } = useToast();

  // Wrap onSubmit to clear draft on success
  const onSubmit = async (data: FormValues) => {
    await originalOnSubmit(data);
    // Always clear the saved draft after submission to free up DB space
    clearSavedData();
    if (leadFormHash) {
      clearCloudDraft(leadFormHash);
    }
  };

  // Called when react-hook-form validation fails — surface the problem to the user
  const onInvalid = (errors: any) => {
    const fieldToStep: Record<string, number> = {
      nome_empresa: 0, email: 0, telefone: 0, cnpj_cpf: 0,
      visao_missao_valores: 0, historia_empresa: 0,
      endereco: 0, cep: 0, logradouro: 0, numero: 0, complemento: 0, bairro: 0, cidade: 0, estado: 0, horario_funcionamento: 0,
    };
    const firstField = Object.keys(errors)[0];
    const stepWithError = fieldToStep[firstField] ?? 0;
    setCurrentStep(stepWithError);
    const missing = Object.keys(errors).join(", ");
    toast({
      title: "Preencha os campos obrigatórios",
      description: `Faltam preencher: ${missing}. Verifique a etapa destacada.`,
      variant: "destructive",
    });
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-sm space-y-2">
        <FormProgressBar
          progress={progress}
          filledFields={filledFields}
          totalFields={totalFields}
          showDetails={true}
        />
        {leadFormHash && (
          <div className="flex justify-end">
            <CloudSyncIndicator
              isSyncing={cloudSyncing}
              lastSyncedAt={lastCloudSyncedAt}
              hasError={cloudSyncError}
            />
          </div>
        )}
      </div>

      {/* Aviso de privacidade e sincronização */}
      <Alert className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/20">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Salvamento automático:</strong> os campos de <strong>texto</strong> são salvos
          na nuvem e sincronizam entre seus dispositivos
          {leadFormHash ? " (você pode começar no celular e finalizar no computador, ou vice-versa)" : ""}.
          Já os <strong>arquivos enviados</strong> (logo, mídias, depoimentos) ficam armazenados
          apenas neste navegador — se trocar de aparelho, será preciso enviá-los novamente.
          Tudo é apagado automaticamente após o envio do formulário.
        </AlertDescription>
      </Alert>

      {(hasSavedData || cloudSyncing || lastCloudSyncedAt) && !showDraftDialog && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm">
              {leadFormHash
                ? "Rascunho sincronizado automaticamente entre seus dispositivos."
                : "Você está editando um rascunho salvo automaticamente neste navegador."}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {leadFormHash && (
                <CloudSyncIndicator
                  isSyncing={cloudSyncing}
                  lastSyncedAt={lastCloudSyncedAt}
                  hasError={cloudSyncError}
                />
              )}
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
              />
            </div>
          </AlertDescription>
        </Alert>
      )}



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          <FormWizardSteps currentStep={currentStep} onStepClick={setCurrentStep} />

          {/* Step 1: Dados básicos */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">Dados Básicos</h3>
                <p className="text-sm text-muted-foreground mt-1">Informações principais da sua empresa</p>
              </div>
              <PersonalizeBasicForm
                form={form}
                logoPreview={logoPreview}
                logoFileName={logoFileName}
                handleLogoUpload={fileHandlers.handleLogoUpload}
                handleRemoveLogo={fileHandlers.handleRemoveLogo}
              />
            </div>
          )}

          {/* Step 2: Serviços & Produtos */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">Produtos, Serviços e Planos</h3>
                <p className="text-sm text-muted-foreground mt-1">Detalhes sobre seus produtos, serviços e avaliações de clientes</p>
              </div>
              <PersonalizeServicosForm 
                form={form}
                depoimentoPreviews={depoimentoPreviews}
                handleDepoimentoUpload={fileHandlers.handleDepoimentoUpload}
                handleRemoveDepoimento={fileHandlers.handleRemoveDepoimento}
              />
            </div>
          )}

          {/* Step 3: Mídias */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">Mídias do Site</h3>
                <p className="text-sm text-muted-foreground mt-1">Imagens e vídeos para o seu site</p>
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
          )}

          {/* Step 4: Configurações finais */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-foreground">Configurações Finais</h3>
                <p className="text-sm text-muted-foreground mt-1">Revise as opções e envie o formulário</p>
              </div>
              <FormWizardReview form={form} logoPreview={logoPreview} midiaCount={midiaPreviews.length} depoimentoCount={depoimentoPreviews.length} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <span className="text-sm text-muted-foreground">
              Etapa {currentStep + 1} de 4
            </span>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                className="gap-1.5"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="gap-1.5 min-w-[180px]"
              >
                {isSubmitting ? "Enviando..." : isSubmitted ? "Enviado!" : "Enviar Personalização"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalizeForm;


import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { Loader2, Upload, FileText, Image, ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const formSchema = z.object({
  officeNome: z.string().min(2, "Nome do escritório é obrigatório"),
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

type FormValues = z.infer<typeof formSchema>;

// Modelos disponíveis para exibição e seleção
const modelosDisponiveis = [
  {
    id: "Modelo 1",
    name: "Básico",
    description: "Design simples e elegante ideal para pequenos escritórios",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 2",
    name: "Profissional",
    description: "Layout moderno com recursos avançados",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 3",
    name: "Premium",
    description: "Design exclusivo com animações e recursos premium",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 4",
    name: "Corporativo",
    description: "Ideal para escritórios de médio e grande porte",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 5",
    name: "Consultoria",
    description: "Focado em serviços de consultoria empresarial",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 6",
    name: "Especialista",
    description: "Para escritórios com foco em nichos específicos",
    imageUrl: "/placeholder.svg"
  },
];

export default function PersonalizeSite() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const modeloParam = queryParams.get("modelo") || "";

  // Efeito para verificar se há um modelo na URL e mostrar o formulário automaticamente
  useEffect(() => {
    if (modeloParam) {
      setModeloSelecionado(modeloParam);
      setMostrarFormulario(true);
    }
  }, [modeloParam]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      modelo: modeloParam,
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleDepoimentoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDepoimentoFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setDepoimentoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleMidiaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMidiaFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => {
        if (file.type.startsWith('image/') || file.type === 'image/gif') {
          return URL.createObjectURL(file);
        }
        return file.type.startsWith('video/') ? URL.createObjectURL(file) : '';
      });
      setMidiaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveMidia = (index: number) => {
    setMidiaFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setMidiaPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    toast({
      description: "Mídia removida com sucesso",
    });
  };

  const selecionarModelo = (modeloId: string) => {
    setModeloSelecionado(modeloId);
    form.setValue("modelo", modeloId);
    setMostrarFormulario(true);
    // Atualizar a URL com o modelo selecionado
    navigate(`/personalize-site?modelo=${modeloId}`, { replace: true });
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      depoimentoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      midiaPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [logoPreview, depoimentoPreviews, midiaPreviews]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      const formData = {
        ...data,
        modelo: modeloSelecionado || data.modelo,
        created_at: new Date().toISOString(),
      };

      let logoUrl = null;
      if (logoFile) {
        const fileName = `logos/${Date.now()}_${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, logoFile);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da logo: ${uploadError.message}`);
        }

        logoUrl = fileName;
      }

      const depoimentoUrls: string[] = [];
      for (const file of depoimentoFiles) {
        const fileName = `depoimentos/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de depoimento: ${uploadError.message}`);
        }

        depoimentoUrls.push(fileName);
      }

      const midiaUrls: string[] = [];
      for (const file of midiaFiles) {
        const fileName = `midias/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de mídia: ${uploadError.message}`);
        }

        midiaUrls.push(fileName);
      }

      // Fix: Map form field names to match database column names (lowercase)
      const { data: insertData, error: insertError } = await supabase
        .from("site_personalizacoes")
        .insert([{
          officenome: formData.officeNome,
          responsavelnome: formData.responsavelNome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          redessociais: formData.redesSociais,
          fonte: formData.fonte,
          paletacores: formData.paletaCores,
          descricao: formData.descricao,
          slogan: formData.slogan,
          possuiplanos: formData.possuiPlanos,
          planos: formData.planos,
          servicos: formData.servicos,
          depoimentos: formData.depoimentos,
          botaowhatsapp: formData.botaoWhatsapp,
          possuimapa: formData.possuiMapa,
          linkmapa: formData.linkMapa,
          modelo: formData.modelo,
          logo_url: logoUrl,
          depoimento_urls: depoimentoUrls.length > 0 ? depoimentoUrls : null,
          midia_urls: midiaUrls.length > 0 ? midiaUrls : null,
          created_at: formData.created_at
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Criar automaticamente um projeto com status "Recebido"
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([{
          client_name: formData.officeNome,
          responsible_name: formData.responsavelNome,
          template: formData.modelo,
          status: "Recebido",
          client_type: "cliente_final"
        }])
        .select();

      if (projectError) {
        console.error("Erro ao criar projeto automático:", projectError);
        // Continuamos mesmo se houver erro na criação do projeto
      } else {
        console.log("Projeto criado automaticamente:", projectData);
      }

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas e um projeto foi criado.",
      });

      navigate("/confirmacao");
    } catch (error) {
      console.error("Erro ao salvar personalização:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Personalize Seu Site</CardTitle>
          <CardDescription>
            {!mostrarFormulario 
              ? "Selecione um modelo para começar a personalizar seu site."
              : "Preencha o formulário abaixo com as informações do seu escritório contábil para personalizar seu site."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mostrarFormulario ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelosDisponiveis.map((modelo) => (
                <Card key={modelo.id} className="cursor-pointer hover:shadow-lg transition-all hover:border-primary">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{modelo.name}</CardTitle>
                    <CardDescription className="text-sm">{modelo.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-video bg-muted/20 rounded-md overflow-hidden">
                      <img 
                        src={modelo.imageUrl} 
                        alt={`Modelo ${modelo.name}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      onClick={() => selecionarModelo(modelo.id)} 
                      className="w-full"
                      variant="default"
                    >
                      Selecionar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                    <h3 className="font-medium text-blue-700">Modelo selecionado: {modeloSelecionado}</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      Você está personalizando o modelo {modeloSelecionado}. Preencha os dados abaixo.
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  
                  <FormField
                    control={form.control}
                    name="officeNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Escritório Contábil*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do seu escritório" {...field} />
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
                  
                  <div className="space-y-4">
                    <FormLabel className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" /> Upload da Logo
                    </FormLabel>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Clique para fazer upload</span> ou arraste e solte sua logo aqui
                          </p>
                        </div>
                        {logoPreview && (
                          <div className="w-24 h-24 border-2 border-primary/30 rounded-md overflow-hidden">
                            <img
                              src={logoPreview}
                              alt="Preview da logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Faça upload de sua logo. Formatos aceitos: JPG, PNG, SVG
                      </p>
                    </div>
                  </div>

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

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Serviços e Planos</h3>
                  
                  <FormField
                    control={form.control}
                    name="possuiPlanos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Possui planos de negócios?</FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("possuiPlanos") && (
                    <FormField
                      control={form.control}
                      name="planos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planos de Negócios</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva os planos oferecidos (nome, valor, serviços incluídos)"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="servicos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviços a Destacar*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liste os principais serviços oferecidos"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Depoimentos</h3>
                  
                  <FormField
                    control={form.control}
                    name="depoimentos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depoimentos de Clientes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Inclua depoimentos de clientes no formato: Nome, empresa: Depoimento"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-primary" /> Imagens para Depoimentos
                    </FormLabel>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDepoimentoUpload}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Clique para selecionar imagens</span> ou arraste e solte aqui
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Adicione imagens relacionadas aos depoimentos. Múltiplas imagens permitidas.
                      </p>
                      
                      {depoimentoPreviews.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {depoimentoPreviews.map((preview, index) => (
                            <div key={index} className="w-24 h-24 border-2 border-primary/30 rounded-md overflow-hidden relative group">
                              <img
                                src={preview}
                                alt={`Depoimento preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(preview);
                                  setDepoimentoPreviews(prev => prev.filter((_, i) => i !== index));
                                  setDepoimentoFiles(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remover imagem"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Mídias do Site</h3>
                  
                  <div className="space-y-4">
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Upload de Mídias (Imagens, Vídeos, GIFs)
                    </FormLabel>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <div className="w-full">
                          <Input
                            type="file"
                            accept="image/*,video/*,.gif"
                            multiple
                            onChange={handleMidiaUpload}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Clique para selecionar arquivos</span> ou arraste e solte aqui
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Adicione imagens, vídeos e GIFs para o seu site. Máximo de 5 arquivos.
                      </p>
                      
                      {midiaPreviews.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {midiaPreviews.map((preview, index) => {
                            const file = midiaFiles[index];
                            return (
                              <div key={index} className="relative group w-24 h-24 border-2 border-primary/30 rounded-md overflow-hidden">
                                {file.type.startsWith('video/') ? (
                                  <video
                                    src={preview}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={preview}
                                    alt={`Mídia preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMidia(index)}
                                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Remover mídia"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Configurações Adicionais</h3>
                    
                    <FormField
                      control={form.control}
                      name="botaoWhatsapp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Deseja incluir botão do WhatsApp?</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="possuiMapa"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Deseja incluir Mapa do Google?</FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch("possuiMapa") && (
                      <FormField
                        control={form.control}
                        name="linkMapa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link do Google Maps</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Cole aqui o link compartilhável do Google Maps"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Copie o link do seu endereço no Google Maps clicando em "Compartilhar" e depois em "Incorporar um mapa"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo Selecionado</FormLabel>
                          <FormControl>
                            <Input readOnly value={modeloSelecionado || field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Este é o modelo selecionado para o seu site.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Personalização
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

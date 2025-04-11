
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import { Loader2, Upload } from "lucide-react";
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
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Form schema para validação
const formSchema = z.object({
  officeNome: z.string().min(2, "Nome do escritório é obrigatório"),
  responsavelNome: z.string().min(2, "Nome do responsável é obrigatório"),
  telefone: z.string().min(10, "Telefone deve conter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  redesSociais: z.string().optional(),
  logo: z.any().optional(), // Será tratado separadamente
  fonte: z.string().optional(),
  paletaCores: z.string().optional(),
  descricao: z.string().min(10, "Descreva seu escritório com pelo menos 10 caracteres"),
  slogan: z.string().optional(),
  possuiPlanos: z.boolean().default(false),
  planos: z.string().optional(),
  servicos: z.string().min(5, "Liste pelo menos um serviço de destaque"),
  depoimentos: z.string().optional(),
  botaoWhatsapp: z.boolean().default(true),
  modelo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PersonalizeSite() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);

  // Extrair o parâmetro 'modelo' da URL
  const queryParams = new URLSearchParams(location.search);
  const modeloParam = queryParams.get("modelo") || "";

  // Formulário com valores iniciais
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
      modelo: modeloParam,
    },
  });

  // Manipulador para upload da logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  // Manipulador para upload de imagens de depoimentos
  const handleDepoimentoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDepoimentoFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setDepoimentoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Limpar previews quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      depoimentoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [logoPreview, depoimentoPreviews]);

  // Enviar o formulário
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      // Incluir o parâmetro 'modelo' nos dados
      const formData = {
        ...data,
        modelo: modeloParam || data.modelo,
        created_at: new Date().toISOString(),
      };

      // Upload da logo se existir
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

      // Upload das imagens de depoimentos
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

      // Inserir dados na tabela
      const { data: insertData, error: insertError } = await supabase
        .from("site_personalizacoes")
        .insert([
          {
            ...formData,
            logo_url: logoUrl,
            depoimento_urls: depoimentoUrls.length > 0 ? depoimentoUrls : null,
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas.",
      });

      // Redirecionar para a página de confirmação
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
            Preencha o formulário abaixo com as informações do seu escritório contábil para
            personalizar seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
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

              {/* Identidade Visual */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Identidade Visual</h3>
                
                <div>
                  <FormLabel>Upload da Logo</FormLabel>
                  <div className="mt-1 flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    {logoPreview && (
                      <div className="w-16 h-16 border rounded-md overflow-hidden">
                        <img
                          src={logoPreview}
                          alt="Preview da logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
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

              {/* Serviços e Planos */}
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

              {/* Depoimentos */}
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

                <div>
                  <FormLabel>Imagens para Depoimentos (opcional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDepoimentoUpload}
                    className="mt-1"
                  />
                  
                  {depoimentoPreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {depoimentoPreviews.map((preview, index) => (
                        <div key={index} className="w-16 h-16 border rounded-md overflow-hidden">
                          <img
                            src={preview}
                            alt={`Depoimento preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações Adicionais */}
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
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo Selecionado</FormLabel>
                      <FormControl>
                        <Input readOnly {...field} />
                      </FormControl>
                      <FormDescription>
                        Este é o modelo selecionado para o seu site (detectado automaticamente da URL).
                      </FormDescription>
                    </FormItem>
                  )}
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
        </CardContent>
      </Card>
    </div>
  );
}

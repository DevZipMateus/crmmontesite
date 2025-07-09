import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SalesLandingPageInsert } from "@/types/salesLandingPage";
import { useFileUploader } from "@/lib/file-upload-service";
import { Upload, User, Briefcase, Star, Palette } from "lucide-react";

const formSchema = z.object({
  nome_completo: z.string().min(2, "Nome completo é obrigatório"),
  email_profissional: z.string().email("Email inválido"),
  telefone_whatsapp: z.string().min(10, "Telefone é obrigatório"),
  area_atuacao: z.string().min(2, "Área de atuação é obrigatória"),
  cargo: z.string().min(2, "Cargo é obrigatório"),
  cidade_regiao: z.string().optional(),
  mini_bio: z.string().min(10, "Mini bio é obrigatória"),
  slogan: z.string().optional(),
  redes_sociais: z.string().optional(),
  principais_servicos: z.string().min(10, "Principais serviços são obrigatórios"),
  diferenciais: z.string().optional(),
  formacao_certificacoes: z.string().optional(),
  cores_preferidas: z.string().optional(),
  estilo_visual: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function VendedorLandingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useFileUploader();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: "",
      email_profissional: "",
      telefone_whatsapp: "",
      area_atuacao: "",
      cargo: "",
      cidade_regiao: "",
      mini_bio: "",
      slogan: "",
      redes_sociais: "",
      principais_servicos: "",
      diferenciais: "",
      formacao_certificacoes: "",
      cores_preferidas: "",
      estilo_visual: "",
    },
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem (JPG ou PNG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const result = await uploadFile(file, {
        bucketName: 'vendedor-fotos',
        folderPath: 'profile-photos',
      });

      if (result.success && result.filePath) {
        setUploadedPhotoUrl(result.filePath);
        toast({
          title: "Sucesso",
          description: "Foto carregada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          throw new Error(`Arquivo ${file.name} não é uma imagem ou vídeo válido`);
        }

        // Validate file size (50MB max for videos, 10MB for images)
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`Arquivo ${file.name} é muito grande. Máximo ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
        }

        const result = await uploadFile(file, {
          bucketName: 'vendedor-fotos',
          folderPath: 'media-files',
        });

        if (result.success && result.filePath) {
          return result.filePath;
        }
        throw new Error(`Erro ao fazer upload de ${file.name}`);
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      setUploadedMediaUrls(prev => [...prev, ...uploadedPaths]);
      
      toast({
        title: "Sucesso",
        description: `${uploadedPaths.length} arquivo(s) carregado(s) com sucesso!`,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload das mídias. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setUploadedMediaUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData: SalesLandingPageInsert = {
        nome_completo: data.nome_completo,
        email_profissional: data.email_profissional,
        telefone_whatsapp: data.telefone_whatsapp,
        area_atuacao: data.area_atuacao,
        cargo: data.cargo,
        mini_bio: data.mini_bio,
        principais_servicos: data.principais_servicos,
        foto_profissional_url: uploadedPhotoUrl || undefined,
        cidade_regiao: data.cidade_regiao || undefined,
        slogan: data.slogan || undefined,
        redes_sociais: data.redes_sociais || undefined,
        diferenciais: data.diferenciais || undefined,
        formacao_certificacoes: data.formacao_certificacoes || undefined,
        cores_preferidas: data.cores_preferidas || undefined,
        estilo_visual: data.estilo_visual || undefined,
        // Store media URLs as JSON string for now - could be expanded to separate table later
        media_urls: uploadedMediaUrls.length > 0 ? JSON.stringify(uploadedMediaUrls) : undefined,
      };

      const { error } = await supabase
        .from('sales_landing_pages')
        .insert([formData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Formulário enviado com sucesso. Em breve sua landing page será criada!",
      });

      form.reset();
      setUploadedPhotoUrl(null);
      setUploadedMediaUrls([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <User className="h-8 w-8" />
              Personalize sua Landing Page de Vendas
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Preencha o formulário com suas informações para criar uma página personalizada que apresenta seu trabalho, atrai novos clientes e gera mais contatos.
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="nome_completo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome como será exibido na página" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email_profissional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu E-mail Profissional *</FormLabel>
                        <FormControl>
                          <Input placeholder="exemplo@seudominio.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Telefone / WhatsApp *</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 91234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Sua Foto Profissional</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload da sua foto (preferência em formato quadrado, com boa iluminação)
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        className="relative"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Carregando..." : "Upload (máx. 10MB | JPG ou PNG)"}
                      </Button>
                      {uploadedPhotoUrl && (
                        <span className="text-sm text-green-600">✓ Foto carregada</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Perfil Profissional */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <Briefcase className="h-5 w-5" />
                    Perfil Profissional
                  </h3>

                  <FormField
                    control={form.control}
                    name="area_atuacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Atuação *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Consultor em Certificação Digital, Representante Comercial, Especialista em Seguros" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo Atual *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Consultor Sênior, Gerente de Vendas, Especialista Técnico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade_regiao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade/Região de Atendimento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo e Grande SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mini_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mini Bio / Apresentação *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva um breve texto se apresentando: sua experiência, o que você faz e por que as pessoas devem confiar em você."
                            className="min-h-[100px]"
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
                        <FormLabel>Slogan ou Frase de Impacto</FormLabel>
                        <FormControl>
                          <Input placeholder='Ex: "Facilitando sua vida com soluções digitais" ou "Seu consultor de confiança!"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="redes_sociais"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Redes Sociais Profissionais</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Inclua links do Instagram, Facebook, LinkedIn ou outros canais que você utiliza"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                   />
                   
                   <div className="space-y-2">
                     <Label>Fotos e Vídeos dos Seus Produtos/Serviços</Label>
                     <p className="text-sm text-muted-foreground">
                       Adicione fotos e vídeos que mostram seus produtos, serviços ou trabalhos realizados
                     </p>
                     <div className="flex items-center gap-4">
                       <Button
                         type="button"
                         variant="outline"
                         disabled={isUploadingMedia}
                         className="relative"
                       >
                         <input
                           type="file"
                           accept="image/*,video/*"
                           multiple
                           onChange={handleMediaUpload}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           disabled={isUploadingMedia}
                         />
                         <Upload className="h-4 w-4 mr-2" />
                         {isUploadingMedia ? "Carregando..." : "Upload Múltiplo (máx. 10MB imagens, 50MB vídeos)"}
                       </Button>
                       {uploadedMediaUrls.length > 0 && (
                         <span className="text-sm text-green-600">✓ {uploadedMediaUrls.length} arquivo(s) carregado(s)</span>
                       )}
                     </div>
                     
                     {uploadedMediaUrls.length > 0 && (
                       <div className="mt-4 space-y-2">
                         <p className="text-sm font-medium">Arquivos carregados:</p>
                         <div className="space-y-1">
                           {uploadedMediaUrls.map((url, index) => (
                             <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                               <span className="text-sm truncate">{url.split('/').pop()}</span>
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => removeMedia(index)}
                                 className="text-red-500 hover:text-red-700"
                               >
                                 Remover
                               </Button>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>

                {/* Qualificações Profissionais */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <Briefcase className="h-5 w-5" />
                    Qualificações Profissionais
                  </h3>

                  <FormField
                    control={form.control}
                    name="formacao_certificacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formação / Certificações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste suas formações acadêmicas, cursos, certificações e especializações profissionais"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Produtos que voce oferece e beneficios pode oferecer */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <Star className="h-5 w-5" />
                    Produtos que você oferece e benefícios pode oferecer
                  </h3>

                  <FormField
                    control={form.control}
                    name="principais_servicos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Principais Serviços / Produtos que Oferece *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste seus serviços com clareza, como:"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diferenciais"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diferenciais que Deseja Destacar</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Atendimento rápido, suporte via WhatsApp, emissão em 15 minutos"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estilo da Página */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <Palette className="h-5 w-5" />
                    Estilo da Página
                  </h3>

                  <FormField
                    control={form.control}
                    name="cores_preferidas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cores Preferidas</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Azul escuro e branco, ou cores do seu uniforme" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estilo_visual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo Visual Desejado</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Moderno, Simples e Direto, Profissional, Colorido, Minimalista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Formulário"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mammoth from "mammoth";
import { extractProjectDataFromText, ExtractedProjectData, isValidProjectData } from "@/utils/documentParser";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projectFormSchema = z.object({
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  template: z.string().optional(),
  responsible_name: z.string().optional(),
  status: z.string().default("Em andamento"),
  domain: z.string().optional(),
  provider_credentials: z.string().optional(),
  blaster_link: z.string().optional(),
  client_type: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [docContent, setDocContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [googleDocsLink, setGoogleDocsLink] = useState<string>("");
  const [isLoadingGoogleDoc, setIsLoadingGoogleDoc] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProjectData>({});
  const [showManualInput, setShowManualInput] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      client_name: "",
      template: "",
      responsible_name: "",
      status: "Em andamento",
      domain: "",
      provider_credentials: "",
      blaster_link: "",
      client_type: "",
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, faça upload apenas de arquivos .doc ou .docx",
        variant: "destructive",
      });
      return;
    }

    setIsReading(true);
    setFileName(file.name);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const textContent = result.value;
      setDocContent(textContent);
      
      const projectData = extractProjectDataFromText(textContent);
      
      setExtractedData(projectData);
      
      if (projectData.client_name) {
        form.setValue("client_name", projectData.client_name);
      }
      if (projectData.template) {
        form.setValue("template", projectData.template);
      }
      if (projectData.responsible_name) {
        form.setValue("responsible_name", projectData.responsible_name);
      }
      
      toast({
        title: "Arquivo lido com sucesso",
        description: `${file.name} foi carregado e analisado.`,
      });
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível processar o documento. Tente novamente.",
        variant: "destructive",
      });
      setDocContent("");
    } finally {
      setIsReading(false);
    }
  };

  const handleGoogleDocsImport = async () => {
    if (!googleDocsLink || !googleDocsLink.includes("docs.google.com")) {
      toast({
        title: "Link inválido",
        description: "Por favor, insira um link válido do Google Docs",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingGoogleDoc(true);
    setFileName("Documento do Google");

    try {
      const docId = extractGoogleDocId(googleDocsLink);
      
      setTimeout(() => {
        const conteudoSimulado = `Conteúdo extraído do Google Docs (ID: ${docId})
        
Este é um conteúdo simulado para demonstrar como a funcionalidade funcionaria.

Cliente: Empresa ABC
Modelo escolhido: Business Premium
Responsável: Maria Silva

Em um ambiente de produção, precisaríamos implementar:

1. Autenticação com a API do Google
2. Uso da Google Docs API para extrair o conteúdo real
3. Processamento do conteúdo extraído

Esta seria uma implementação futura mais completa.`;

        setDocContent(conteudoSimulado);
        
        const projectData = extractProjectDataFromText(conteudoSimulado);
        
        setExtractedData(projectData);
        
        if (projectData.client_name) {
          form.setValue("client_name", projectData.client_name);
        }
        if (projectData.template) {
          form.setValue("template", projectData.template);
        }
        if (projectData.responsible_name) {
          form.setValue("responsible_name", projectData.responsible_name);
        }
        
        toast({
          title: "Google Docs processado",
          description: "O documento foi importado e analisado com sucesso.",
        });
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar Google Docs:", error);
      toast({
        title: "Erro ao importar documento",
        description: "Não foi possível processar o documento do Google. Tente novamente.",
        variant: "destructive",
      });
      setDocContent("");
    } finally {
      setIsLoadingGoogleDoc(false);
    }
  };

  const extractGoogleDocId = (url: string): string => {
    try {
      const regex = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      return match ? match[1] : "ID não encontrado";
    } catch (e) {
      return "ID não encontrado";
    }
  };

  const saveProject = async (values: ProjectFormValues) => {
    try {
      if (!values.client_name) {
        toast({
          title: "Erro ao criar projeto",
          description: "Nome do cliente é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      
      const projectData = {
        client_name: values.client_name,
        template: values.template || null,
        responsible_name: values.responsible_name || null,
        status: values.status || "Em andamento",
        domain: values.domain || null,
        provider_credentials: values.provider_credentials || null,
        blaster_link: values.blaster_link || null,
        client_type: values.client_type || null
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Projeto criado com sucesso",
        description: `O projeto para ${values.client_name} foi criado.`,
      });
      
      navigate("/projetos");
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Adicionar Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
              <TabsTrigger value="gdocs">Google Docs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4 pt-4">
              <p className="text-muted-foreground mb-4">
                Faça upload de um arquivo Word (.doc ou .docx) contendo informações do site.
              </p>
              
              <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="docFile">Arquivo Word</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="docFile"
                    type="file"
                    accept=".doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isReading}
                    className="flex-1"
                  />
                  {isReading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: .doc, .docx
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="gdocs" className="space-y-4 pt-4">
              <p className="text-muted-foreground mb-4">
                Insira o link de um documento do Google Docs para importar o conteúdo.
              </p>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="gdocsLink">Link do Google Docs</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="gdocsLink"
                    type="url"
                    placeholder="https://docs.google.com/document/d/..."
                    value={googleDocsLink}
                    onChange={(e) => setGoogleDocsLink(e.target.value)}
                    disabled={isLoadingGoogleDoc}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleGoogleDocsImport}
                    disabled={isLoadingGoogleDoc || !googleDocsLink}
                    size="sm"
                  >
                    {isLoadingGoogleDoc ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LinkIcon className="h-4 w-4 mr-2" />
                    )}
                    Importar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O documento deve estar configurado com permissão de acesso para visualização.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
            <h3 className="text-lg font-medium">Informações adicionais do projeto</h3>
            
            <Form {...form}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domínio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: cliente.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="client_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de cliente</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parceiro">Parceiro</SelectItem>
                            <SelectItem value="cliente_final">Cliente Final</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="provider_credentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credenciais do provedor</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Login: exemplo@mail.com, Senha: 123456" 
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Informe as credenciais de acesso ao provedor/hospedagem do cliente.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="blaster_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link no Blaster</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: https://blaster.com.br/cliente123" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          
          {docContent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo extraído: {fileName}</Label>
                <Textarea
                  id="content"
                  value={docContent}
                  readOnly
                  className="h-64 font-mono text-sm"
                />
              </div>
              
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Dados extraídos para o projeto</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowManualInput(!showManualInput)}
                  >
                    {showManualInput ? "Esconder campos manuais" : "Preencher manualmente"}
                  </Button>
                </div>
                
                <Form {...form}>
                  <form className="space-y-4" onSubmit={form.handleSubmit(saveProject)}>
                    <FormField
                      control={form.control}
                      name="client_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do cliente</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo escolhido</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="responsible_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {showManualInput && (
                      <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-sm text-gray-700">Campos adicionais para preenchimento manual</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="office_name">Nome do escritório/empresa</Label>
                            <Input 
                              id="office_name" 
                              placeholder="Ex: Advocacia Silva" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input 
                              id="phone" 
                              placeholder="Ex: (11) 99999-9999"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="services">Serviços oferecidos</Label>
                          <Textarea 
                            id="services" 
                            placeholder="Liste os principais serviços separados por vírgula"
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input 
                            id="address" 
                            placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="Ex: contato@empresa.com"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="social_media">Redes sociais</Label>
                            <Input 
                              id="social_media" 
                              placeholder="Ex: @empresa"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição do negócio</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Descreva brevemente o negócio e sua proposta de valor"
                            rows={4}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="slogan">Slogan</Label>
                          <Input 
                            id="slogan" 
                            placeholder="Ex: Soluções jurídicas para o seu negócio"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="font">Fonte preferida</Label>
                          <Input 
                            id="font" 
                            placeholder="Ex: Roboto, Open Sans, etc."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="colorPalette">Paleta de cores</Label>
                          <Input 
                            id="colorPalette" 
                            placeholder="Ex: Azul, cinza e branco"
                          />
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Planos de negócio</h5>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox id="hasPlans" />
                            <label
                              htmlFor="hasPlans"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Possui planos de negócios
                            </label>
                          </div>
                          <Textarea 
                            id="businessPlans" 
                            placeholder="Descreva os planos oferecidos (nome, valor, serviços incluídos)"
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="testimonials">Depoimentos de clientes</Label>
                          <Textarea 
                            id="testimonials" 
                            placeholder="Inclua depoimentos de clientes no formato: Nome, empresa: Depoimento"
                            rows={3}
                          />
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Configurações adicionais</h5>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="whatsappButton" defaultChecked />
                              <label
                                htmlFor="whatsappButton"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Incluir botão do WhatsApp
                              </label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox id="hasMap" />
                              <label
                                htmlFor="hasMap"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Incluir mapa do Google
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="mapLink">Link do Google Maps</Label>
                          <Input 
                            id="mapLink" 
                            placeholder="Cole aqui o link compartilhável do Google Maps"
                          />
                          <p className="text-xs text-muted-foreground">
                            Copie o link do seu endereço no Google Maps clicando em "Compartilhar" e depois em "Incorporar um mapa"
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="uploadLogo">Upload da Logo</Label>
                          <Input 
                            id="uploadLogo"
                            type="file"
                            accept="image/*"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="uploadImages">Upload de imagens adicionais</Label>
                          <Input 
                            id="uploadImages"
                            type="file"
                            accept="image/*,video/*,.gif"
                            multiple
                          />
                          <p className="text-xs text-muted-foreground">
                            Formatos aceitos: imagens (JPG, PNG), vídeos (MP4) e GIFs.
                          </p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Estes campos são opcionais e complementam as informações básicas do projeto.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/projetos")}
                      >
                        Voltar para Projetos
                      </Button>
                      
                      <Button type="submit">
                        Criar Projeto
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          )}
          
          {!docContent && (
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={() => navigate("/projetos")}
              >
                Voltar para Projetos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

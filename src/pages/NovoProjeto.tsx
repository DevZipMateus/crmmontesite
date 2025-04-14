
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
import { extractProjectDataFromText, isValidProjectData } from "@/utils/documentParser";
import { getSupabaseClient } from "@/lib/supabase";
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

// Schema for project creation form
const projectFormSchema = z.object({
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  template: z.string().optional(),
  responsible_name: z.string().optional(),
  status: z.string().default("Em andamento"),
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
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  
  // Initialize form with react-hook-form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      client_name: "",
      template: "",
      responsible_name: "",
      status: "Em andamento",
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar se o arquivo é .doc ou .docx
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
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Converter o documento para HTML usando mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      const textContent = result.value;
      setDocContent(textContent);
      
      // Extrair informações do projeto do texto
      const projectData = extractProjectDataFromText(textContent);
      
      // Atualizar os dados extraídos
      setExtractedData(projectData);
      
      // Preencher o formulário com os dados extraídos
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
      // Para acessar documentos do Google Docs, precisamos usar uma API externa
      // Neste exemplo, vamos simular isso extraindo o ID do documento
      const docId = extractGoogleDocId(googleDocsLink);
      
      // Em um caso real, precisaríamos de uma API para acessar o Google Docs
      // Aqui estamos apenas simulando o resultado para fins de demonstração
      setTimeout(() => {
        // Simulando o conteúdo extraído
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
        
        // Extrair informações do projeto do texto simulado
        const projectData = extractProjectDataFromText(conteudoSimulado);
        
        // Atualizar os dados extraídos
        setExtractedData(projectData);
        
        // Preencher o formulário com os dados extraídos
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

  // Função para extrair o ID do documento do link do Google Docs
  const extractGoogleDocId = (url: string): string => {
    try {
      const regex = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      return match ? match[1] : "ID não encontrado";
    } catch (e) {
      return "ID não encontrado";
    }
  };

  // Função para salvar o projeto no banco de dados
  const saveProject = async (values: ProjectFormValues) => {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('projects')
        .insert([values])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Projeto criado com sucesso",
        description: `O projeto para ${values.client_name} foi criado.`,
      });
      
      // Redirecionar para a lista de projetos
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
                <h3 className="text-lg font-medium mb-4">Dados extraídos para o projeto</h3>
                
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

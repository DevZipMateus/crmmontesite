
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mammoth from "mammoth";
import { extractProjectDataFromText, ExtractedProjectData, isValidProjectData } from "@/utils/documentParser";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import our new components
import { FileUploadTab } from "@/components/projeto/FileUploadTab";
import { GoogleDocsTab } from "@/components/projeto/GoogleDocsTab";
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { ExtractedDataForm } from "@/components/projeto/ExtractedDataForm";
import { ManualDataFields } from "@/components/projeto/ManualDataFields";
import { DocumentContent } from "@/components/projeto/DocumentContent";

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
      if (projectData.domain) {
        form.setValue("domain", projectData.domain);
      }
      if (projectData.provider_credentials) {
        form.setValue("provider_credentials", projectData.provider_credentials);
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
            
            <TabsContent value="file">
              <FileUploadTab 
                isReading={isReading} 
                handleFileUpload={handleFileUpload} 
              />
            </TabsContent>
            
            <TabsContent value="gdocs">
              <GoogleDocsTab 
                isLoadingGoogleDoc={isLoadingGoogleDoc}
                googleDocsLink={googleDocsLink}
                setGoogleDocsLink={setGoogleDocsLink}
                handleGoogleDocsImport={handleGoogleDocsImport}
              />
            </TabsContent>
          </Tabs>
          
          <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
            <h3 className="text-lg font-medium">Informações adicionais do projeto</h3>
            <ProjectInfoForm form={form} />
          </div>
          
          {docContent && (
            <>
              <DocumentContent fileName={fileName} docContent={docContent} />
              
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Dados extraídos para o projeto</h3>
                </div>
                
                <ExtractedDataForm 
                  form={form}
                  showManualInput={showManualInput}
                  setShowManualInput={setShowManualInput}
                  onSubmit={saveProject}
                  onCancel={() => navigate("/projetos")}
                />
                
                {showManualInput && <ManualDataFields />}
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

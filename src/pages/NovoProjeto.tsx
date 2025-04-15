
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { extractProjectDataFromText, ExtractedProjectData } from "@/utils/documentParser";
import { DocumentParser } from "@/components/projeto/DocumentParser";
import { ProjectForm } from "@/components/projeto/ProjectForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { FileUp } from "lucide-react";

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [docContent, setDocContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [googleDocsLink, setGoogleDocsLink] = useState<string>("");
  const [isLoadingGoogleDoc, setIsLoadingGoogleDoc] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProjectData>({});
  
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

  const extractGoogleDocId = (url: string): string => {
    try {
      const regex = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      return match ? match[1] : "ID não encontrado";
    } catch (e) {
      return "ID não encontrado";
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

  return (
    <PageLayout 
      title="Adicionar Site"
      contentClass="bg-gray-50/50"
    >
      <div className="max-w-3xl mx-auto">
        <Card className="border-gray-100 shadow-sm mb-6">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Importar Documento</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Importe um documento para extrair informações do projeto</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <DocumentParser
              isReading={isReading}
              isLoadingGoogleDoc={isLoadingGoogleDoc}
              fileName={fileName}
              docContent={docContent}
              googleDocsLink={googleDocsLink}
              setGoogleDocsLink={setGoogleDocsLink}
              handleFileUpload={handleFileUpload}
              handleGoogleDocsImport={handleGoogleDocsImport}
              onCancel={() => navigate("/projetos")}
            />
          </CardContent>
        </Card>
        
        {docContent && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-xl">Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ProjectForm
                extractedData={extractedData}
                docContent={docContent}
                fileName={fileName}
                onCancel={() => navigate("/projetos")}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}


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

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [docContent, setDocContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [googleDocsLink, setGoogleDocsLink] = useState<string>("");
  const [isLoadingGoogleDoc, setIsLoadingGoogleDoc] = useState(false);

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
      setDocContent(result.value);
      
      toast({
        title: "Arquivo lido com sucesso",
        description: `${file.name} foi carregado e processado.`,
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
Em um ambiente de produção, precisaríamos implementar:

1. Autenticação com a API do Google
2. Uso da Google Docs API para extrair o conteúdo real
3. Processamento do conteúdo extraído

Para implementar completamente esta funcionalidade, seria necessário:
- Registrar um projeto no Google Cloud Console
- Configurar credenciais OAuth2
- Implementar o fluxo de autenticação
- Usar a Google Docs API para extrair o conteúdo do documento

Esta seria uma implementação futura mais completa.`;

        setDocContent(conteudoSimulado);
        
        toast({
          title: "Google Docs processado",
          description: "O documento foi importado com sucesso.",
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
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo extraído: {fileName}</Label>
              <Textarea
                id="content"
                value={docContent}
                readOnly
                className="h-64 font-mono text-sm"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => navigate("/projetos")}
            >
              Voltar para Projetos
            </Button>
            
            {docContent && (
              <Button
                onClick={() => {
                  toast({
                    title: "Informações salvas",
                    description: "O conteúdo do documento foi salvo com sucesso.",
                  });
                  navigate("/projetos");
                }}
              >
                Salvar Informações
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

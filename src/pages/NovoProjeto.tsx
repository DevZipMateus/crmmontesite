
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import mammoth from "mammoth";

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [docContent, setDocContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

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

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Adicionar Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
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
          </div>
          
          {docContent && (
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo extraído do arquivo: {fileName}</Label>
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

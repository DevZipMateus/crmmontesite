
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFileDisplay } from "./MediaFileDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { MediaSelectionProvider, MediaBulkDownloader } from "./media-bulk/MediaBulkDownloader";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface PersonalizationFilesProps {
  personalization: any;
  getFileUrl: (path: string | { url: string; caption?: string }) => Promise<string | null>;
}

export const PersonalizationFiles: React.FC<PersonalizationFilesProps> = ({ 
  personalization,
  getFileUrl
}) => {
  const [isDownloadingDepoimentos, setIsDownloadingDepoimentos] = useState(false);
  const { toast } = useToast();

  if (!personalization) return null;
  
  const hasLogo = !!personalization.logo_url;
  
  const depoimentoUrls = Array.isArray(personalization.depoimento_urls) 
    ? personalization.depoimento_urls 
    : [];
  const hasDepoimentos = depoimentoUrls.length > 0;
  
  let midiaUrls: any[] = [];
  if (Array.isArray(personalization.midia_urls)) {
    midiaUrls = personalization.midia_urls;
  }
  const hasMidia = midiaUrls.length > 0;
  
  if (!hasLogo && !hasDepoimentos && !hasMidia) return null;

  const handleDownloadAllDepoimentos = async () => {
    if (depoimentoUrls.length === 0) return;
    
    setIsDownloadingDepoimentos(true);
    try {
      const zip = new JSZip();
      let successCount = 0;
      let errorCount = 0;
      const usedNames = new Set<string>();

      for (let i = 0; i < depoimentoUrls.length; i++) {
        try {
          const filePath = depoimentoUrls[i];
          const signedUrl = await getFileUrl(filePath);
          if (!signedUrl) { errorCount++; continue; }

          const response = await fetch(signedUrl);
          if (!response.ok) { errorCount++; continue; }

          const blob = await response.blob();
          
          let extension = '';
          const extMatch = (typeof filePath === 'string' ? filePath : (filePath as any)?.url || '').match(/\.([^.]+)$/);
          if (extMatch) {
            extension = `.${extMatch[1]}`;
          } else if (blob.type) {
            const typeMap: Record<string, string> = {
              'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
              'image/webp': '.webp', 'video/mp4': '.mp4', 'application/pdf': '.pdf',
            };
            extension = typeMap[blob.type] || '';
          }

          let name = `depoimento_${String(i + 1).padStart(3, '0')}${extension}`;
          while (usedNames.has(name)) {
            name = `depoimento_${String(i + 1).padStart(3, '0')}_${Math.random().toString(36).slice(2, 6)}${extension}`;
          }
          usedNames.add(name);
          zip.file(name, blob);
          successCount++;
        } catch (err) {
          console.error(`Erro ao processar depoimento ${i}:`, err);
          errorCount++;
        }
      }

      if (successCount === 0) {
        toast({ title: "Erro no download", description: "Não foi possível baixar nenhum depoimento.", variant: "destructive" });
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const projectName = (personalization.officenome || 'Projeto').replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 30);
      link.download = `${projectName}_depoimentos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      let desc = `${successCount} depoimento(s) baixado(s) com sucesso`;
      if (errorCount > 0) desc += `. ${errorCount} arquivo(s) falharam`;
      toast({ title: "Download concluído", description: desc + '.' });
    } catch (error) {
      console.error('Erro ao criar ZIP de depoimentos:', error);
      toast({ title: "Erro no download", description: "Ocorreu um erro ao criar o arquivo ZIP.", variant: "destructive" });
    } finally {
      setIsDownloadingDepoimentos(false);
    }
  };
  
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle>Arquivos Enviados</CardTitle>
          <div className="flex items-center gap-2">
            {hasLogo && <Badge variant="outline" className="bg-blue-50">Logo</Badge>}
            {hasDepoimentos && <Badge variant="outline" className="bg-green-50">Depoimentos ({depoimentoUrls.length})</Badge>}
            {hasMidia && <Badge variant="outline" className="bg-purple-50">Mídias ({midiaUrls.length})</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasLogo && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Logo</h3>
              <div className="max-w-[200px]">
                <MediaFileDisplay 
                  filePath={personalization.logo_url} 
                  type="logo" 
                  getFileUrl={getFileUrl}
                />
              </div>
            </div>
          )}

          {hasDepoimentos && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Arquivos de Depoimentos</h3>
                <Button
                  onClick={handleDownloadAllDepoimentos}
                  disabled={isDownloadingDepoimentos}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloadingDepoimentos ? "Gerando ZIP..." : "Baixar Todos"}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {depoimentoUrls.map((filePath: string, index: number) => (
                  <MediaFileDisplay 
                    key={index} 
                    filePath={filePath} 
                    type="depoimento" 
                    index={index} 
                    getFileUrl={getFileUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {hasMidia && (
          <MediaSelectionProvider totalMediaCount={midiaUrls.length}>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Mídias</h3>
              </div>
              
              <MediaBulkDownloader 
                midiaUrls={midiaUrls}
                getFileUrl={getFileUrl}
                projectName={personalization.officenome || 'Projeto'}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {midiaUrls.map((media: any, index: number) => (
                  <MediaFileDisplay 
                    key={index} 
                    filePath={media} 
                    type="midia" 
                    index={index} 
                    caption={typeof media === 'object' && media?.caption ? media.caption : ''} 
                    getFileUrl={getFileUrl}
                  />
                ))}
              </div>
            </div>
          </MediaSelectionProvider>
        )}
      </CardContent>
    </Card>
  );
};

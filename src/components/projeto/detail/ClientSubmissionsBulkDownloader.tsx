import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Image, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { ClientMediaSubmission } from "@/types/clientSubmission";
import { ClientSubmissionService } from "@/services/clientSubmissionService";

interface ClientSubmissionsBulkDownloaderProps {
  submissions: ClientMediaSubmission[];
  projectName: string;
}

export function ClientSubmissionsBulkDownloader({ 
  submissions, 
  projectName 
}: ClientSubmissionsBulkDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Flatten all images from all submissions
  const allImages = submissions.flatMap((submission, submissionIndex) => 
    submission.media_urls.map((media, mediaIndex) => ({
      submissionId: submission.id,
      submissionDate: submission.submission_date,
      clientName: submission.client_name,
      url: media.url,
      caption: media.caption,
      filename: `${submission.client_name}_${submissionIndex + 1}_${mediaIndex + 1}`,
      price: extractPriceFromCaption(media.caption)
    }))
  );

  function extractPriceFromCaption(caption?: string): number | null {
    if (!caption) return null;
    const priceMatch = caption.match(/R\$\s*(\d+(?:,\d{2})?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'));
    }
    return null;
  }

  const copyDescription = async (description: string) => {
    try {
      await navigator.clipboard.writeText(description);
      toast({
        title: "Copiado!",
        description: "Descrição copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a descrição.",
        variant: "destructive"
      });
    }
  };

  const downloadAllImages = async () => {
    if (allImages.length === 0) {
      toast({
        title: "Nenhuma imagem",
        description: "Não há imagens para baixar.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      let successCount = 0;
      let errorCount = 0;

      for (const image of allImages) {
        try {
          // Get signed URL for the image
          const signedUrl = await ClientSubmissionService.getImageUrl(image.url);
          if (!signedUrl) {
            console.error(`Failed to get signed URL for image: ${image.filename}`);
            errorCount++;
            continue;
          }

          // Fetch the image
          const response = await fetch(signedUrl);
          if (!response.ok) {
            console.error(`Failed to fetch image ${image.filename}: ${response.statusText}`);
            errorCount++;
            continue;
          }

          const blob = await response.blob();
          
          // Get file extension
          let extension = '';
          const extensionMatch = image.url.match(/\.([^.]+)$/);
          if (extensionMatch) {
            extension = `.${extensionMatch[1]}`;
          } else if (blob.type) {
            const typeMap: { [key: string]: string } = {
              'image/jpeg': '.jpg',
              'image/png': '.png',
              'image/gif': '.gif',
              'image/webp': '.webp'
            };
            extension = typeMap[blob.type] || '.jpg';
          }

          // Create filename with client name and caption
          let filename = image.filename;
          if (image.caption) {
            const sanitizedCaption = image.caption
              .replace(/[^a-zA-Z0-9\s-_]/g, '')
              .substring(0, 30)
              .trim();
            if (sanitizedCaption) {
              filename = `${filename}_${sanitizedCaption}`;
            }
          }
          filename += extension;
          
          zip.file(filename, blob);
          successCount++;
        } catch (error) {
          console.error(`Error processing image ${image.filename}:`, error);
          errorCount++;
        }
      }

      if (successCount === 0) {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar nenhuma imagem.",
          variant: "destructive"
        });
        return;
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 30);
      link.download = `${sanitizedProjectName}_imagens_cliente.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: `${successCount} imagem(s) baixada(s) com sucesso${errorCount > 0 ? `. ${errorCount} arquivo(s) falharam` : ''}.`,
      });

    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao criar o arquivo ZIP.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (allImages.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Resumo das Imagens Recebidas
          </CardTitle>
          <Button 
            onClick={downloadAllImages}
            disabled={isDownloading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Baixando..." : `Baixar Todas (${allImages.length})`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Envios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{allImages.length}</div>
              <div className="text-sm text-muted-foreground">Imagens</div>
            </div>
          </div>

          {/* Images Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allImages.map((image, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {image.caption || `Imagem ${index + 1}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {image.price ? `R$ ${image.price.toFixed(2)}` : '--'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyDescription(image.caption || `Imagem ${index + 1}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
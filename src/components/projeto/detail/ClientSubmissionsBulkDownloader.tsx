import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Image, Copy, Folder, ChevronDown, ChevronRight } from "lucide-react";
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
  const [downloadingCategory, setDownloadingCategory] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Flatten all images from all submissions with category info
  const allImages = submissions.flatMap((submission, submissionIndex) => 
    submission.media_urls.map((media, mediaIndex) => ({
      submissionId: submission.id,
      submissionDate: submission.submission_date,
      clientName: submission.client_name,
      url: media.url,
      caption: media.caption || media.description,
      category: media.category || "Sem Categoria",
      filename: `${submission.client_name}_${submissionIndex + 1}_${mediaIndex + 1}`,
      price: extractPriceFromCaption(media.caption || media.description)
    }))
  );

  // Group images by category
  const imagesByCategory = allImages.reduce((acc, image) => {
    const category = image.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(image);
    return acc;
  }, {} as Record<string, typeof allImages>);

  const categories = Object.keys(imagesByCategory).sort();

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

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const downloadImagesAsZip = async (images: typeof allImages, zipName: string) => {
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    for (const image of images) {
      try {
        const signedUrl = await ClientSubmissionService.getImageUrl(image.url);
        if (!signedUrl) {
          console.error(`Failed to get signed URL for image: ${image.filename}`);
          errorCount++;
          continue;
        }

        const response = await fetch(signedUrl);
        if (!response.ok) {
          console.error(`Failed to fetch image ${image.filename}: ${response.statusText}`);
          errorCount++;
          continue;
        }

        const blob = await response.blob();
        
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
      throw new Error("Nenhuma imagem foi processada com sucesso");
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { successCount, errorCount };
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
      let totalSuccess = 0;
      let totalError = 0;

      // Create folders for each category
      for (const category of categories) {
        const categoryImages = imagesByCategory[category];
        const categoryFolder = zip.folder(category);
        
        if (!categoryFolder) continue;

        for (const image of categoryImages) {
          try {
            const signedUrl = await ClientSubmissionService.getImageUrl(image.url);
            if (!signedUrl) {
              console.error(`Failed to get signed URL for image: ${image.filename}`);
              totalError++;
              continue;
            }

            const response = await fetch(signedUrl);
            if (!response.ok) {
              console.error(`Failed to fetch image ${image.filename}: ${response.statusText}`);
              totalError++;
              continue;
            }

            const blob = await response.blob();
            
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
            
            categoryFolder.file(filename, blob);
            totalSuccess++;
          } catch (error) {
            console.error(`Error processing image ${image.filename}:`, error);
            totalError++;
          }
        }
      }

      if (totalSuccess === 0) {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar nenhuma imagem.",
          variant: "destructive"
        });
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 30);
      link.download = `${sanitizedProjectName}_todas_as_imagens.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: `${totalSuccess} imagem(s) baixada(s) organizadas em ${categories.length} pasta(s)${totalError > 0 ? `. ${totalError} arquivo(s) falharam` : ''}.`,
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

  const downloadCategory = async (category: string) => {
    const categoryImages = imagesByCategory[category];
    if (!categoryImages || categoryImages.length === 0) {
      toast({
        title: "Nenhuma imagem",
        description: "Não há imagens nesta categoria.",
        variant: "destructive"
      });
      return;
    }

    setDownloadingCategory(category);
    
    try {
      const sanitizedCategory = category.replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 30);
      const sanitizedProject = projectName.replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 30);
      const zipName = `${sanitizedProject}_${sanitizedCategory}.zip`;
      
      const { successCount, errorCount } = await downloadImagesAsZip(categoryImages, zipName);

      toast({
        title: "Download concluído",
        description: `${successCount} imagem(s) da categoria "${category}" baixada(s)${errorCount > 0 ? `. ${errorCount} arquivo(s) falharam` : ''}.`,
      });

    } catch (error) {
      console.error('Error downloading category:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar as imagens da categoria.",
        variant: "destructive"
      });
    } finally {
      setDownloadingCategory(null);
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
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Envios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{allImages.length}</div>
              <div className="text-sm text-muted-foreground">Imagens</div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryImages = imagesByCategory[category];
              const isOpen = openCategories[category];
              
              return (
                <div key={category} className="border rounded-lg">
                  <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                    <div className="flex items-center justify-between p-4 bg-muted/50">
                      <CollapsibleTrigger className="flex items-center gap-2 hover:bg-muted rounded px-2 py-1 transition-colors">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">({categoryImages.length} imagens)</span>
                      </CollapsibleTrigger>
                      
                      <Button
                        onClick={() => downloadCategory(category)}
                        disabled={downloadingCategory === category}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingCategory === category ? "Baixando..." : "Baixar Pasta"}
                      </Button>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-4 pt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoryImages.map((image, index) => (
                              <TableRow key={`${category}-${index}`}>
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
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
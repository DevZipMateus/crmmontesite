
import React, { useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, CheckSquare, Square, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { ImageConversionService, ConversionOptions } from "@/services/imageConversionService";
import { sanitizeFileName } from "@/lib/sanitize-file";

interface MediaSelectionContextType {
  selectedMedia: Set<number>;
  toggleMediaSelection: (index: number) => void;
  selectAllMedia: () => void;
  clearSelection: () => void;
  totalMediaCount: number;
}

const MediaSelectionContext = createContext<MediaSelectionContextType | null>(null);

export const useMediaSelection = () => {
  const context = useContext(MediaSelectionContext);
  if (!context) {
    // Return safe defaults when outside provider
    return {
      selectedMedia: new Set<number>(),
      toggleMediaSelection: () => {},
      selectAllMedia: () => {},
      clearSelection: () => {},
      totalMediaCount: 0
    };
  }
  return context;
};

interface MediaSelectionProviderProps {
  children: React.ReactNode;
  totalMediaCount: number;
}

export const MediaSelectionProvider: React.FC<MediaSelectionProviderProps> = ({ 
  children, 
  totalMediaCount 
}) => {
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());

  const toggleMediaSelection = (index: number) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedMedia(newSelection);
  };

  const selectAllMedia = () => {
    const allIndices = Array.from({ length: totalMediaCount }, (_, i) => i);
    setSelectedMedia(new Set(allIndices));
  };

  const clearSelection = () => {
    setSelectedMedia(new Set());
  };

  return (
    <MediaSelectionContext.Provider value={{
      selectedMedia,
      toggleMediaSelection,
      selectAllMedia,
      clearSelection,
      totalMediaCount
    }}>
      {children}
    </MediaSelectionContext.Provider>
  );
};

interface MediaBulkDownloaderProps {
  midiaUrls: any[];
  getFileUrl: (path: string | { url: string; caption?: string }) => Promise<string | null>;
  projectName: string;
}

export const MediaBulkDownloader: React.FC<MediaBulkDownloaderProps> = ({
  midiaUrls,
  getFileUrl,
  projectName
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [convertImages, setConvertImages] = useState(true);
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    outputFormat: 'jpeg',
    quality: 0.9
  });
  const { selectedMedia, selectAllMedia, clearSelection } = useMediaSelection();
  const { toast } = useToast();

  // Get list of formats that can be converted
  const getFileNamesFromMedia = () => {
    return midiaUrls.map((media, index) => {
      let filename = `midia_${index + 1}`;
      
      if (typeof media === 'object' && media.url) {
        const urlPath = media.url;
        const extensionMatch = urlPath.match(/\.([^.]+)$/);
        if (extensionMatch) {
          filename += `.${extensionMatch[1]}`;
        }
      }
      
      return filename;
    });
  };

  const convertibleFormats = ImageConversionService.getConvertibleFormats(getFileNamesFromMedia());

  const downloadMediaAsZip = async (mediaIndices: number[]) => {
    if (mediaIndices.length === 0) {
      toast({
        title: "Nenhuma mídia selecionada",
        description: "Selecione pelo menos uma mídia para baixar.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      let successCount = 0;
      let errorCount = 0;
      let convertedCount = 0;

      for (const index of mediaIndices) {
        try {
          const media = midiaUrls[index];
          if (!media) continue;

          // Get the signed URL
          const signedUrl = await getFileUrl(media);
          if (!signedUrl) {
            console.error(`Failed to get signed URL for media ${index}`);
            errorCount++;
            continue;
          }

          // Fetch the file
          const response = await fetch(signedUrl);
          if (!response.ok) {
            console.error(`Failed to fetch media ${index}: ${response.statusText}`);
            errorCount++;
            continue;
          }

          let blob = await response.blob();
          
          // Try to get file extension from URL or blob type
          let extension = '';
          if (typeof media === 'object' && media.url) {
            const urlPath = media.url;
            const extensionMatch = urlPath.match(/\.([^.]+)$/);
            if (extensionMatch) {
              extension = `.${extensionMatch[1]}`;
            }
          }
          
          if (!extension && blob.type) {
            const typeMap: { [key: string]: string } = {
              'image/jpeg': '.jpg',
              'image/png': '.png',
              'image/gif': '.gif',
              'image/webp': '.webp',
              'video/mp4': '.mp4',
              'video/webm': '.webm'
            };
            extension = typeMap[blob.type] || '';
          }

          // Generate filename - use caption as primary name if available
          let filename;
          if (typeof media === 'object' && media.caption?.trim()) {
            // Use caption as primary filename with proper sanitization
            const sanitizedCaption = sanitizeFileName(media.caption);
            filename = sanitizedCaption || `midia_${index + 1}`;
          } else {
            // Fallback to default naming
            filename = `midia_${index + 1}`;
          }

          filename += extension;

          // Convert image if needed and enabled
          if (convertImages && blob.type.startsWith('image/')) {
            try {
              const conversionResult = await ImageConversionService.convertImage(
                blob, 
                filename, 
                conversionOptions
              );
              
              blob = conversionResult.blob;
              filename = conversionResult.newFileName;
              
              if (conversionResult.converted) {
                convertedCount++;
              }
            } catch (conversionError) {
              console.error(`Failed to convert image ${index}:`, conversionError);
              // Continue with original file
            }
          }
          
          zip.file(filename, blob);
          successCount++;
        } catch (error) {
          console.error(`Error processing media ${index}:`, error);
          errorCount++;
        }
      }

      if (successCount === 0) {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar nenhuma mídia.",
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
      link.download = `${sanitizedProjectName}_midias.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Clear selection after successful download
      clearSelection();

      let description = `${successCount} mídia(s) baixada(s) com sucesso`;
      if (convertedCount > 0) {
        description += `. ${convertedCount} imagem(s) convertida(s) para ${conversionOptions.outputFormat.toUpperCase()}`;
      }
      if (errorCount > 0) {
        description += `. ${errorCount} arquivo(s) falharam`;
      }

      toast({
        title: "Download concluído",
        description: description + '.',
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

  const handleDownloadAll = () => {
    const allIndices = Array.from({ length: midiaUrls.length }, (_, i) => i);
    downloadMediaAsZip(allIndices);
  };

  const handleDownloadSelected = () => {
    downloadMediaAsZip(Array.from(selectedMedia));
  };

  const isAllSelected = selectedMedia.size === midiaUrls.length && midiaUrls.length > 0;

  return (
    <div className="space-y-3">
      {/* Conversion Options */}
      {convertibleFormats.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="convert-images"
              checked={convertImages}
              onCheckedChange={(checked) => setConvertImages(checked === true)}
            />
            <Label htmlFor="convert-images" className="text-sm font-medium">
              Converter formatos ({convertibleFormats.join(', ')}) para JPG/PNG
            </Label>
          </div>
          
          {convertImages && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600">Formato:</Label>
              <select
                value={conversionOptions.outputFormat}
                onChange={(e) => setConversionOptions({
                  ...conversionOptions,
                  outputFormat: e.target.value as 'jpeg' | 'png'
                })}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Download Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={handleDownloadAll}
          disabled={isDownloading || midiaUrls.length === 0}
          size="sm"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-1" />
          {isDownloading ? "Gerando ZIP..." : "Baixar Todas as Mídias"}
        </Button>

        {midiaUrls.length > 1 && (
          <>
            <Button
              onClick={isAllSelected ? clearSelection : selectAllMedia}
              size="sm"
              variant="ghost"
            >
              {isAllSelected ? (
                <><CheckSquare className="h-4 w-4 mr-1" /> Desmarcar Todas</>
              ) : (
                <><Square className="h-4 w-4 mr-1" /> Selecionar Todas</>
              )}
            </Button>

            {selectedMedia.size > 0 && (
              <Button
                onClick={handleDownloadSelected}
                disabled={isDownloading}
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar Selecionadas ({selectedMedia.size})
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

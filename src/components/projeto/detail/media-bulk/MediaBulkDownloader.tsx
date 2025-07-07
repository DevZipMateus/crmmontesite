
import React, { useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckSquare, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

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
    throw new Error('useMediaSelection must be used within MediaSelectionProvider');
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
  const { selectedMedia, selectAllMedia, clearSelection } = useMediaSelection();
  const { toast } = useToast();

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

          const blob = await response.blob();
          
          // Generate filename
          let filename = `midia_${index + 1}`;
          
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

          // Add caption to filename if available
          if (typeof media === 'object' && media.caption) {
            const sanitizedCaption = media.caption
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

      toast({
        title: "Download concluído",
        description: `${successCount} mídia(s) baixada(s) com sucesso${errorCount > 0 ? `. ${errorCount} arquivo(s) falharam.` : '.'}`,
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
    <div className="flex flex-wrap items-center gap-2 mb-4">
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
  );
};

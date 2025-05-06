
import React, { useState, useEffect } from "react";
import { FileIcon, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaFileDisplayProps {
  filePath: string;
  type: 'logo' | 'midia' | 'depoimento';
  caption?: string;
  index?: number;
  getFileUrl: (path: string) => Promise<string | null>;
}

export const MediaFileDisplay: React.FC<MediaFileDisplayProps> = ({ 
  filePath, 
  type, 
  caption, 
  index, 
  getFileUrl 
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setIsLoading(true);
        const url = await getFileUrl(filePath);
        setFileUrl(url);
      } catch (err) {
        console.error("Error fetching file URL:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (filePath) {
      fetchUrl();
    } else {
      setIsLoading(false);
      setIsError(true);
    }
  }, [filePath, getFileUrl]);

  // Check if file is an image
  const isImage = filePath ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath) : false;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (isError || !fileUrl) {
    return (
      <div className="flex flex-col justify-center items-center bg-gray-100 rounded-md p-4 h-32">
        <FileIcon className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Erro ao carregar arquivo</p>
        <p className="text-xs text-gray-400">Caminho: {filePath}</p>
      </div>
    );
  }

  const displayName = caption || `${type} ${(index !== undefined) ? index + 1 : ''}`;
  const fileName = filePath.split('/').pop() || displayName;

  return (
    <div className="flex flex-col">
      <div className="relative group">
        {isImage ? (
          <div className="relative overflow-hidden bg-gray-100 rounded-md aspect-square">
            <img 
              src={fileUrl} 
              alt={displayName} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button 
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
            <FileIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-sm text-gray-500 truncate max-w-[150px]">{displayName}</p>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6" 
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6"
            onClick={() => {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

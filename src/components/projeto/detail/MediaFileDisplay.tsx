
import React, { useState, useEffect } from "react";
import { Download, ExternalLink, FileIcon, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
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
  const [fileType, setFileType] = useState<string>("");

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setIsLoading(true);
        const url = await getFileUrl(filePath);
        setFileUrl(url);
        
        // Determine file type from extension
        const extension = filePath.split('.').pop()?.toLowerCase() || '';
        setFileType(extension);
      } catch (err) {
        console.error("Error fetching file URL:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUrl();
  }, [filePath, getFileUrl]);

  // Check if file is an image
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath);
  // Check if file is a video
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(filePath);
  
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
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="relative group">
        {isImage ? (
          <div className="relative overflow-hidden bg-gray-100 rounded-md aspect-square">
            <img 
              src={fileUrl} 
              alt={caption || `${type} ${index || 0}`} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center gap-2">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <ExternalLink className="h-4 w-4 text-gray-700" />
              </a>
              <a 
                href={fileUrl} 
                download
                className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <Download className="h-4 w-4 text-gray-700" />
              </a>
            </div>
          </div>
        ) : isVideo ? (
          <div className="relative rounded-md overflow-hidden">
            <video 
              src={fileUrl} 
              controls
              className="w-full rounded-md"
            />
            <div className="absolute bottom-0 right-0 m-2 flex gap-1">
              <a 
                href={fileUrl} 
                download
                className="bg-white rounded-full p-1.5 shadow-md"
              >
                <Download className="h-3.5 w-3.5 text-gray-700" />
              </a>
            </div>
          </div>
        ) : (
          <div className="relative flex justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
            <FileIcon className="h-8 w-8 text-gray-400" />
            <div className="absolute top-2 right-2 flex gap-1">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white rounded-full p-1.5 opacity-70 hover:opacity-100 shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
              </a>
              <a 
                href={fileUrl} 
                download
                className="bg-white rounded-full p-1.5 opacity-70 hover:opacity-100 shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-gray-700" />
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-1 flex items-center justify-between">
        {caption ? (
          <p className="text-sm text-gray-500 truncate">{caption}</p>
        ) : (
          <p className="text-xs text-gray-400">{type} {(index !== undefined) ? index + 1 : ''}</p>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p><span className="font-medium">Tipo:</span> {fileType.toUpperCase()}</p>
                <p><span className="font-medium">Caminho:</span> {filePath.split('/').pop()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

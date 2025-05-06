
import React, { useState, useEffect } from "react";
import { ExternalLink, FileIcon } from "lucide-react";

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
    
    fetchUrl();
  }, [filePath, getFileUrl]);

  // Check if file is an image
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath);
  
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
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group"
      >
        {isImage ? (
          <div className="relative overflow-hidden bg-gray-100 rounded-md aspect-square">
            <img 
              src={fileUrl} 
              alt={caption || `${type} ${index || 0}`} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
            <FileIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </a>
      {caption && <p className="text-sm text-gray-500 mt-1 truncate">{caption}</p>}
      {!caption && <p className="text-xs text-gray-400 mt-1">{type} {(index !== undefined) ? index + 1 : ''}</p>}
    </div>
  );
};


import React from "react";
import { FileIcon } from "lucide-react";

interface MediaErrorStateProps {
  filePath: string | { url: string; caption?: string };
}

export const MediaErrorState: React.FC<MediaErrorStateProps> = ({ filePath }) => {
  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 rounded-md p-4 h-32">
      <FileIcon className="h-8 w-8 text-gray-400" />
      <p className="text-sm text-gray-500 mt-2">Erro ao carregar arquivo</p>
      <p className="text-xs text-gray-400 truncate max-w-full">
        {typeof filePath === 'string' 
          ? filePath 
          : (typeof filePath === 'object' && filePath.url ? filePath.url : JSON.stringify(filePath))}
      </p>
    </div>
  );
};


import React from "react";
import { FileIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileDisplayProps {
  fileUrl?: string;
  fileName?: string;
  displayName?: string;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({ 
  fileUrl, 
  fileName, 
  displayName 
}) => {
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200 relative">
      <FileIcon className="h-8 w-8 text-gray-400" />
      {fileName && <p className="text-xs text-gray-400 mt-2 truncate max-w-full">{fileName}</p>}
      
      {fileUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-md transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Baixar
          </Button>
        </div>
      )}
    </div>
  );
};

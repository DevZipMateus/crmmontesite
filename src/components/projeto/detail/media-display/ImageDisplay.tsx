
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

interface ImageDisplayProps {
  fileUrl: string;
  displayName: string;
  fileName: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  fileUrl, 
  displayName, 
  fileName 
}) => {
  return (
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
  );
};

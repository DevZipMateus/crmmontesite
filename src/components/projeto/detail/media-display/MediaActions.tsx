
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

interface MediaActionsProps {
  fileUrl: string;
  fileName: string;
}

export const MediaActions: React.FC<MediaActionsProps> = ({ fileUrl, fileName }) => {
  return (
    <div className="flex gap-1 mt-1">
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
  );
};

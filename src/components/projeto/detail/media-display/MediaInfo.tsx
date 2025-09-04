
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaInfoProps {
  displayName: string;
  captionText?: string;
}

export const MediaInfo: React.FC<MediaInfoProps> = ({ displayName, captionText }) => {
  const { toast } = useToast();

  const copyCaption = async () => {
    if (captionText) {
      try {
        await navigator.clipboard.writeText(captionText);
        toast({
          title: "Texto copiado!",
          description: "A legenda foi copiada para a área de transferência.",
        });
      } catch (err) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <p className="text-sm text-gray-500 truncate max-w-[150px]" title={displayName}>
        {displayName}
      </p>
      {captionText && (
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-400 truncate max-w-[120px]" title={captionText}>
            {captionText}
          </p>
          <Button 
            size="icon"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-gray-100"
            onClick={copyCaption}
            title="Copiar legenda"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      )}
    </>
  );
};

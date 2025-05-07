
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommandDisplayProps {
  generatedText: string | null;
  onCopy: () => void;
}

export const CommandDisplay: React.FC<CommandDisplayProps> = ({
  generatedText,
  onCopy
}) => {
  if (!generatedText) return null;

  return (
    <div className="mt-6 p-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Comando Gerado</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCopy}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copiar
        </Button>
      </div>
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <pre className="whitespace-pre-wrap text-sm">
          {generatedText}
        </pre>
      </div>
    </div>
  );
};

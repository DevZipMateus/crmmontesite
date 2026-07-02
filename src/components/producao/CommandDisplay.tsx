
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
    <div className="p-6 bg-black text-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-100">Comando Gerado</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCopy}
          className="flex items-center gap-2 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-slate-100"
        >
          <Copy className="h-4 w-4" />
          Copiar
        </Button>
      </div>
      <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
        <pre className="whitespace-pre-wrap text-sm font-mono text-slate-100">
          {generatedText}
        </pre>
      </div>
    </div>
  );
};

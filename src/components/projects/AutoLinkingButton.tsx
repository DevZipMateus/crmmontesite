
import React from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, CheckCircle } from "lucide-react";
import { useLeadProjectLinking } from "@/hooks/useLeadProjectLinking";

interface AutoLinkingButtonProps {
  onLinkingComplete?: () => void;
}

export const AutoLinkingButton: React.FC<AutoLinkingButtonProps> = ({ onLinkingComplete }) => {
  const { runAutoLinking, isLinking } = useLeadProjectLinking();

  const handleAutoLink = async () => {
    console.log("AutoLinkingButton: Iniciando processo de vinculação automática");
    
    try {
      const result = await runAutoLinking();
      
      console.log("AutoLinkingButton: Resultado da vinculação:", result);
      
      if (onLinkingComplete && result.linked > 0) {
        console.log("AutoLinkingButton: Chamando callback onLinkingComplete");
        onLinkingComplete();
      }
    } catch (error) {
      console.error("AutoLinkingButton: Erro no processo de vinculação:", error);
    }
  };

  return (
    <Button
      onClick={handleAutoLink}
      disabled={isLinking}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isLinking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Vinculando...
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Vincular Leads
        </>
      )}
    </Button>
  );
};

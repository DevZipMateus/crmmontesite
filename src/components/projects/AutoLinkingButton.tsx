
import React from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { useLeadProjectLinking } from "@/hooks/useLeadProjectLinking";

interface AutoLinkingButtonProps {
  onLinkingComplete?: () => void;
}

export const AutoLinkingButton: React.FC<AutoLinkingButtonProps> = ({ onLinkingComplete }) => {
  const { runAutoLinking, isLinking } = useLeadProjectLinking();

  const handleAutoLink = async () => {
    const result = await runAutoLinking();
    if (onLinkingComplete && result.linked > 0) {
      onLinkingComplete();
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
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      {isLinking ? "Vinculando..." : "Vincular Leads"}
    </Button>
  );
};

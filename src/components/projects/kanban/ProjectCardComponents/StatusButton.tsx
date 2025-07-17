
import { Button } from "@/components/ui/button";
import { CheckCircle2, Code, Globe, Inbox } from "lucide-react";

interface StatusButtonProps {
  status: { value: string; color: string };
  onStatusChange: () => void;
  updatingStatus: boolean;
  size?: "sm" | "default";
}

export const StatusButton = ({ 
  status, 
  onStatusChange, 
  updatingStatus,
  size = "sm"
}: StatusButtonProps) => {
  const StatusIcon = status.value === "Recebido" ? Inbox : 
                    status.value === "Criando site" ? Code : 
                    status.value === "Configurando Domínio" ? Globe :
                    CheckCircle2;

  // Truncate text more aggressively for better mobile display
  const displayText = status.value.length > 8 ? `${status.value.substring(0, 8)}...` : status.value;

  return (
    <Button 
      variant="ghost" 
      size={size}
      className="text-xs h-6 px-1.5 py-1 min-w-0 flex-shrink-0 justify-start hover:bg-gray-50 transition-colors"
      onClick={onStatusChange}
      disabled={updatingStatus}
      aria-label={`Mudar status para ${status.value}`}
      title={status.value}
    >
      <StatusIcon className="h-2.5 w-2.5 mr-1 flex-shrink-0" aria-hidden="true" />
      <span className="truncate text-xs">{displayText}</span>
    </Button>
  );
};

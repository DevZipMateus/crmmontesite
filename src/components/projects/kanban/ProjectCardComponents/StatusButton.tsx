
import { Button } from "@/components/ui/button";
import { CheckCircle2, Code, Clock, Globe, Inbox } from "lucide-react";

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
                    status.value === "Aguardando DNS" ? Clock :
                    CheckCircle2;

  const displayText = status.value.length > 10 ? `${status.value.substring(0, 10)}...` : status.value;

  return (
    <Button 
      variant="ghost" 
      size={size}
      className="text-xs h-7"
      onClick={onStatusChange}
      disabled={updatingStatus}
      aria-label={`Mudar status para ${status.value}`}
      title={status.value}
    >
      <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
      {displayText}
    </Button>
  );
};

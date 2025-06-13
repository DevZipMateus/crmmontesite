
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDeadlineStatus } from "@/utils/businessDays";

interface CustomizationDeadlineIndicatorProps {
  status: string;
  siteReadyDate?: string | null;
  customizationDeadline?: string | null;
  requiresPaidCustomization?: boolean;
}

export const CustomizationDeadlineIndicator = ({
  status,
  siteReadyDate,
  customizationDeadline,
  requiresPaidCustomization
}: CustomizationDeadlineIndicatorProps) => {
  // Only show for "Site pronto" projects
  if (status !== "Site pronto") return null;
  
  const deadlineStatus = getDeadlineStatus(customizationDeadline, true);
  
  if (!deadlineStatus) return null;
  
  const isExpired = deadlineStatus.status === 'expired' || requiresPaidCustomization;
  
  return (
    <div className="mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex items-center gap-1.5">
        {isExpired ? (
          <AlertTriangle className="h-3 w-3 text-red-500" />
        ) : (
          <Clock className="h-3 w-3 text-orange-500" />
        )}
        
        <Badge 
          variant={isExpired ? "destructive" : "outline"}
          className="text-xs"
        >
          {isExpired ? "Taxa de R$ 100,00" : deadlineStatus.message}
        </Badge>
      </div>
      
      {customizationDeadline && (
        <div className="text-xs text-gray-500 mt-1">
          Prazo: {new Date(customizationDeadline).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
};

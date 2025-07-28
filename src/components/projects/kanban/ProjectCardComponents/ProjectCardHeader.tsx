
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { useModelDetails } from "@/utils/modelUtils";

interface ProjectCardHeaderProps {
  clientName: string;
  template: string;
  hasPendingCustomizations: boolean;
  isLoading?: boolean;
  createdAt: string;
}

export const ProjectCardHeader = ({ 
  clientName, 
  template, 
  hasPendingCustomizations,
  isLoading = false,
  createdAt
}: ProjectCardHeaderProps) => {
  const { modelName, isLoading: modelLoading } = useModelDetails(template);

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex justify-between">
        <div className="font-medium text-primary">{clientName}</div>
        {hasPendingCustomizations && (
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Customização pendente
          </Badge>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        {isLoading || modelLoading ? (
          <span className="text-gray-400">Carregando modelo...</span>
        ) : (
          modelName || "Sem modelo"
        )}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Calendar className="h-3 w-3" />
        <span>Criado em {formatDate(createdAt)}</span>
      </div>
    </div>
  );
};

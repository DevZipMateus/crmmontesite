
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface ProjectCardHeaderProps {
  clientName: string;
  template: string;
  hasPendingCustomizations: boolean;
  isLoading?: boolean;
}

export const ProjectCardHeader = ({ 
  clientName, 
  template, 
  hasPendingCustomizations,
  isLoading = false
}: ProjectCardHeaderProps) => {
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
        {isLoading ? (
          <span className="text-gray-400">Carregando modelo...</span>
        ) : (
          template || "Sem modelo"
        )}
      </div>
    </div>
  );
};

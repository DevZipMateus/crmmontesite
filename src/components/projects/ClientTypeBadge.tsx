
import { Badge } from "@/components/ui/badge";
import { getClientTypeInfo } from "@/utils/clientTypeUtils";
import { User, Users, Building, Target } from "lucide-react";

interface ClientTypeBadgeProps {
  project: {
    client_type?: string;
    project_source?: string;
    partner_hash?: string;
  };
  variant?: 'banner' | 'badge';
}

const getIcon = (type: string) => {
  switch (type) {
    case 'cliente_final':
      return <User className="h-3 w-3" />;
    case 'parceiro':
      return <Building className="h-3 w-3" />;
    case 'cliente_parceiro':
      return <Users className="h-3 w-3" />;
    case 'outbound':
      return <Target className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

export function ClientTypeBadge({ project, variant = 'badge' }: ClientTypeBadgeProps) {
  const clientTypeInfo = getClientTypeInfo(project);

  if (variant === 'banner') {
    return (
      <div className={`${clientTypeInfo.bgColor} ${clientTypeInfo.borderColor} border-l-4 px-2 py-1 mb-2`}>
        <div className={`flex items-center gap-1 text-xs font-medium ${clientTypeInfo.color}`}>
          {getIcon(clientTypeInfo.type)}
          {clientTypeInfo.label}
        </div>
      </div>
    );
  }

  return (
    <Badge variant="outline" className={`${clientTypeInfo.bgColor} ${clientTypeInfo.color} border-0`}>
      <div className="flex items-center gap-1">
        {getIcon(clientTypeInfo.type)}
        {clientTypeInfo.label}
      </div>
    </Badge>
  );
}

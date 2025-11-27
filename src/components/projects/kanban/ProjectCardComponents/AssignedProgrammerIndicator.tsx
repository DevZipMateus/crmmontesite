
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface AssignedProgrammerIndicatorProps {
  assignedProgrammer?: string;
}

export function AssignedProgrammerIndicator({ assignedProgrammer }: AssignedProgrammerIndicatorProps) {
  if (!assignedProgrammer) {
    return null;
  }

  // Definir cor baseada no programador
  const getProgrammerColor = (programmer: string) => {
    switch (programmer.toLowerCase()) {
      case 'mateus':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'davi':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'victor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manoelle':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Badge 
        variant="outline" 
        className={`text-xs px-2 py-1 ${getProgrammerColor(assignedProgrammer)}`}
      >
        <User className="h-3 w-3 mr-1" />
        {assignedProgrammer}
      </Badge>
    </div>
  );
}

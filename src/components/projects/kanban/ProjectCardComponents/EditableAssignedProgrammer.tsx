
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditableAssignedProgrammerProps {
  assignedProgrammer?: string;
  onAssignedProgrammerChange?: (programmer: string | null) => void;
}

const programmerOptions = [
  { value: null, label: "Não atribuído", color: "bg-gray-100 text-gray-600 border-gray-200" },
  { value: "Mateus", label: "Mateus", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "Davi", label: "Davi", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Victor", label: "Victor", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "Manoelle", label: "Manoelle", color: "bg-pink-100 text-pink-800 border-pink-200" },
];

export function EditableAssignedProgrammer({ 
  assignedProgrammer, 
  onAssignedProgrammerChange 
}: EditableAssignedProgrammerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const currentOption = programmerOptions.find(option => option.value === assignedProgrammer) || programmerOptions[0];

  const handleProgrammerChange = async (newProgrammer: string | null) => {
    if (!onAssignedProgrammerChange) return;
    
    setIsUpdating(true);
    try {
      await onAssignedProgrammerChange(newProgrammer);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            disabled={isUpdating}
          >
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity ${currentOption.color}`}
            >
              <User className="h-3 w-3 mr-1" />
              <span>{isUpdating ? "Atualizando..." : currentOption.label}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-40">
          {programmerOptions.map((option) => (
            <DropdownMenuItem
              key={option.value || "none"}
              onClick={() => handleProgrammerChange(option.value)}
              className="cursor-pointer"
            >
              <User className="h-3 w-3 mr-2" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

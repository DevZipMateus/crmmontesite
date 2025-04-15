
import { PROJECT_STATUS_TYPES } from "@/lib/supabase";
import KanbanColumn from "./kanban/KanbanColumn";
import { useDragAndDrop } from "./kanban/useDragAndDrop";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
}

interface KanbanBoardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function KanbanBoard({ projects, setProjects }: KanbanBoardProps) {
  const {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange
  } = useDragAndDrop(projects, setProjects);
  
  const isMobile = useIsMobile();
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  
  // For mobile view, only show one column at a time with navigation
  const handleNextColumn = () => {
    setActiveColumnIndex((prev) => 
      prev < PROJECT_STATUS_TYPES.length - 1 ? prev + 1 : prev
    );
  };
  
  const handlePrevColumn = () => {
    setActiveColumnIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  if (isMobile) {
    // Mobile view - show one column at a time with navigation controls
    const currentStatusType = PROJECT_STATUS_TYPES[activeColumnIndex];
    
    return (
      <div className="relative">
        {/* Mobile navigation controls */}
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevColumn}
            disabled={activeColumnIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            {currentStatusType.value} ({activeColumnIndex + 1}/{PROJECT_STATUS_TYPES.length})
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextColumn}
            disabled={activeColumnIndex === PROJECT_STATUS_TYPES.length - 1}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <KanbanColumn
          key={currentStatusType.value}
          statusType={currentStatusType}
          projects={projects}
          draggingId={draggingId}
          updatingStatus={updatingStatus}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onStatusChange={handleStatusChange}
          statusOptions={PROJECT_STATUS_TYPES}
        />
      </div>
    );
  }

  // Desktop view - show all columns in a grid
  return (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1000px]">
        {PROJECT_STATUS_TYPES.map((statusType) => (
          <KanbanColumn
            key={statusType.value}
            statusType={statusType}
            projects={projects}
            draggingId={draggingId}
            updatingStatus={updatingStatus}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onStatusChange={handleStatusChange}
            statusOptions={PROJECT_STATUS_TYPES}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

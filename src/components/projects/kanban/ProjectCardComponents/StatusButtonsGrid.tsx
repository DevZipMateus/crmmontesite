
import { useIsMobile } from "@/hooks/use-mobile";
import { StatusButton } from "./StatusButton";
import { Project } from "@/types/project";

interface StatusButtonsGridProps {
  project: Project;
  statusOptions: Array<{ value: string; color: string }>;
  onStatusChange: (projectId: string, newStatus: string) => void;
  isUpdating: boolean;
}

export const StatusButtonsGrid = ({
  project,
  statusOptions,
  onStatusChange,
  isUpdating
}: StatusButtonsGridProps) => {
  const isMobile = useIsMobile();
  
  // Filter out the current status
  const availableStatuses = statusOptions.filter(s => s.value !== project.status);
  
  // For mobile, only show first 2 statuses, for desktop show first 4
  const displayStatuses = isMobile
    ? availableStatuses.slice(0, 2)
    : availableStatuses.slice(0, 4);
    
  return (
    <div className={`grid gap-1 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {displayStatuses.map(status => (
        <StatusButton 
          key={status.value}
          status={status}
          onStatusChange={() => onStatusChange(project.id, status.value)}
          updatingStatus={isUpdating}
          size="sm"
        />
      ))}
    </div>
  );
};


import { useIsMobile } from "@/hooks/use-mobile";
import { StatusButton } from "./StatusButton";

interface StatusButtonsGridProps {
  currentStatus: string;
  statusOptions: Array<{ value: string; color: string }>;
  updatingStatus: boolean;
  onStatusChange: (status: string) => void;
}

export const StatusButtonsGrid = ({
  currentStatus,
  statusOptions,
  updatingStatus,
  onStatusChange
}: StatusButtonsGridProps) => {
  const isMobile = useIsMobile();
  
  // Filter out the current status
  const availableStatuses = statusOptions.filter(s => s.value !== currentStatus);
  
  // For mobile, only show first 2 statuses
  const displayStatuses = isMobile
    ? availableStatuses.slice(0, 2)
    : availableStatuses;
    
  return (
    <div className="grid grid-cols-2 gap-1">
      {displayStatuses.map(status => (
        <StatusButton 
          key={status.value}
          status={status}
          onStatusChange={() => onStatusChange(status.value)}
          updatingStatus={updatingStatus}
        />
      ))}
    </div>
  );
};

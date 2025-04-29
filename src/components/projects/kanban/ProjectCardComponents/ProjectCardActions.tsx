
import { Button } from "@/components/ui/button";
import { Eye, PenSquare } from "lucide-react";

interface ProjectCardActionsProps {
  projectId: string;
  projectName: string;
  onViewEdit: (projectId: string, action: 'view' | 'edit') => void;
  onProjectDeleted?: () => void;
}

export const ProjectCardActions = ({
  projectId,
  projectName,
  onViewEdit,
  onProjectDeleted
}: ProjectCardActionsProps) => {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onViewEdit(projectId, 'view')}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onViewEdit(projectId, 'edit')}
      >
        <PenSquare className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

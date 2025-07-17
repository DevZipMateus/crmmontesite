
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, PenSquare, Archive, ArchiveRestore } from "lucide-react";
import { useProjectArchiving } from "@/hooks/use-project-archiving";
import { ArchiveDialog } from "./ArchiveDialog";

interface ProjectCardActionsProps {
  projectId: string;
  projectName: string;
  isArchived?: boolean;
  onViewEdit: (projectId: string, action: 'view' | 'edit') => void;
  onProjectDeleted?: () => void;
}

export const ProjectCardActions = ({
  projectId,
  projectName,
  isArchived = false,
  onViewEdit,
  onProjectDeleted
}: ProjectCardActionsProps) => {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { archiveProject, unarchiveProject, isArchiving } = useProjectArchiving();

  const handleArchiveConfirm = async () => {
    const success = isArchived 
      ? await unarchiveProject(projectId)
      : await archiveProject(projectId);
    
    if (success && onProjectDeleted) {
      onProjectDeleted();
    }
    
    setShowArchiveDialog(false);
  };

  return (
    <>
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
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setShowArchiveDialog(true)}
          disabled={isArchiving}
        >
          {isArchived ? (
            <ArchiveRestore className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <ArchiveDialog
        isOpen={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleArchiveConfirm}
        isArchiving={isArchiving}
        projectName={projectName}
        isArchived={isArchived}
      />
    </>
  );
};

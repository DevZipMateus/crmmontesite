
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CustomizationStatus, ProjectCustomization } from "@/types/customization";
import { updateCustomizationStatus } from "@/services/customizationService";

interface CustomizationStatusUpdateProps {
  customization: ProjectCustomization;
  onSuccess?: () => void;
}

export function CustomizationStatusUpdate({
  customization,
  onSuccess,
}: CustomizationStatusUpdateProps) {
  const [status, setStatus] = useState<CustomizationStatus>(customization.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (status === customization.status) return;

    setIsUpdating(true);
    try {
      const { success } = await updateCustomizationStatus(
        customization.id,
        status
      );

      if (success && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(value) => setStatus(value as CustomizationStatus)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Solicitado">Solicitado</SelectItem>
          <SelectItem value="Em andamento">Em andamento</SelectItem>
          <SelectItem value="Concluído">Concluído</SelectItem>
          <SelectItem value="Cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <Button
        size="sm"
        variant="outline"
        onClick={handleStatusChange}
        disabled={isUpdating || status === customization.status}
      >
        {isUpdating ? "Atualizando..." : "Atualizar"}
      </Button>
    </div>
  );
}


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
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Updating customization status:", {
        id: customization.id,
        status: status
      });

      let updateData: Partial<ProjectCustomization> = { status };
      
      // Automatically set completed_at when status is changed to Concluído
      if (status === 'Concluído' && !customization.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("project_customizations")
        .update(updateData)
        .eq("id", customization.id);

      if (error) {
        console.error("Error updating customization status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status atualizado",
        description: `Status alterado para ${status}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive",
      });
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


import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCustomization } from "@/types/customization";
import { CustomizationStatusUpdate } from "./CustomizationStatusUpdate";
import { Trash } from "lucide-react";
import { deleteCustomization } from "@/services/customizationService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CustomizationDetailProps {
  customization: ProjectCustomization;
  onStatusUpdate?: () => void;
  onDelete?: () => void;
}

const statusColors = {
  'Solicitado': 'bg-yellow-100 text-yellow-800',
  'Em andamento': 'bg-blue-100 text-blue-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  'Baixa': 'bg-gray-100 text-gray-800',
  'Média': 'bg-blue-100 text-blue-800',
  'Alta': 'bg-orange-100 text-orange-800',
  'Urgente': 'bg-red-100 text-red-800'
};

export function CustomizationDetail({
  customization,
  onStatusUpdate,
  onDelete,
}: CustomizationDetailProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionToShow = showFullDescription
    ? customization.description
    : customization.description.length > 150
    ? `${customization.description.slice(0, 150)}...`
    : customization.description;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteCustomization(customization.id);
      
      if (result.success && onDelete) {
        onDelete();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Personalização</CardTitle>
            <CardDescription>
              Solicitada em{" "}
              {format(new Date(customization.requested_at), "dd/MM/yyyy")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityColors[customization.priority]}>
              {customization.priority}
            </Badge>
            <Badge className={statusColors[customization.status]}>
              {customization.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Descrição:</p>
          <p className="text-sm">
            {descriptionToShow}
            {customization.description.length > 150 && (
              <button
                onClick={toggleDescription}
                className="ml-1 text-blue-600 hover:underline focus:outline-none"
              >
                {showFullDescription ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </p>

          {customization.notes && (
            <>
              <p className="text-sm font-medium text-gray-500 mt-4">
                Observações:
              </p>
              <p className="text-sm">{customization.notes}</p>
            </>
          )}

          {customization.completed_at && (
            <p className="text-sm mt-4">
              <span className="font-medium text-gray-500">Concluído em:</span>{" "}
              {format(new Date(customization.completed_at), "dd/MM/yyyy")}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">
            ID: {customization.id.substring(0, 8)}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:bg-red-50 border-red-200"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
        <CustomizationStatusUpdate
          customization={customization}
          onSuccess={onStatusUpdate}
        />
      </CardFooter>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir personalização</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta personalização? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir personalização"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

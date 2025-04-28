
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
import { ProjectCustomization } from "@/types/customization";
import { CustomizationStatusUpdate } from "./CustomizationStatusUpdate";

interface CustomizationDetailProps {
  customization: ProjectCustomization;
  onStatusUpdate?: () => void;
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
}: CustomizationDetailProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionToShow = showFullDescription
    ? customization.description
    : customization.description.length > 150
    ? `${customization.description.slice(0, 150)}...`
    : customization.description;

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
        <p className="text-xs text-gray-500">
          ID: {customization.id.substring(0, 8)}
        </p>
        <CustomizationStatusUpdate
          customization={customization}
          onSuccess={onStatusUpdate}
        />
      </CardFooter>
    </Card>
  );
}

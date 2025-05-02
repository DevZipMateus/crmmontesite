
import React from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Copy, Check, Edit, Trash } from "lucide-react";
import { ModelTemplate } from "@/services/modelTemplateService";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useModelContext } from "./hooks/useModelContext";
import { useToast } from "@/hooks/use-toast";

interface ModelCardProps {
  model: ModelTemplate;
  baseUrl: string;
  onEditClick: (model: ModelTemplate) => void;
  onDeleteConfirm: (model: ModelTemplate) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, baseUrl, onEditClick, onDeleteConfirm }) => {
  const { copied, setCopied } = useModelContext();
  const { toast } = useToast();

  // Get full URL for a model
  const getFullUrl = (model: ModelTemplate) => {
    const urlParam = model.custom_url || model.id;
    return `${baseUrl}/formulario/${urlParam}`;
  };

  // Copy URL to clipboard
  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência.",
      });
      
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <TableRow key={model.id}>
      <TableCell className="font-medium">{model.name}</TableCell>
      <TableCell className="max-w-xs truncate">{model.description}</TableCell>
      <TableCell>{model.custom_url || <span className="text-gray-400 italic">Nenhuma</span>}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2 truncate max-w-[180px]">
            {getFullUrl(model)}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(model.id, getFullUrl(model))}
          >
            {copied === model.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditClick(model)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

export default ModelCard;

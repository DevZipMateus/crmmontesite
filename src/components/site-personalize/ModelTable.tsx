
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModelTemplate } from "@/services/modelTemplateService";
import ModelCard from "./ModelCard";
import { useModelContext } from "./hooks/useModelContext";

interface ModelTableProps {
  baseUrl: string;
  onEditClick: (model: ModelTemplate) => void;
  onDeleteConfirm: (model: ModelTemplate) => void;
}

const ModelTable: React.FC<ModelTableProps> = ({ baseUrl, onEditClick, onDeleteConfirm }) => {
  const { models } = useModelContext();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>URL Personalizada</TableHead>
          <TableHead>Link Completo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <ModelCard 
            key={model.id} 
            model={model} 
            baseUrl={baseUrl}
            onEditClick={onEditClick}
            onDeleteConfirm={onDeleteConfirm}
          />
        ))}
        
        {models.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Nenhum modelo encontrado. Crie um novo modelo para começar.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ModelTable;

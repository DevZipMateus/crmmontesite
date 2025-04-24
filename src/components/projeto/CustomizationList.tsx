
import { useState } from "react";
import { ProjectCustomization } from "@/types/customization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CustomizationListProps {
  customizations: ProjectCustomization[];
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

export function CustomizationList({ customizations }: CustomizationListProps) {
  if (!customizations.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma customização solicitada ainda.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead>Concluído em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customizations.map((customization) => (
            <TableRow key={customization.id}>
              <TableCell>{customization.description}</TableCell>
              <TableCell>
                <Badge className={statusColors[customization.status]}>
                  {customization.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[customization.priority]}>
                  {customization.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(customization.requested_at), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                {customization.completed_at 
                  ? format(new Date(customization.completed_at), 'dd/MM/yyyy')
                  : '—'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

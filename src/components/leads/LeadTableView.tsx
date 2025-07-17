
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, ExternalLink } from "lucide-react";
import { Lead } from "@/types/lead";
import { ProjectLinkIndicator } from "./ProjectLinkIndicator";

interface LeadTableViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

export default function LeadTableView({ leads, onEdit }: LeadTableViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysSinceContact = (dateString: string) => {
    const contactDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - contactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysColor = (days: number) => {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao.toLowerCase()) {
      case 'em contato':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'aguardando resposta':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'em desenvolvimento':
        return "bg-green-100 text-green-800 border-green-200";
      case 'site pronto':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'cancelado':
        return "bg-red-100 text-red-800 border-red-200";
      case 'sem resposta':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Projeto Vinculado</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Último Contato</TableHead>
            <TableHead>Dias</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const daysSinceContact = calculateDaysSinceContact(lead.data_ultimo_contato);
            
            return (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{lead.empresa}</TableCell>
                <TableCell>{lead.nome_cliente}</TableCell>
                <TableCell>
                  {lead.project_id ? (
                    <ProjectLinkIndicator lead={lead} />
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>{lead.vendedor || '—'}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getSituacaoColor(lead.situacao)}
                  >
                    {lead.situacao}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(lead.data_ultimo_contato)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getDaysColor(daysSinceContact)}`}>
                    {daysSinceContact}d
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(lead)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {lead.link_chat && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={lead.link_chat}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir chat"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}


import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, ExternalLink, Trash } from "lucide-react";
import { Lead } from "@/types/lead";
import { ProjectLinkIndicator } from "./ProjectLinkIndicator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LeadFormUrlGenerator } from "./LeadFormUrlGenerator";

interface LeadTableViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function LeadTableView({ leads, onEdit, onDelete }: LeadTableViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysSinceContact = (dateString: string, situacao: string) => {
    // Para leads com "Site Pronto", não contar dias
    if (situacao.toLowerCase().includes('site pronto')) {
      return 0;
    }
    const contactDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - contactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysColor = (days: number, situacao: string) => {
    if (situacao.toLowerCase().includes('site pronto')) {
      return "text-purple-600";
    }
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao.toLowerCase()) {
      case 'em contato':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'aguardando':
        return "bg-orange-100 text-orange-800 border-orange-200";
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
    <div className="w-full">
      <div className="rounded-md border overflow-x-auto">
        <div className="pr-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Empresa</TableHead>
                <TableHead className="min-w-[150px]">Cliente</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Projeto</TableHead>
                <TableHead className="min-w-[120px] hidden lg:table-cell">Vendedor</TableHead>
                <TableHead className="min-w-[120px]">Situação</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Último Contato</TableHead>
                <TableHead className="min-w-[60px] hidden md:table-cell">Dias</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Observações</TableHead>
                <TableHead className="w-[180px] min-w-[180px] max-w-[180px] hidden md:table-cell sticky right-[112px] bg-background z-10">Formulário</TableHead>
                <TableHead className="w-[112px] min-w-[112px] max-w-[112px] sticky right-0 bg-background z-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const daysSinceContact = calculateDaysSinceContact(lead.data_ultimo_contato, lead.situacao);
              
              return (
                 <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{lead.empresa || '-'}</TableCell>
                  <TableCell>{lead.nome_cliente || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <ProjectLinkIndicator lead={lead} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{lead.vendedor || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getSituacaoColor(lead.situacao)} text-xs whitespace-nowrap`}
                    >
                      {lead.situacao}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(lead.data_ultimo_contato)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`font-medium ${getDaysColor(daysSinceContact, lead.situacao)}`}>
                      {lead.situacao.toLowerCase().includes('site pronto') ? '—' : `${daysSinceContact}d`}
                    </span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px]">
                      {lead.observacoes ? (
                        <span 
                          className="text-sm text-gray-600 truncate block" 
                          title={lead.observacoes}
                        >
                          {lead.observacoes.length > 50 
                            ? `${lead.observacoes.substring(0, 50)}...` 
                            : lead.observacoes
                          }
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px] min-w-[180px] max-w-[180px] hidden md:table-cell sticky right-[112px] bg-background z-10">
                    <LeadFormUrlGenerator lead={lead} compact />
                  </TableCell>
                  <TableCell className="w-[112px] min-w-[112px] max-w-[112px] sticky right-0 bg-background z-20">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(lead)}
                        className="text-xs px-2 py-1"
                      >
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">E</span>
                      </Button>
                      {lead.link_chat && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="px-2 py-1"
                        >
                          <a
                            href={lead.link_chat}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir chat"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" title="Excluir lead" className="px-2 py-1">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso irá remover o lead "{lead.empresa}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(lead)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}

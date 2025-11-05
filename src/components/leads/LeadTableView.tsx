
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, ExternalLink, Trash } from "lucide-react";
import { Lead } from "@/types/lead";
import { ProjectLinkIndicator } from "./ProjectLinkIndicator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LeadFormUrlGenerator } from "./LeadFormUrlGenerator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      year: '2-digit'
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
    <TooltipProvider>
      <div className="w-full">
        <div className="overflow-x-auto border rounded-lg">
          <div>
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px] min-w-[140px] max-w-[140px]">Empresa</TableHead>
                  <TableHead className="w-[120px] min-w-[120px] max-w-[120px]">Cliente</TableHead>
                  <TableHead className="w-[70px] min-w-[70px] max-w-[70px]">Projeto</TableHead>
                  <TableHead className="w-[100px] min-w-[100px] max-w-[100px]">Vendedor</TableHead>
                  <TableHead className="w-[130px] min-w-[130px] max-w-[130px]">Situação</TableHead>
                  <TableHead className="w-[110px] min-w-[110px] max-w-[110px]">Último Contato</TableHead>
                  <TableHead className="w-[50px] min-w-[50px] max-w-[50px]">Dias</TableHead>
                  <TableHead className="w-[180px] min-w-[180px] max-w-[180px]">Observações</TableHead>
                  <TableHead className="w-[140px] min-w-[140px] max-w-[140px] sticky right-[120px] bg-background z-10">Formulário</TableHead>
                  <TableHead className="w-[120px] min-w-[120px] max-w-[120px] sticky right-0 bg-background z-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const daysSinceContact = calculateDaysSinceContact(lead.data_ultimo_contato, lead.situacao);
                  
                  return (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium w-[140px] min-w-[140px] max-w-[140px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block cursor-help">{lead.empresa}</span>
                          </TooltipTrigger>
                          <TooltipContent>{lead.empresa}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px] max-w-[120px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block cursor-help">{lead.nome_cliente}</span>
                          </TooltipTrigger>
                          <TooltipContent>{lead.nome_cliente}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="w-[70px] min-w-[70px] max-w-[70px]">
                        {lead.project_id ? (
                          <ProjectLinkIndicator lead={lead} />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="w-[100px] min-w-[100px] max-w-[100px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block cursor-help">{lead.vendedor || '—'}</span>
                          </TooltipTrigger>
                          <TooltipContent>{lead.vendedor || 'Não definido'}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="w-[130px] min-w-[130px] max-w-[130px]">
                        <Badge 
                          variant="outline" 
                          className={`${getSituacaoColor(lead.situacao)} text-xs whitespace-nowrap`}
                        >
                          {lead.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[110px] min-w-[110px] max-w-[110px]">
                        <div className="text-sm whitespace-nowrap">
                          {formatDate(lead.data_ultimo_contato)}
                        </div>
                      </TableCell>
                      <TableCell className="w-[50px] min-w-[50px] max-w-[50px] text-center">
                        <span className={`font-medium ${getDaysColor(daysSinceContact, lead.situacao)}`}>
                          {lead.situacao.toLowerCase().includes('site pronto') ? '—' : daysSinceContact}
                        </span>
                      </TableCell>
                      <TableCell className="w-[180px] min-w-[180px] max-w-[180px]">
                        {lead.observacoes ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-muted-foreground truncate block cursor-help">
                                {lead.observacoes}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="whitespace-normal">{lead.observacoes}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="w-[140px] min-w-[140px] max-w-[140px] sticky right-[120px] bg-background z-10">
                        <LeadFormUrlGenerator lead={lead} compact />
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px] max-w-[120px] sticky right-0 bg-background z-20">
                        <div className="flex items-center gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(lead)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          {lead.link_chat && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0"
                                >
                                  <a
                                    href={lead.link_chat}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Abrir chat</TooltipContent>
                            </Tooltip>
                          )}
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Excluir</TooltipContent>
                            </Tooltip>
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
    </TooltipProvider>
  );
}

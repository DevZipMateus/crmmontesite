import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, ExternalLink, Eye, Link as LinkIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ProjectWithTermStatus } from "@/types/deliveryTerm";
import { updateProjectTermHash } from "@/services/deliveryTermService";

interface TermosTableProps {
  projects: ProjectWithTermStatus[];
  onRefresh: () => void;
  onViewDetails: (project: ProjectWithTermStatus) => void;
}

const TermosTable: React.FC<TermosTableProps> = ({ projects, onRefresh, onViewDetails }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "filled">("all");
  const [generatingHash, setGeneratingHash] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (project.domain?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    const hasTerm = !!project.delivery_term;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "filled" && hasTerm) || 
      (statusFilter === "pending" && !hasTerm);
    
    return matchesSearch && matchesStatus;
  });

  const handleGenerateLink = async (projectId: string) => {
    setGeneratingHash(projectId);
    try {
      const hash = await updateProjectTermHash(projectId);
      const link = `${window.location.origin}/termo-entrega/${hash}`;
      await navigator.clipboard.writeText(link);
      toast.success("Link gerado e copiado para a área de transferência!");
      onRefresh();
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast.error("Erro ao gerar link do termo");
    } finally {
      setGeneratingHash(null);
    }
  };

  const handleCopyLink = async (hash: string) => {
    const link = `${window.location.origin}/termo-entrega/${hash}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou domínio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="filled">Preenchidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Domínio</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Aceite</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.client_name}</TableCell>
                  <TableCell>
                    {project.domain ? (
                      <a 
                        href={`https://${project.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {project.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.delivery_term ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Preenchido
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.delivery_term?.data_aceite ? (
                      format(new Date(project.delivery_term.data_aceite), "dd/MM/yyyy HH:mm", { locale: ptBR })
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {project.delivery_term ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(project)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      ) : project.delivery_term_hash ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(project.delivery_term_hash!)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar Link
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateLink(project.id)}
                          disabled={generatingHash === project.id}
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          {generatingHash === project.id ? "Gerando..." : "Gerar Link"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TermosTable;

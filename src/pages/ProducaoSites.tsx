
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "@/lib/supabase";
import { Loader2, Plus, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Status options for display and dropdown
const statusOptions = [
  { value: "form_sent", label: "Formulário Enviado" },
  { value: "content_organized", label: "Conteúdo Organizado" },
  { value: "in_creation", label: "Em Criação no Lovable" },
  { value: "waiting_domain", label: "Aguardando Domínio" },
  { value: "building", label: "Compilando Projeto (Build)" },
  { value: "published", label: "Publicado" },
  { value: "final_review", label: "Revisão Final" },
];

// Model options for dropdown
const modelOptions = [
  { value: "modelo1", label: "Modelo Básico" },
  { value: "modelo2", label: "Modelo Profissional" },
  { value: "modelo3", label: "Modelo Premium" },
];

export default function ProducaoSites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Form state for new site
  const [newSite, setNewSite] = useState({
    nome: "",
    modelo: "modelo1",
    link_formulario: "",
    status: "form_sent",
  });

  // Fetch sites data
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("site_personalizacoes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSites(data || []);
      } catch (error) {
        console.error("Error fetching sites:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de sites.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [toast]);

  // Handle input change for new site form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSite({ ...newSite, [name]: value });
  };

  // Handle select change for new site form
  const handleSelectChange = (name: string, value: string) => {
    setNewSite({ ...newSite, [name]: value });
  };

  // Update site status
  const updateSiteStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("site_personalizacoes")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setSites(
        sites.map((site) =>
          site.id === id ? { ...site, status: newStatus } : site
        )
      );
      toast({
        title: "Status atualizado",
        description: "O status do site foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do site.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Add new site
  const addNewSite = async () => {
    // Validation
    if (!newSite.nome.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("site_personalizacoes")
        .insert([
          {
            officeNome: newSite.nome,
            modelo: newSite.modelo,
            link_formulario: newSite.link_formulario,
            status: newSite.status,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      // Add new site to the list
      if (data && data.length > 0) {
        setSites([data[0], ...sites]);
      }

      // Reset form and close dialog
      setNewSite({
        nome: "",
        modelo: "modelo1",
        link_formulario: "",
        status: "form_sent",
      });
      setDialogOpen(false);

      toast({
        title: "Site adicionado",
        description: "O novo site foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding site:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o novo site.",
        variant: "destructive",
      });
    }
  };

  // Generate personalization form link
  const getPersonalizationLink = (modelo: string) => {
    return `/personalize-site?modelo=${modelo}`;
  };

  return (
    <div className="container py-6 md:py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Produção de Sites</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Site
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Site</DialogTitle>
                <DialogDescription>
                  Preencha os dados para adicionar um novo site em produção.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Cliente *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={newSite.nome}
                    onChange={handleInputChange}
                    placeholder="Nome do escritório contábil"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modelo">Modelo Escolhido *</Label>
                  <Select
                    value={newSite.modelo}
                    onValueChange={(value) => handleSelectChange("modelo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link_formulario">Link para Formulário</Label>
                  <Input
                    id="link_formulario"
                    name="link_formulario"
                    value={newSite.link_formulario}
                    onChange={handleInputChange}
                    placeholder="Link para preenchimento do formulário (opcional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newSite.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addNewSite}>Adicionar Site</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Nenhum site em produção encontrado. Adicione um novo site para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Cliente</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.officeNome}</TableCell>
                      <TableCell>
                        {modelOptions.find((m) => m.value === site.modelo)?.label || site.modelo}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={site.status || "form_sent"}
                          onValueChange={(value) => updateSiteStatus(site.id, value)}
                          disabled={updatingId === site.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(site.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/site/${site.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getPersonalizationLink(site.modelo), '_blank')}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

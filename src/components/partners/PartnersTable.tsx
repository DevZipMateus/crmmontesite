
import { Partner } from "@/types/webhook";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Globe, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PartnersTableProps {
  partners: Partner[];
  loading: boolean;
  onEdit: (partner: Partner) => void;
  onRefresh: () => void;
}

export function PartnersTable({ partners, loading, onEdit, onRefresh }: PartnersTableProps) {
  const { toast } = useToast();

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Tem certeza que deseja excluir o parceiro "${partner.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partner.id);

      if (error) throw error;

      toast({
        title: "Parceiro excluído",
        description: `${partner.name} foi removido com sucesso.`
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o parceiro.",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ active: !partner.active })
        .eq('id', partner.id);

      if (error) throw error;

      toast({
        title: partner.active ? "Parceiro desativado" : "Parceiro ativado",
        description: `${partner.name} foi ${partner.active ? 'desativado' : 'ativado'} com sucesso.`
      });

      onRefresh();
    } catch (error) {
      console.error('Error toggling partner status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do parceiro.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parceiros Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum parceiro cadastrado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Webhook URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {partner.hash}
                    </code>
                  </TableCell>
                  <TableCell>
                    {partner.webhook_url ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {partner.webhook_url}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={partner.active ? "default" : "secondary"}>
                        {partner.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {partner.auth_token && <Shield className="h-4 w-4 text-blue-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(partner.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(partner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={partner.active ? "secondary" : "default"}
                        onClick={() => toggleActive(partner)}
                      >
                        {partner.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(partner)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

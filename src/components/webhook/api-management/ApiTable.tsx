
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  TestTube,
  ExternalLink,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive';
  lastTested: string;
}

interface ApiTableProps {
  apis: ApiEndpoint[];
  setApis: (apis: ApiEndpoint[]) => void;
  onEdit: (api: ApiEndpoint) => void;
}

export const ApiTable = ({ apis, setApis, onEdit }: ApiTableProps) => {
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setApis(apis.filter(api => api.id !== id));
    toast({
      title: "API removida",
      description: "A API foi removida com sucesso.",
    });
  };

  const handleTest = (api: ApiEndpoint) => {
    toast({
      title: "Teste iniciado",
      description: `Testando conexão com ${api.name}...`,
    });
    
    // Simular teste
    setTimeout(() => {
      setApis(apis.map(a => 
        a.id === api.id 
          ? { ...a, lastTested: new Date().toISOString() }
          : a
      ));
      toast({
        title: "Teste concluído",
        description: `API ${api.name} respondeu com sucesso.`,
      });
    }, 2000);
  };

  const toggleStatus = (id: string) => {
    setApis(apis.map(api => 
      api.id === id 
        ? { ...api, status: api.status === 'active' ? 'inactive' : 'active' }
        : api
    ));
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Teste</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apis.map((api) => (
              <TableRow key={api.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{api.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {api.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{api.method}</Badge>
                    <code className="text-xs bg-muted px-2 py-1 rounded max-w-xs truncate">
                      {api.url}
                    </code>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(api.id)}
                    className="p-0"
                  >
                    {api.status === 'active' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-500" />
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(api.lastTested).toLocaleDateString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(api)}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(api)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(api.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

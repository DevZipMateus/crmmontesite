
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube,
  ExternalLink,
  CheckCircle,
  XCircle,
  Key
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

export const ApiManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);
  
  // Mock data - em produção isso viria do backend
  const [apis, setApis] = useState<ApiEndpoint[]>([
    {
      id: '1',
      name: 'Notificação de Status',
      url: 'https://parceiro.com/webhook/status',
      description: 'Envia atualizações de status dos projetos',
      method: 'POST',
      status: 'active',
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Confirmação de Recebimento',
      url: 'https://parceiro.com/webhook/confirm',
      description: 'Confirma recebimento de novos dados',
      method: 'POST',
      status: 'inactive',
      lastTested: '2024-01-10T14:20:00Z'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    method: 'POST' as 'GET' | 'POST' | 'PUT' | 'DELETE'
  });

  const handleSave = () => {
    if (editingApi) {
      setApis(apis.map(api => 
        api.id === editingApi.id 
          ? { ...api, ...formData, lastTested: new Date().toISOString() }
          : api
      ));
      toast({
        title: "API atualizada",
        description: "As configurações da API foram atualizadas com sucesso.",
      });
    } else {
      const newApi: ApiEndpoint = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        lastTested: new Date().toISOString()
      };
      setApis([...apis, newApi]);
      toast({
        title: "API adicionada",
        description: "Nova API foi adicionada com sucesso.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingApi(null);
    setFormData({ name: '', url: '', description: '', method: 'POST' });
  };

  const handleEdit = (api: ApiEndpoint) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      url: api.url,
      description: api.description,
      method: api.method
    });
    setIsDialogOpen(true);
  };

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
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">APIs Configuradas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie suas integrações e endpoints externos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingApi(null);
                setFormData({ name: '', url: '', description: '', method: 'POST' });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar API
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingApi ? 'Editar API' : 'Adicionar Nova API'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-name">Nome da API</Label>
                <Input
                  id="api-name"
                  placeholder="Ex: Notificação de Status"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-url">URL do Endpoint</Label>
                <Input
                  id="api-url"
                  placeholder="https://exemplo.com/webhook"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-description">Descrição</Label>
                <Textarea
                  id="api-description"
                  placeholder="Descreva o propósito desta API..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingApi ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingApi(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* APIs Table */}
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
                        onClick={() => handleEdit(api)}
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

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Guia de Configuração Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Para Receber Dados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure sua URL de webhook</li>
                <li>• Defina um token de autenticação</li>
                <li>• Teste a conectividade</li>
                <li>• Monitore os logs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Para Enviar Dados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adicione APIs de destino</li>
                <li>• Configure autenticação</li>
                <li>• Teste os endpoints</li>
                <li>• Ative as notificações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function handleSave() {
    if (editingApi) {
      setApis(apis.map(api => 
        api.id === editingApi.id 
          ? { ...api, ...formData, lastTested: new Date().toISOString() }
          : api
      ));
      toast({
        title: "API atualizada",
        description: "As configurações da API foram atualizadas com sucesso.",
      });
    } else {
      const newApi: ApiEndpoint = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        lastTested: new Date().toISOString()
      };
      setApis([...apis, newApi]);
      toast({
        title: "API adicionada",
        description: "Nova API foi adicionada com sucesso.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingApi(null);
    setFormData({ name: '', url: '', description: '', method: 'POST' });
  }

  function handleEdit(api: ApiEndpoint) {
    setEditingApi(api);
    setFormData({
      name: api.name,
      url: api.url,
      description: api.description,
      method: api.method
    });
    setIsDialogOpen(true);
  }

  function handleDelete(id: string) {
    setApis(apis.filter(api => api.id !== id));
    toast({
      title: "API removida",
      description: "A API foi removida com sucesso.",
    });
  }

  function handleTest(api: ApiEndpoint) {
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
  }

  function toggleStatus(id: string) {
    setApis(apis.map(api => 
      api.id === id 
        ? { ...api, status: api.status === 'active' ? 'inactive' : 'active' }
        : api
    ));
  }
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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

interface ApiFormProps {
  apis: ApiEndpoint[];
  setApis: (apis: ApiEndpoint[]) => void;
}

export const ApiForm = ({ apis, setApis }: ApiFormProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);
  
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

  return (
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
  );
};

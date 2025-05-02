import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Edit, Trash, Plus, AlertTriangle } from "lucide-react";
import { 
  ModelTemplate,
  getAllModelTemplates,
  createModelTemplate,
  updateModelTemplate,
  deleteModelTemplate
} from "@/services/modelTemplateService";

interface CustomUrlManagerProps {
  baseUrl: string;
}

const CustomUrlManager: React.FC<CustomUrlManagerProps> = ({ baseUrl }) => {
  const { toast } = useToast();
  
  const [models, setModels] = useState<ModelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  
  // New model form state
  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newModel, setNewModel] = useState<{
    name: string;
    description: string;
    image_url: string;
    custom_url: string;
  }>({
    name: "",
    description: "",
    image_url: "/placeholder.svg",
    custom_url: "",
  });
  
  // Edit model dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditModel, setCurrentEditModel] = useState<ModelTemplate | null>(null);
  
  // Delete confirmation dialog state
  const [modelToDelete, setModelToDelete] = useState<ModelTemplate | null>(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = () => {
    try {
      setAuthChecking(true);
      // Check if user is authenticated using localStorage instead of Supabase
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        setIsAuthenticated(true);
        fetchModels();
        toast({
          title: "Sessão autenticada",
          description: "Você está autenticado como administrador",
        });
      } else {
        setIsAuthenticated(false);
        setError("Você precisa estar autenticado para gerenciar modelos.");
      }
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError("Erro ao verificar estado de autenticação.");
    } finally {
      setAuthChecking(false);
    }
  };
  
  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getAllModelTemplates();
      setModels(data);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.message || "Falha ao carregar os modelos. Por favor, tente novamente.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get full URL for a model
  const getFullUrl = (model: ModelTemplate) => {
    const urlParam = model.custom_url || model.id;
    return `${baseUrl}/formulario/${urlParam}`;
  };
  
  // Copy URL to clipboard
  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência.",
      });
      
      setTimeout(() => setCopied(null), 2000);
    });
  };
  
  // Handle new model form changes
  const handleNewModelChange = (field: string, value: string) => {
    setNewModel({
      ...newModel,
      [field]: value,
    });
  };
  
  // Handle edit model form changes
  const handleEditModelChange = (field: string, value: string) => {
    if (currentEditModel) {
      setCurrentEditModel({
        ...currentEditModel,
        [field]: value,
      });
    }
  };
  
  // Submit new model
  const handleCreateModel = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para criar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!newModel.name || !newModel.description) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha o nome e a descrição do modelo.",
          variant: "destructive",
        });
        return;
      }
      
      await createModelTemplate(newModel);
      toast({
        title: "Modelo criado",
        description: `O modelo "${newModel.name}" foi criado com sucesso.`,
      });
      
      // Reset form and refresh models
      setNewModel({
        name: "",
        description: "",
        image_url: "/placeholder.svg",
        custom_url: "",
      });
      setShowNewModelForm(false);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao criar modelo",
        description: err.message || "Ocorreu um erro ao criar o modelo.",
        variant: "destructive",
      });
    }
  };
  
  // Start editing a model
  const handleEditClick = (model: ModelTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para editar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentEditModel(model);
    setEditDialogOpen(true);
  };
  
  // Save edited model
  const handleSaveEdit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para editar modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEditModel) return;
    
    try {
      await updateModelTemplate(currentEditModel.id, {
        name: currentEditModel.name,
        description: currentEditModel.description,
        image_url: currentEditModel.image_url,
        custom_url: currentEditModel.custom_url
      });
      
      toast({
        title: "Modelo atualizado",
        description: `O modelo "${currentEditModel.name}" foi atualizado com sucesso.`,
      });
      
      setEditDialogOpen(false);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar modelo",
        description: err.message || "Ocorreu um erro ao atualizar o modelo.",
        variant: "destructive",
      });
    }
  };
  
  // Confirm delete model
  const confirmDelete = (model: ModelTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para excluir modelos.",
        variant: "destructive",
      });
      return;
    }
    
    setModelToDelete(model);
  };
  
  // Delete model
  const handleDeleteModel = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação", 
        description: "Você precisa estar autenticado para excluir modelos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!modelToDelete) return;
    
    try {
      await deleteModelTemplate(modelToDelete.id);
      
      toast({
        title: "Modelo excluído",
        description: `O modelo "${modelToDelete.name}" foi excluído com sucesso.`,
      });
      
      setModelToDelete(null);
      fetchModels();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir modelo",
        description: err.message || "Ocorreu um erro ao excluir o modelo.",
        variant: "destructive",
      });
    }
  };
  
  if (authChecking) {
    return <div className="flex justify-center py-8">Verificando autenticação...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Você precisa estar autenticado para gerenciar modelos e URLs personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <p className="text-amber-700">
              Por favor, faça login como administrador para acessar esta funcionalidade.
            </p>
          </div>
          <div className="mt-4">
            <Button onClick={() => window.location.href = "/login"}>
              Ir para página de login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (loading) {
    return <div className="flex justify-center py-8">Carregando modelos...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="font-medium">Erro</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchModels} 
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Modelos Disponíveis</CardTitle>
              <CardDescription>
                Gerencie seus modelos e URLs personalizadas
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewModelForm(!showNewModelForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showNewModelForm ? "Cancelar" : "Novo Modelo"}
            </Button>
          </div>
        </CardHeader>
        
        {showNewModelForm && (
          <CardContent className="border-t pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-model-name">Nome do Modelo *</Label>
                  <Input
                    id="new-model-name"
                    placeholder="Ex: Modelo Contábil Premium"
                    value={newModel.name}
                    onChange={(e) => handleNewModelChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-model-url">URL Personalizada</Label>
                  <Input
                    id="new-model-url"
                    placeholder="Ex: contabil-premium"
                    value={newModel.custom_url}
                    onChange={(e) => handleNewModelChange("custom_url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar o ID automático
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-model-description">Descrição *</Label>
                <Textarea
                  id="new-model-description"
                  placeholder="Descreva as características do modelo"
                  value={newModel.description}
                  onChange={(e) => handleNewModelChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-model-image">URL da Imagem</Label>
                <Input
                  id="new-model-image"
                  placeholder="URL da imagem do modelo"
                  value={newModel.image_url}
                  onChange={(e) => handleNewModelChange("image_url", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe o valor padrão para usar a imagem placeholder
                </p>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button onClick={handleCreateModel}>
                  Criar Modelo
                </Button>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardContent className={showNewModelForm ? "" : "pt-0"}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>URL Personalizada</TableHead>
                <TableHead>Link Completo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{model.description}</TableCell>
                  <TableCell>{model.custom_url || <span className="text-gray-400 italic">Nenhuma</span>}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2 truncate max-w-[180px]">
                        {getFullUrl(model)}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(model.id, getFullUrl(model))}
                      >
                        {copied === model.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(model)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir modelo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o modelo "{model.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => confirmDelete(model)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              
              {models.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum modelo encontrado. Crie um novo modelo para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Como usar URLs personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              As URLs personalizadas permitem criar links mais amigáveis e memoráveis para seus formulários.
            </li>
            <li>
              Por exemplo, em vez de usar "/formulario/modelo1", você pode usar "/formulario/contabil".
            </li>
            <li>
              A URL personalizada deve ser única para cada modelo.
            </li>
            <li>
              Se uma URL personalizada não for definida, o sistema usará automaticamente o ID do modelo.
            </li>
            <li>
              Você pode editar a URL personalizada a qualquer momento, mas os links antigos deixarão de funcionar.
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Edit Model Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Modelo</DialogTitle>
            <DialogDescription>
              Atualize as informações do modelo e a URL personalizada
            </DialogDescription>
          </DialogHeader>
          
          {currentEditModel && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Modelo</Label>
                <Input
                  id="edit-name"
                  value={currentEditModel.name}
                  onChange={(e) => handleEditModelChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-url">URL Personalizada</Label>
                <Input
                  id="edit-url"
                  value={currentEditModel.custom_url || ""}
                  onChange={(e) => handleEditModelChange("custom_url", e.target.value)}
                  placeholder="URL personalizada (opcional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={currentEditModel.description}
                  onChange={(e) => handleEditModelChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-image">URL da Imagem</Label>
                <Input
                  id="edit-image"
                  value={currentEditModel.image_url}
                  onChange={(e) => handleEditModelChange("image_url", e.target.value)}
                  placeholder="/placeholder.svg"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      {modelToDelete && (
        <AlertDialog open={!!modelToDelete} onOpenChange={() => setModelToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o modelo "{modelToDelete.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setModelToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteModel}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default CustomUrlManager;

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClientSubmissionService } from "@/services/clientSubmissionService";
import { Upload, X, DollarSign, Image as ImageIcon, Video, Plus, Folder, FolderOpen, FolderPlus, AlertCircle } from "lucide-react";
import { ImageCategory } from "@/types/clientSubmission";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({});

interface ClientSubmissionFormProps {
  projectId: string;
  projectName: string;
  onSubmissionComplete: () => void;
}

export function ClientSubmissionForm({ projectId, projectName, onSubmissionComplete }: ClientSubmissionFormProps) {
  const [categories, setCategories] = useState<ImageCategory[]>([
    { id: '1', name: 'Geral', images: [] }
  ]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('1');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverCategory, setIsDragOverCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['image/', 'video/'];
    const validFiles = files.filter(file => 
      allowedTypes.some(type => file.type.startsWith(type)) || 
      file.name.toLowerCase().endsWith('.gif')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Aviso",
        description: "Apenas imagens (JPG, PNG, GIF) e vídeos (MP4) são permitidos.",
        variant: "destructive",
      });
    }

    const newImages = validFiles.map(file => ({
      file,
      name: file.name.split('.')[0],
      description: undefined,
      price: undefined,
    }));

    addImagesToCategory(selectedCategoryId, newImages);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const targetCategoryId = isDragOverCategory || selectedCategoryId;
    setIsDragOverCategory(null);

    const files = Array.from(event.dataTransfer.files);
    const allowedTypes = ['image/', 'video/'];
    const validFiles = files.filter(file => 
      allowedTypes.some(type => file.type.startsWith(type)) || 
      file.name.toLowerCase().endsWith('.gif')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Aviso",
        description: "Apenas imagens (JPG, PNG, GIF) e vídeos (MP4) são permitidos.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({
        file,
        name: file.name.split('.')[0],
        description: undefined,
        price: undefined,
      }));

      addImagesToCategory(targetCategoryId, newImages);
    }
  };

  // Category management functions
  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: ImageCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        images: []
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast({
        title: "Categoria criada",
        description: `Pasta "${newCategory.name}" criada com sucesso.`,
      });
    }
  };

  const addImagesToCategory = (categoryId: string, images: Array<{ file: File; name: string; description?: string; price?: number }>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, images: [...cat.images, ...images] }
        : cat
    ));
  };

  const removeImage = (categoryId: string, imageIndex: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId
        ? { ...cat, images: cat.images.filter((_, i) => i !== imageIndex) }
        : cat
    ));
  };

  const updateImageName = (categoryId: string, imageIndex: number, name: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId
        ? { ...cat, images: cat.images.map((img, i) => i === imageIndex ? { ...img, name } : img) }
        : cat
    ));
  };

  const updateImageDescription = (categoryId: string, imageIndex: number, description: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId
        ? { ...cat, images: cat.images.map((img, i) => i === imageIndex ? { ...img, description } : img) }
        : cat
    ));
  };

  const updateImagePrice = (categoryId: string, imageIndex: number, price: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId
        ? { ...cat, images: cat.images.map((img, i) => i === imageIndex ? { ...img, price } : img) }
        : cat
    ));
  };

  const getTotalImages = () => {
    return categories.reduce((total, cat) => total + cat.images.length, 0);
  };

  const onSubmit = async () => {
    const totalImages = getTotalImages();
    
    if (totalImages === 0) {
      toast({
        title: "Aviso",
        description: "Adicione pelo menos uma mídia para enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Flatten all images with their categories
      const allImages = categories.flatMap(category => 
        category.images.map(image => ({
          ...image,
          category: category.name
        }))
      );

      await ClientSubmissionService.submitClientMedia(projectId, {
        images: allImages
      });
      
      toast({
        title: "Sucesso",
        description: "Mídias enviadas com sucesso!",
      });
      
      onSubmissionComplete();
    } catch (error) {
      console.error('Error submitting media:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mídias. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Enviar Mídias - {projectName}</CardTitle>
        <CardDescription>
          Organize suas imagens e vídeos em pastas por categoria para facilitar o desenvolvimento do seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 font-medium">
            As imagens enviadas serão utilizadas no seu site
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Organizar por Pastas</FormLabel>
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Nova Pasta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Pasta</DialogTitle>
                      <DialogDescription>
                        Crie uma nova pasta para organizar suas mídias por categoria.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Nome da pasta (ex: Produtos, Serviços, Eventos...)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={addCategory} disabled={!newCategoryName.trim()}>
                          Criar Pasta
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategoryName('');
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Categories Tabs */}
              <div className="flex flex-wrap gap-2 border-b">
                {categories.map((category) => {
                  const isActive = selectedCategoryId === category.id;
                  const hasImages = category.images.length > 0;
                  
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverCategory(category.id);
                      }}
                      onDragLeave={() => setIsDragOverCategory(null)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-colors ${
                        isActive 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : isDragOverCategory === category.id
                          ? 'border-primary/50 bg-primary/2 text-primary/70'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      {isActive ? (
                        <FolderOpen className="h-4 w-4" />
                      ) : (
                        <Folder className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{category.name}</span>
                      {hasImages && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {category.images.length}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <FormLabel>
                Adicionar Mídias à pasta "{categories.find(c => c.id === selectedCategoryId)?.name}"
              </FormLabel>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className={`h-10 w-10 mb-2 ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm ${
                    isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {isDragOver ? 'Solte os arquivos aqui' : 'Clique para selecionar mídias ou arraste aqui'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PNG, JPG, JPEG, GIF, MP4
                  </p>
                </label>
              </div>
            </div>

            {/* Preview das imagens por categoria */}
            {categories.some(cat => cat.images.length > 0) && (
              <div className="space-y-6">
                {categories.filter(cat => cat.images.length > 0).map((category) => (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" />
                      <FormLabel>{category.name} ({category.images.length})</FormLabel>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      {category.images.map((image, imageIndex) => {
                        const isVideo = image.file.type.startsWith('video/');
                        const isGif = image.file.name.toLowerCase().endsWith('.gif');
                        
                        return (
                          <div key={imageIndex} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isVideo ? (
                                  <Video className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-green-500" />
                                )}
                                <span className="text-sm font-medium">
                                  {isVideo ? 'Vídeo' : isGif ? 'GIF' : 'Imagem'} {imageIndex + 1}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(category.id, imageIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {isVideo ? (
                                <video
                                  src={URL.createObjectURL(image.file)}
                                  className="max-w-full max-h-full"
                                  controls
                                />
                              ) : (
                                <img
                                  src={URL.createObjectURL(image.file)}
                                  alt="Preview"
                                  className="max-w-full max-h-full object-contain"
                                />
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Nome do Produto *</label>
                                <Input
                                  value={image.name}
                                  onChange={(e) => updateImageName(category.id, imageIndex, e.target.value)}
                                  placeholder="Nome do produto ou item"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Descrição (opcional)</label>
                                <Textarea
                                  value={image.description || ''}
                                  onChange={(e) => updateImageDescription(category.id, imageIndex, e.target.value)}
                                  placeholder="Descrição detalhada do produto..."
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  Preço (opcional)
                                </label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={image.price || ''}
                                  onChange={(e) => updateImagePrice(category.id, imageIndex, parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || getTotalImages() === 0}
              className="w-full"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                `Enviar ${getTotalImages()} mídia${getTotalImages() !== 1 ? 's' : ''} para ${projectName}`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
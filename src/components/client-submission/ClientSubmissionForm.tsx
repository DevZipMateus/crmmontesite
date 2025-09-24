import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClientSubmissionService } from "@/services/clientSubmissionService";
import { ClientSubmissionFormData } from "@/types/clientSubmission";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({});

interface ClientSubmissionFormProps {
  projectId: string;
  projectName: string;
  onSubmissionComplete: () => void;
}

export function ClientSubmissionForm({ 
  projectId, 
  projectName, 
  onSubmissionComplete 
}: ClientSubmissionFormProps) {
  const [selectedImages, setSelectedImages] = useState<Array<{
    file: File;
    name: string;
    description?: string;
    price?: number;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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
      name: file.name.split('.')[0], // Remove extension for default name
      description: undefined,
      price: undefined,
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
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

      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageName = (index: number, name: string) => {
    setSelectedImages(prev => prev.map((img, i) => 
      i === index ? { ...img, name } : img
    ));
  };

  const updateImageDescription = (index: number, description: string) => {
    setSelectedImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description } : img
    ));
  };

  const updateImagePrice = (index: number, price: number | undefined) => {
    setSelectedImages(prev => prev.map((img, i) => 
      i === index ? { ...img, price } : img
    ));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedImages.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo para enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: ClientSubmissionFormData = {
        images: selectedImages,
      };

      await ClientSubmissionService.submitClientMedia(projectId, formData);

      toast({
        title: "Sucesso!",
        description: "Seus arquivos foram enviados com sucesso.",
      });

      onSubmissionComplete();
    } catch (error) {
      console.error('Error submitting media:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enviar Mídias - {projectName}</CardTitle>
        <CardDescription>
          Envie suas imagens e vídeos para que nossa equipe possa trabalhar no seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 font-medium">
                As imagens enviadas serão utilizadas no seu site
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <FormLabel>Mídias *</FormLabel>
              
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

              {selectedImages.length > 0 && (
                <div className="space-y-4">
                  {selectedImages.map((imageData, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {imageData.file.type.startsWith('video/') ? (
                            <video
                              src={URL.createObjectURL(imageData.file)}
                              className="w-full h-full object-cover"
                              controls={false}
                              muted
                            />
                          ) : (
                            <img
                              src={URL.createObjectURL(imageData.file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-sm font-medium">Nome do Produto *</label>
                            <Input
                              value={imageData.name}
                              onChange={(e) => updateImageName(index, e.target.value)}
                              placeholder="Nome do produto/imagem"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Descrição (opcional)</label>
                            <Textarea
                              value={imageData.description || ""}
                              onChange={(e) => updateImageDescription(index, e.target.value)}
                              placeholder="Descrição detalhada do produto..."
                              className="mt-1 min-h-[80px]"
                              maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {(imageData.description || "").length}/500 caracteres
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Preço (opcional)</label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={imageData.price || ""}
                                onChange={(e) => updateImagePrice(index, e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="0.00"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="text-sm text-muted-foreground">
                                {imageData.price && `R$ ${imageData.price.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Arquivo: {imageData.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Enviando..." : `Enviar ${selectedImages.length} arquivo(s)`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
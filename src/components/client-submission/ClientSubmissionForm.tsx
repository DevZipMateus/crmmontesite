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
import { Upload, X, Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  message: z.string().optional(),
});

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
    price?: number;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Aviso",
        description: "Apenas arquivos de imagem são permitidos.",
        variant: "destructive",
      });
    }

    const newImages = imageFiles.map(file => ({
      file,
      name: file.name.split('.')[0], // Remove extension for default name
      price: undefined,
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageName = (index: number, name: string) => {
    setSelectedImages(prev => prev.map((img, i) => 
      i === index ? { ...img, name } : img
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
        description: "Selecione pelo menos uma imagem para enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: ClientSubmissionFormData = {
        message: values.message || undefined,
        images: selectedImages,
      };

      await ClientSubmissionService.submitClientMedia(projectId, formData);

      toast({
        title: "Sucesso!",
        description: "Suas imagens foram enviadas com sucesso.",
      });

      onSubmissionComplete();
    } catch (error) {
      console.error('Error submitting images:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enviar Imagens - {projectName}</CardTitle>
        <CardDescription>
          Envie suas imagens para que nossa equipe possa trabalhar no seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva as imagens ou deixe observações..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Imagens *</FormLabel>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar imagens ou arraste aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PNG, JPG, JPEG
                  </p>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-4">
                  {selectedImages.map((imageData, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={URL.createObjectURL(imageData.file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-sm font-medium">Nome da imagem *</label>
                            <Input
                              value={imageData.name}
                              onChange={(e) => updateImageName(index, e.target.value)}
                              placeholder="Nome do produto/imagem"
                              className="mt-1"
                            />
                          </div>
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
              {isSubmitting ? "Enviando..." : `Enviar ${selectedImages.length} imagem(ns)`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
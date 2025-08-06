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
  client_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  client_email: z.string().email("Email inválido").optional().or(z.literal("")),
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      client_email: "",
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

    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
        client_name: values.client_name,
        client_email: values.client_email || undefined,
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
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
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
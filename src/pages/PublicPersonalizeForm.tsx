
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getModelTemplateByCustomUrl } from "@/services/modelTemplateService";
import { findModeloByCustomUrl, modelosDisponiveis } from "@/components/site-personalize/modelosData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  telefone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 caracteres.",
  }),
  termos: z.boolean().refine((value) => value === true, {
    message: "Você deve aceitar os termos e condições.",
  }),
  mensagem: z.string().optional(),
});

export default function PublicPersonalizeForm() {
  const { modelo } = useParams<{ modelo: string }>();
  const [modeloId, setModeloId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      if (!modelo) return;
      
      try {
        // First try to find the model in the database by custom URL
        const dbModel = await getModelTemplateByCustomUrl(modelo);
        
        if (dbModel) {
          setModeloId(dbModel.id);
          setLoading(false);
          return;
        }
        
        // If not found in DB, fallback to the static data (for backward compatibility)
        const staticModelId = findModeloByCustomUrl(modelo);
        
        if (staticModelId) {
          setModeloId(staticModelId);
        } else {
          // If still not found, check if the parameter itself is a valid model ID
          const modelExists = modelosDisponiveis.some(m => m.id === modelo);
          if (modelExists) {
            setModeloId(modelo);
          } else {
            setError(`Modelo não encontrado: ${modelo}`);
          }
        }
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Erro ao carregar modelo. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [modelo]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      termos: false,
      mensagem: "",
    },
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast({
      title: "Sucesso!",
      description: "Seus dados foram enviados com sucesso.",
    });
    navigate("/confirmacao");
  }

  if (loading) {
    return <div className="text-center mt-8">Carregando formulário...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Erro: {error}</div>;
  }

  if (!modeloId) {
    return (
      <div className="text-center mt-8">
        Modelo não encontrado ou inválido.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Formulário de Personalização</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para personalizar seu site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seuemail@exemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mensagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite sua mensagem aqui..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Aceitar Termos e Condições</FormLabel>
                      <FormDescription>
                        Eu concordo com os termos e condições.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Powered by MonteSite CRM
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

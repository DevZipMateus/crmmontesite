
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const customizationSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  notes: z.string().optional(),
});

interface CustomizationFormProps {
  projectId: string;
  onSuccess: () => void;
}

export function CustomizationForm({ projectId, onSuccess }: CustomizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof customizationSchema>>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      description: "",
      priority: "Média",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof customizationSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_customizations')
        .insert({
          project_id: projectId,
          description: values.description,
          priority: values.priority,
          notes: values.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Customização registrada",
        description: "A solicitação de customização foi registrada com sucesso.",
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating customization:', error);
      toast({
        title: "Erro ao registrar customização",
        description: "Não foi possível registrar a customização. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a customização solicitada..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione observações relevantes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar Customização"}
        </Button>
      </form>
    </Form>
  );
}

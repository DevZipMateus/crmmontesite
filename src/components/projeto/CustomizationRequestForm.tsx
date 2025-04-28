
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomizationPriority, CustomizationStatus } from "@/types/customization";
import { addCustomization } from "@/services/customizationService";

const customizationFormSchema = z.object({
  description: z.string().min(5, "A descrição é obrigatória e deve ter pelo menos 5 caracteres"),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"] as const),
  notes: z.string().optional(),
});

type CustomizationFormValues = z.infer<typeof customizationFormSchema>;

interface CustomizationRequestFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function CustomizationRequestForm({ projectId, onSuccess }: CustomizationRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomizationFormValues>({
    resolver: zodResolver(customizationFormSchema),
    defaultValues: {
      description: "",
      priority: "Média",
      notes: "",
    },
  });

  const onSubmit = async (values: CustomizationFormValues) => {
    setIsSubmitting(true);
    try {
      const customizationData = {
        project_id: projectId,
        description: values.description,
        priority: values.priority as CustomizationPriority,
        status: "Solicitado" as CustomizationStatus,
        requested_at: new Date().toISOString(),
        notes: values.notes || null,
      };

      const { success } = await addCustomization(customizationData);

      if (success) {
        form.reset();
        if (onSuccess) onSuccess();
      }
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
              <FormLabel>Descrição da personalização</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva a personalização desejada..." {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormDescription>
                Escolha a prioridade para esta personalização
              </FormDescription>
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
                <Textarea placeholder="Observações adicionais..." {...field} />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre a personalização
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Solicitar Personalização"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

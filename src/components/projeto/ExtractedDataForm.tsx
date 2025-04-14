
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface ExtractedDataFormProps {
  form: UseFormReturn<any>;
  showManualInput: boolean;
  setShowManualInput: (show: boolean) => void;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const ExtractedDataForm: React.FC<ExtractedDataFormProps> = ({
  form,
  showManualInput,
  setShowManualInput,
  onSubmit,
  onCancel,
}) => {
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do cliente</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo escolhido</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsible_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowManualInput(!showManualInput)}
            type="button"
          >
            {showManualInput ? "Esconder campos manuais" : "Preencher manualmente"}
          </Button>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Voltar para Projetos
          </Button>
          
          <Button type="submit">
            Criar Projeto
          </Button>
        </div>
      </form>
    </Form>
  );
};


import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/validation";

interface SiteDetailsSectionProps {
  form: UseFormReturn<z.infer<typeof projectSchema>>;
}

export const SiteDetailsSection = ({ form }: SiteDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-medium text-gray-700 border-b pb-2">Detalhes do Site</h3>
      
      <FormField
        control={form.control}
        name="template"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Modelo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="rounded-md shadow-sm border-gray-200">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Modelo 1">Modelo 1</SelectItem>
                <SelectItem value="Modelo 2">Modelo 2</SelectItem>
                <SelectItem value="Modelo 3">Modelo 3</SelectItem>
                <SelectItem value="Modelo 4">Modelo 4</SelectItem>
                <SelectItem value="Modelo 5">Modelo 5</SelectItem>
                <SelectItem value="Modelo 6">Modelo 6</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="rounded-md shadow-sm border-gray-200">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Criando site">Criando site</SelectItem>
                <SelectItem value="Configurando Domínio">Configurando Domínio</SelectItem>
                <SelectItem value="Aguardando DNS">Aguardando DNS</SelectItem>
                <SelectItem value="Site pronto">Site pronto</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="domain"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Domínio</FormLabel>
            <FormControl>
              <Input 
                placeholder="exemplo.com.br" 
                {...field} 
                value={field.value || ""} 
                className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="blaster_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Link do Blaster</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://..." 
                {...field} 
                value={field.value || ""} 
                className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

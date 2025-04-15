
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/validation";

interface ProjectInfoFormProps {
  form: UseFormReturn<z.infer<typeof projectSchema>>;
}

export const ProjectInfoForm = ({ form }: ProjectInfoFormProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="client_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Cliente</FormLabel>
            <FormControl>
              <Input placeholder="Nome do cliente" {...field} />
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
              <Input placeholder="Nome do responsável" {...field} />
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
            <FormLabel>Modelo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
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
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
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
        name="client_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Cliente</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de cliente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="parceiro">Parceiro</SelectItem>
                <SelectItem value="cliente_final">Cliente Final</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

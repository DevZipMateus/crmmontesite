
import React, { useEffect, useState } from "react";
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
  const [isPartner, setIsPartner] = useState(false);
  
  // Check if client_type is "parceiro" when form values change
  useEffect(() => {
    const clientType = form.watch("client_type");
    setIsPartner(clientType === "parceiro");
  }, [form.watch("client_type"), form]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-md font-medium text-gray-700 border-b pb-2">Informações do Cliente</h3>
          
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Nome do Cliente</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do cliente" 
                    {...field} 
                    className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary"
                  />
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
                <FormLabel className="text-gray-700">Responsável</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do responsável" 
                    {...field} 
                    className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="client_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Tipo de Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="rounded-md shadow-sm border-gray-200">
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
          
          {/* Display the partner link field only when client type is "parceiro" */}
          {isPartner && (
            <FormField
              control={form.control}
              name="partner_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Link do Parceiro</FormLabel>
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
          )}
        </div>
        
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
      </div>
    </div>
  );
};

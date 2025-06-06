
import React, { useEffect, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/validation";

interface ClientInfoSectionProps {
  form: UseFormReturn<z.infer<typeof projectSchema>>;
}

export const ClientInfoSection = ({ form }: ClientInfoSectionProps) => {
  const [isPartner, setIsPartner] = useState<boolean>(form.getValues().client_type === 'parceiro');
  
  // Update isPartner state when client_type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'client_type') {
        setIsPartner(value.client_type === 'parceiro');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  return (
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
        name="client_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Tipo de Cliente</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                setIsPartner(value === 'parceiro');
                console.log("Client type select changed to:", value);
              }} 
              value={field.value || ""}
            >
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
      
      {isPartner && (
        <FormField
          control={form.control}
          name="partner_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Link do Parceiro</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://site-do-parceiro.com.br" 
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
  );
};

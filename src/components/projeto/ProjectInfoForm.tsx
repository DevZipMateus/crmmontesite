
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface ProjectInfoFormProps {
  form: UseFormReturn<any>;
}

export const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domínio</FormLabel>
              <FormControl>
                <Input placeholder="Ex: cliente.com.br" {...field} />
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
              <FormLabel>Tipo de cliente</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
      
      <FormField
        control={form.control}
        name="provider_credentials"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Credenciais do provedor</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Login: exemplo@mail.com, Senha: 123456" 
                {...field} 
              />
            </FormControl>
            <p className="text-xs text-muted-foreground mt-1">
              Informe as credenciais de acesso ao provedor/hospedagem do cliente.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="blaster_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link no Blaster</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: https://blaster.com.br/cliente123" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

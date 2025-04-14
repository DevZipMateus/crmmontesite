
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface ProjectInfoFormProps {
  form?: UseFormReturn<any>;
  standalone?: boolean;
}

export const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ form, standalone = false }) => {
  // If standalone mode is enabled or form isn't provided, render without form context
  if (standalone || !form) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domínio</Label>
            <Input id="domain" placeholder="Ex: cliente.com.br" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client_type">Tipo de cliente</Label>
            <Select>
              <SelectTrigger id="client_type">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parceiro">Parceiro</SelectItem>
                <SelectItem value="cliente_final">Cliente Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="provider_credentials">Credenciais do provedor</Label>
          <Textarea 
            id="provider_credentials"
            placeholder="Login: exemplo@mail.com, Senha: 123456" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Informe as credenciais de acesso ao provedor/hospedagem do cliente.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="blaster_link">Link no Blaster</Label>
          <Input 
            id="blaster_link"
            placeholder="Ex: https://blaster.com.br/cliente123" 
          />
        </div>
      </div>
    );
  }

  // We made it here, so we know we have a form object and should use the form-connected components
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

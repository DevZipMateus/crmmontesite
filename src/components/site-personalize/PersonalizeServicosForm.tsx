
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./PersonalizeBasicForm";
import MediaUploader from "./MediaUploader";

interface PersonalizeServicosFormProps {
  form: UseFormReturn<FormValues>;
  depoimentoPreviews: string[];
  handleDepoimentoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDepoimento: (index: number) => void;
}

export const PersonalizeServicosForm: React.FC<PersonalizeServicosFormProps> = ({
  form,
  depoimentoPreviews,
  handleDepoimentoUpload,
  handleRemoveDepoimento,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">Produtos, Serviços e Planos</h3>
      
      <FormField
        control={form.control}
        name="possuiPlanos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Possui planos de negócios?</FormLabel>
          </FormItem>
        )}
      />

      {form.watch("possuiPlanos") && (
        <FormField
          control={form.control}
          name="planos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Planos Oferecidos</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os planos oferecidos (nome, valor, serviços incluídos)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="servicos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Produtos, Serviços e Planos*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Produtos com os quais você trabalha, serviços que presta (ex: prestação de serviço) e planos oferecidos (ex: combo de serviços por tanto)"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Avaliações</h3>
        
        <FormField
          control={form.control}
          name="depoimentos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avaliações de Clientes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Inclua avaliações de clientes no formato: Nome, empresa: Avaliação. Podem ser tanto escritas como imagens"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <MediaUploader 
          label="Imagens de Avaliações"
          description="Adicione imagens de avaliações dos clientes. Múltiplas imagens permitidas."
          accept="image/*"
          multiple={true}
          previews={depoimentoPreviews}
          onUpload={handleDepoimentoUpload}
          onRemove={handleRemoveDepoimento}
        />
      </div>
    </div>
  );
};

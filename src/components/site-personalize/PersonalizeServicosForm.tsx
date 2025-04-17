
import React from "react";
import {
  FormControl,
  FormDescription,
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

const PersonalizeServicosForm: React.FC<PersonalizeServicosFormProps> = ({
  form,
  depoimentoPreviews,
  handleDepoimentoUpload,
  handleRemoveDepoimento,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">Serviços e Planos</h3>
      
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
              <FormLabel>Planos de Negócios</FormLabel>
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
            <FormLabel>Serviços a Destacar*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Liste os principais serviços oferecidos"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Depoimentos</h3>
        
        <FormField
          control={form.control}
          name="depoimentos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depoimentos de Clientes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Inclua depoimentos de clientes no formato: Nome, empresa: Depoimento"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormLabel className="flex items-center gap-2 mt-4">
          Imagens para Depoimentos
        </FormLabel>
        
        <MediaUploader 
          label="Imagens para Depoimentos"
          description="Adicione imagens relacionadas aos depoimentos. Múltiplas imagens permitidas."
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

export default PersonalizeServicosForm;

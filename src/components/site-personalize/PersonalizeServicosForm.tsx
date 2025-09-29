
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
      
      {/* Possui Serviços */}
      <FormField
        control={form.control}
        name="possuiServicos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Serviços Oferecidos?</FormLabel>
          </FormItem>
        )}
      />

      {/* Campo condicional Serviços Oferecidos */}
      {form.watch("possuiServicos") && (
        <FormField
          control={form.control}
          name="servicosOferecidos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviços Oferecidos</FormLabel>
              <p className="text-sm text-muted-foreground mb-2">
                Serviços são instalação de produtos ou manutenções realizadas...
              </p>
              <FormControl>
                <Textarea
                  placeholder="Descreva os serviços que você presta (ex: instalação, manutenção, consultoria)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Possui Produtos - sempre visível */}
      <FormField
        control={form.control}
        name="possuiProdutos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Possui Produtos?</FormLabel>
          </FormItem>
        )}
      />

      {/* Campo condicional Produtos Oferecidos */}
      {form.watch("possuiProdutos") && (
        <FormField
          control={form.control}
          name="produtos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produtos Oferecidos</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os produtos que você oferece"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Possui Planos */}
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
            <FormLabel>Possui planos?</FormLabel>
          </FormItem>
        )}
      />

      {/* Campo condicional Planos Oferecidos */}
      {form.watch("possuiPlanos") && (
        <FormField
          control={form.control}
          name="planos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Planos Oferecidos</FormLabel>
              <p className="text-sm text-muted-foreground mb-2">
                Exemplos: serviços de instalação mais manutenção por X valor, Compra de um produto mais instalação por um X valor
              </p>
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

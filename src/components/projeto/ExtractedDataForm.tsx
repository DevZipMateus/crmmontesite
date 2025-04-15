
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ArrowLeft, Check, Edit, Save } from "lucide-react";

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
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-600 mb-1">Dados extraídos automaticamente</h3>
        <p className="text-xs text-blue-500">Verifique os dados extraídos e faça correções se necessário</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Nome do cliente</FormLabel>
              <FormControl>
                <Input {...field} className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary" />
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
              <FormLabel className="text-gray-700">Modelo escolhido</FormLabel>
              <FormControl>
                <Input {...field} className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary" />
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
                <Input {...field} className="rounded-md shadow-sm border-gray-200 focus:border-primary focus:ring-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-between items-center my-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowManualInput(!showManualInput)}
          type="button"
          className="flex items-center gap-2 shadow-sm"
        >
          {showManualInput ? (
            <>
              <Check className="h-4 w-4" /> Dados verificados
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" /> Preencher manualmente
            </>
          )}
        </Button>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Projetos
        </Button>
        
        <Button 
          type="button" 
          onClick={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2 shadow-sm"
        >
          <Save className="h-4 w-4" /> Criar Projeto
        </Button>
      </div>
    </div>
  );
};

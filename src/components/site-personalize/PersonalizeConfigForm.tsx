
import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./PersonalizeBasicForm";
import MediaUploader from "./MediaUploader";

interface PersonalizeConfigFormProps {
  form: UseFormReturn<FormValues>;
  modeloSelecionado: string | null;
  midiaPreviews: string[];
  handleMidiaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveMidia: (index: number) => void;
}

const PersonalizeConfigForm: React.FC<PersonalizeConfigFormProps> = ({
  form,
  modeloSelecionado,
  midiaPreviews,
  handleMidiaUpload,
  handleRemoveMidia,
}) => {
  return (
    <>
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Mídias do Site</h3>
        
        <FormLabel className="flex items-center gap-2">
          Upload de Mídias (Imagens, Vídeos, GIFs)
        </FormLabel>
        
        <MediaUploader 
          label="Upload de Mídias"
          description="Adicione imagens, vídeos e GIFs para o seu site. Máximo de 5 arquivos."
          accept="image/*,video/*,.gif"
          multiple={true}
          previews={midiaPreviews}
          onUpload={handleMidiaUpload}
          onRemove={handleRemoveMidia}
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Configurações Adicionais</h3>
        
        <FormField
          control={form.control}
          name="botaoWhatsapp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Deseja incluir botão do WhatsApp?</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="possuiMapa"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Deseja incluir Mapa do Google?</FormLabel>
            </FormItem>
          )}
        />

        {form.watch("possuiMapa") && (
          <FormField
            control={form.control}
            name="linkMapa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Google Maps</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Cole aqui o link compartilhável do Google Maps"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Copie o link do seu endereço no Google Maps clicando em "Compartilhar" e depois em "Incorporar um mapa"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="modelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo Selecionado</FormLabel>
              <FormControl>
                <Input readOnly value={modeloSelecionado || field.value || ""} />
              </FormControl>
              <FormDescription>
                Este é o modelo selecionado para o seu site.
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PersonalizeConfigForm;

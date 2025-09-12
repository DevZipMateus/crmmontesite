
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./PersonalizeBasicForm";
import MediaUploader from "./MediaUploader";

interface PersonalizeConfigFormProps {
  form: UseFormReturn<FormValues>;
  midiaPreviews: string[];
  midiaCaptions: string[];
  handleMidiaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveMidia: (index: number) => void;
  handleUpdateMidiaCaption: (index: number, caption: string) => void;
}

export const PersonalizeConfigForm: React.FC<PersonalizeConfigFormProps> = ({
  form,
  midiaPreviews,
  midiaCaptions,
  handleMidiaUpload,
  handleRemoveMidia,
  handleUpdateMidiaCaption,
}) => {
  return (
    <>
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Mídias do Site</h3>
        
        <MediaUploader 
          label="Upload de Mídias"
          description="Adicione imagens e vídeos para o seu site. Utilize arquivos em boa qualidade, pois serão exibidos diretamente no site. Não realizamos edições nas mídias enviadas."
          accept="image/*,video/*,.gif"
          multiple={true}
          previews={midiaPreviews}
          captions={midiaCaptions}
          onUpload={handleMidiaUpload}
          onRemove={handleRemoveMidia}
          onUpdateCaption={handleUpdateMidiaCaption}
          allowCaptions={true}
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

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Adicionais</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Inclua aqui observações especiais, funcionalidades específicas que deseja, ou qualquer outra informação importante para seu projeto..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

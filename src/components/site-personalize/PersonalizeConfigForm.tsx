
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
import { MapPin, MessageCircle } from "lucide-react";

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
  const possuiMapa = form.watch("possuiMapa");

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

      <div className="space-y-6 pt-4 border-t">
        <h3 className="text-lg font-medium">Configurações Adicionais</h3>
        
        <FormField
          control={form.control}
          name="botaoWhatsapp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Incluir botão do WhatsApp
                </FormLabel>
                <FormDescription>
                  Adiciona um botão flutuante de WhatsApp no site para contato rápido
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="possuiMapa"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Incluir mapa do Google
                </FormLabel>
                <FormDescription>
                  Adiciona um mapa interativo do Google Maps no seu site
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {possuiMapa && (
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
                  Para obter o link: abra o Google Maps, procure seu endereço, clique em "Compartilhar" e copie o link
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  );
};


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

    </>
  );
};

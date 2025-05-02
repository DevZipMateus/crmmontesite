
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ModelTemplate } from "@/services/modelTemplateService";

interface ModelFormProps {
  model: {
    name: string;
    description: string;
    image_url: string;
    custom_url: string;
  };
  isEdit?: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ModelForm: React.FC<ModelFormProps> = ({ 
  model, 
  isEdit = false, 
  onChange, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model-name">Nome do Modelo *</Label>
          <Input
            id="model-name"
            placeholder="Ex: Modelo Contábil Premium"
            value={model.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model-url">URL Personalizada</Label>
          <Input
            id="model-url"
            placeholder="Ex: contabil-premium"
            value={model.custom_url}
            onChange={(e) => onChange("custom_url", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Deixe em branco para usar o ID automático
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model-description">Descrição *</Label>
        <Textarea
          id="model-description"
          placeholder="Descreva as características do modelo"
          value={model.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model-image">URL da Imagem</Label>
        <Input
          id="model-image"
          placeholder="URL da imagem do modelo"
          value={model.image_url}
          onChange={(e) => onChange("image_url", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Deixe o valor padrão para usar a imagem placeholder
        </p>
      </div>
      
      <div className="flex justify-end mt-2 gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            isEdit ? "Salvar Alterações" : "Criar Modelo"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ModelForm;

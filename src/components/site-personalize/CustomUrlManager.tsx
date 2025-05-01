
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { modelosDisponiveis } from "./modelosData";

interface CustomUrlManagerProps {
  baseUrl: string;
}

const CustomUrlManager: React.FC<CustomUrlManagerProps> = ({ baseUrl }) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(modelosDisponiveis[0].id);
  const [customUrl, setCustomUrl] = useState(modelosDisponiveis[0].customUrl || "");
  const [copied, setCopied] = useState(false);
  
  const selectedModelInfo = modelosDisponiveis.find(m => m.id === selectedModel);
  
  // Gera a URL completa para o modelo selecionado
  const getFullUrl = () => {
    const urlParam = customUrl || selectedModel;
    return `${baseUrl}/formulario/${urlParam}`;
  };

  // Copia a URL para o clipboard
  const copyToClipboard = () => {
    const url = getFullUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Manipula a seleção do modelo
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    const model = modelosDisponiveis.find(m => m.id === value);
    setCustomUrl(model?.customUrl || "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar URLs Personalizadas</CardTitle>
        <CardDescription>
          Crie URLs personalizadas para os seus formulários de modelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-select">Selecione o Modelo</Label>
          <Select
            value={selectedModel}
            onValueChange={handleModelChange}
          >
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {modelosDisponiveis.map((modelo) => (
                <SelectItem key={modelo.id} value={modelo.id}>
                  {modelo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-url">URL Personalizada</Label>
          <Input
            id="custom-url"
            placeholder="Digite a URL personalizada"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Esta será a URL personalizada para o modelo selecionado. 
            Exemplo: {baseUrl}/formulario/<strong>{customUrl || "[url-personalizada]"}</strong>
          </p>
        </div>

        <div className="space-y-1">
          <Label>URL Completa</Label>
          <div className="flex items-center gap-2 mt-1">
            <div className="border rounded-md px-3 py-2 bg-muted flex-1 text-sm overflow-x-auto">
              {getFullUrl()}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Modelo: {selectedModelInfo?.name}
          </span>
          <Button
            onClick={() => {
              toast({
                title: "URL atualizada",
                description: `A URL personalizada para ${selectedModelInfo?.name} foi atualizada para '${customUrl}'.`,
              });
            }}
          >
            Salvar URL
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomUrlManager;

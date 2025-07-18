
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface ModeloItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface ModeloSelectorProps {
  modelos: ModeloItem[];
  onSelectModelo: (modeloId: string) => void;
}

const ModeloSelector: React.FC<ModeloSelectorProps> = ({ modelos, onSelectModelo }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {modelos.map((modelo) => (
        <Card key={modelo.id} className="cursor-pointer hover:shadow-lg transition-all hover:border-primary">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-base sm:text-lg">{modelo.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{modelo.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="aspect-video bg-muted/20 rounded-md overflow-hidden">
              <img 
                src={modelo.imageUrl} 
                alt={`Modelo ${modelo.name}`} 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 sm:p-4 pt-0">
            <Button 
              onClick={() => onSelectModelo(modelo.id)} 
              className="w-full text-xs sm:text-sm"
              variant="default"
            >
              Selecionar <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ModeloSelector;

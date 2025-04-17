
import React from "react";
import { ModeloItem } from "./modelosData";

interface ModeloDetailsProps {
  modelo: ModeloItem | undefined;
}

const ModeloDetails: React.FC<ModeloDetailsProps> = ({ modelo }) => {
  if (!modelo) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-2">
      <h3 className="font-medium text-blue-700">Modelo selecionado: {modelo.name}</h3>
      <p className="text-sm text-blue-600 mt-1">{modelo.description}</p>
    </div>
  );
};

export default ModeloDetails;

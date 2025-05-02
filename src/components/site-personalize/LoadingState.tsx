
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
        <p>Carregando formulário...</p>
      </div>
    </div>
  );
};

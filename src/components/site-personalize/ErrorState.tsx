
import React from "react";

interface ErrorStateProps {
  error: string | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="text-center mt-8 text-red-500">
      Erro: {error}
    </div>
  );
};


import React from "react";
import { ModelProvider } from "./ModelContext";
import ModelManagerContent from "./ModelManagerContent";

interface CustomUrlManagerProps {
  baseUrl: string;
}

const CustomUrlManager: React.FC<CustomUrlManagerProps> = ({ baseUrl }) => {
  return (
    <ModelProvider baseUrl={baseUrl}>
      <ModelManagerContent baseUrl={baseUrl} />
    </ModelProvider>
  );
};

export default CustomUrlManager;

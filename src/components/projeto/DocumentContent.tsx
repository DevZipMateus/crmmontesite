
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DocumentContentProps {
  fileName: string;
  docContent: string;
}

export const DocumentContent: React.FC<DocumentContentProps> = ({
  fileName,
  docContent,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">Conteúdo extraído: {fileName}</Label>
      <Textarea
        id="content"
        value={docContent}
        readOnly
        className="h-64 font-mono text-sm"
      />
    </div>
  );
};


import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface FileUploadTabProps {
  isReading: boolean;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  isReading,
  handleFileUpload,
}) => {
  return (
    <div className="space-y-4 pt-4">
      <p className="text-muted-foreground mb-4">
        Faça upload de um arquivo Word (.doc ou .docx) contendo informações do site.
      </p>
      
      <div className="grid w-full max-w-md items-center gap-1.5">
        <Label htmlFor="docFile">Arquivo Word</Label>
        <div className="flex items-center gap-2">
          <Input
            id="docFile"
            type="file"
            accept=".doc,.docx"
            onChange={handleFileUpload}
            disabled={isReading}
            className="flex-1"
          />
          {isReading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: .doc, .docx
        </p>
      </div>
    </div>
  );
};


import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, Image } from "lucide-react";

interface FileUploadTabProps {
  isReading: boolean;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  isReading,
  handleFileUpload,
}) => {
  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Faça upload de um arquivo</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Selecione um arquivo Word (.doc ou .docx) com as informações do site.
        </p>
      </div>
      
      <div className="grid w-full max-w-md mx-auto items-center gap-3">
        <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-dashed border-primary">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <Label htmlFor="docFile" className="block text-sm font-medium text-gray-700 mb-1">
              Arquivo Word
            </Label>
            <Input
              id="docFile"
              type="file"
              accept=".doc,.docx"
              onChange={handleFileUpload}
              disabled={isReading}
              className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
            />
          </div>
          {isReading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Image className="h-4 w-4" /> Formatos aceitos: .doc, .docx
          </p>
        </div>
      </div>
    </div>
  );
};


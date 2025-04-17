
import React from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Upload } from "lucide-react";

interface LogoUploaderProps {
  preview: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ preview, onUpload }) => {
  return (
    <div className="space-y-4">
      <FormLabel className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" /> Upload da Logo
      </FormLabel>
      <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Clique para fazer upload</span> ou arraste e solte sua logo aqui
            </p>
          </div>
          {preview && (
            <div className="w-24 h-24 border-2 border-primary/30 rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Preview da logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Faça upload de sua logo. Formatos aceitos: JPG, PNG, SVG
        </p>
      </div>
    </div>
  );
};

export default LogoUploader;

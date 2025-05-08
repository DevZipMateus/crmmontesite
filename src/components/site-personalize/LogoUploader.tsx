
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Image, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Maximum file size in MB
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes

interface LogoUploaderProps {
  preview: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LogoUploader = ({ preview, onUpload }: LogoUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size before upload
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = `O arquivo excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB`;
        setFileError(errorMsg);
        toast({
          title: "Erro no tamanho do arquivo",
          description: errorMsg,
          variant: "destructive"
        });
        // Clear the input to allow reselecting files
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // If file is valid, proceed with upload
      onUpload(event);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Logo</h4>
          <p className="text-sm text-muted-foreground">
            Faça upload da logo do seu escritório/empresa
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>
      
      {fileError && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">
            {fileError}
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-xs text-blue-700">
          Tamanho máximo do arquivo: {MAX_FILE_SIZE_MB}MB
        </AlertDescription>
      </Alert>
      
      {preview ? (
        <div className="relative mt-4 rounded-md overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Logo Preview"
            className="w-full max-h-48 object-contain bg-gray-50 p-2"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              onUpload({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-center items-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded-md">
          <div className="text-center">
            <Image className="mx-auto h-8 w-8 text-gray-400" />
            <span className="mt-1 text-sm text-gray-500 block">Nenhuma logo selecionada</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;

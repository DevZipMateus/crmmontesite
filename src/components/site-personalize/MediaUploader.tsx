
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload, FileImage, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface MediaUploaderProps {
  label: string;
  description?: string;
  accept: string;
  multiple?: boolean;
  previews: string[];
  captions?: string[];
  allowCaptions?: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onUpdateCaption?: (index: number, caption: string) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  description,
  accept,
  multiple = false,
  previews = [],
  captions = [],
  allowCaptions = false,
  onUpload,
  onRemove,
  onUpdateCaption,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCaptionChange = (index: number, value: string) => {
    if (onUpdateCaption) {
      onUpdateCaption(index, value);
    }
  };

  const renderPreview = (src: string, index: number) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(src);
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(src);
    
    if (isImage) {
      return (
        <img
          src={src}
          alt={`Preview ${index + 1}`}
          className="w-full h-32 object-cover rounded-t-md"
        />
      );
    }
    
    if (isVideo) {
      return (
        <video
          src={src}
          controls
          className="w-full h-32 object-cover rounded-t-md"
        />
      );
    }
    
    return (
      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-t-md">
        <FileImage className="h-12 w-12 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onUpload}
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

      {accept.includes("image") && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs text-blue-700">
            Tamanho máximo: 10MB por arquivo. Formatos recomendados: JPG, PNG.
            Para evitar erros, use nomes simples sem caracteres especiais.
          </AlertDescription>
        </Alert>
      )}

      {previews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={`${preview}-${index}`}
              className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm"
            >
              {renderPreview(preview, index)}
              
              <div className="p-3 space-y-2">
                {allowCaptions && (
                  <div className="space-y-1">
                    <Label htmlFor={`caption-${index}`} className="text-xs font-medium">
                      Legenda
                    </Label>
                    <Textarea
                      id={`caption-${index}`}
                      placeholder="Adicione uma descrição..."
                      value={captions[index] || ""}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="h-20 text-sm resize-none"
                    />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50">
          <FileImage className="h-8 w-8 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {multiple ? 'Nenhum arquivo selecionado' : 'Nenhum arquivo selecionado'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Clique em "Upload" para selecionar {multiple ? 'arquivos' : 'um arquivo'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;

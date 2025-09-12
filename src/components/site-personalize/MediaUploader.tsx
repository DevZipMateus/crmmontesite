
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

  const isImageFile = (src: string) => {
    // Check if it's a blob URL (from createObjectURL)
    if (src.startsWith('blob:')) {
      return true; // Assume blob URLs from file input are images since we're filtering by accept
    }
    
    // Check file extension for regular URLs
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(src);
  };

  const isVideoFile = (src: string) => {
    // For blob URLs, check if video is in accept types
    if (src.startsWith('blob:') && accept.includes('video')) {
      return false; // We'll handle video detection differently if needed
    }
    
    return /\.(mp4|webm|ogg|mov)$/i.test(src);
  };

  const renderPreview = (src: string, index: number) => {
    console.log(`Rendering preview for index ${index}:`, src);
    
    // Try to render as image first for most cases
    if (isImageFile(src) || src.startsWith('blob:')) {
      return (
        <img
          src={src}
          alt={`Preview ${index + 1}`}
          className="w-full h-32 object-cover rounded-t-md"
          onError={(e) => {
            console.error(`Error loading image preview for index ${index}:`, src);
            // Don't replace with placeholder, let the error show
          }}
          onLoad={() => {
            console.log(`Successfully loaded image preview for index ${index}`);
          }}
        />
      );
    }
    
    if (isVideoFile(src)) {
      return (
        <video
          src={src}
          controls
          className="w-full h-32 object-cover rounded-t-md"
          onError={(e) => {
            console.error(`Error loading video preview for index ${index}:`, src);
          }}
        />
      );
    }
    
    // Fallback - try as image anyway in case our detection failed
    return (
      <img
        src={src}
        alt={`Preview ${index + 1}`}
        className="w-full h-32 object-cover rounded-t-md"
        onError={(e) => {
          console.error(`Fallback image failed for index ${index}:`, src);
          // Replace with file icon only if image load fails
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-32 flex items-center justify-center bg-gray-100 rounded-t-md">
                <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            `;
          }
        }}
        onLoad={() => {
          console.log(`Fallback image loaded successfully for index ${index}`);
        }}
      />
    );
  };

  console.log(`MediaUploader rendering - Previews count: ${previews.length}`, previews);

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

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-800 font-medium">
          Tamanho máximo: 10MB por arquivo. Formatos aceitos: JPG, PNG (imagens) e MP4 (vídeos). Envie mídias nítidas e em alta qualidade. Use nomes simples, sem espaços ou caracteres especiais.
        </AlertDescription>
      </Alert>

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

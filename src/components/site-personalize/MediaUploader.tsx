
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, FileText, Image, X, Info } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Maximum file size in MB
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes

interface MediaUploaderProps {
  label: string;
  description?: string;
  accept: string;
  multiple?: boolean;
  previews: string[];
  captions?: string[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onUpdateCaption?: (index: number, caption: string) => void;
  allowCaptions?: boolean;
}

const MediaUploader = ({
  label,
  description,
  accept,
  multiple = false,
  previews,
  captions = [],
  onUpload,
  onRemove,
  onUpdateCaption,
  allowCaptions = false
}: MediaUploaderProps) => {
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
    
    if (event.target.files) {
      // Check file size before upload
      const files = Array.from(event.target.files);
      const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(file => file.name).join(", ");
        const errorMsg = `Os seguintes arquivos excedem ${MAX_FILE_SIZE_MB}MB: ${fileNames}`;
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
      
      // If all files are valid, proceed with upload
      onUpload(event);
    }
  };

  const renderPreview = (url: string, index: number) => {
    // Check if it's an image or video based on the URL or file type
    const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
    
    return (
      <div key={index} className="relative border rounded-md p-2 space-y-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
          {isVideo ? (
            <video 
              src={url} 
              className="h-full w-full object-cover" 
              controls 
            />
          ) : (
            <img 
              src={url} 
              alt={`Preview ${index + 1}`} 
              className="h-full w-full object-cover" 
            />
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-1 right-1 h-6 w-6" 
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {allowCaptions && (
          <Input 
            placeholder="Legenda da mídia" 
            value={captions[index] || ''} 
            onChange={(e) => onUpdateCaption && onUpdateCaption(index, e.target.value)} 
            className="text-sm" 
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <Label className="flex items-center gap-1">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {fileError && (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertDescription className="text-xs">
              {fileError}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs text-blue-700">
            Tamanho máximo por arquivo: {MAX_FILE_SIZE_MB}MB
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            multiple={multiple}
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
          <div className="text-sm text-muted-foreground flex items-center">
            {accept.includes('image') ? (
              <Image className="h-4 w-4 mr-1" />
            ) : (
              <FileText className="h-4 w-4 mr-1" />
            )}
            <span>{accept === 'image/*' ? 'Imagens (JPG, PNG, etc)' : accept === 'image/*,video/*,.gif' ? 'Imagens, Vídeos, GIFs' : accept}</span>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((url, index) => renderPreview(url, index))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;

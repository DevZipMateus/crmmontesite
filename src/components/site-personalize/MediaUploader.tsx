
import React from "react";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MediaUploaderProps {
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  previews: string[];
  captions?: string[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onUpdateCaption?: (index: number, caption: string) => void;
  allowCaptions?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  label, 
  description, 
  accept, 
  multiple = false, 
  previews = [],
  captions = [],
  onUpload,
  onRemove,
  onUpdateCaption,
  allowCaptions = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
        <div className="flex flex-col items-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <div className="w-full">
            <Input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={onUpload}
              className="file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Clique para selecionar arquivos</span> ou arraste e solte aqui
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium">Mídias selecionadas ({previews.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previews.map((preview, index) => {
              const isVideo = preview.includes("video");
              return (
                <div key={index} className="relative group border border-primary/30 rounded-md p-3 bg-white">
                  <div className="flex flex-col">
                    <div className="w-full h-32 mb-2 relative">
                      {isVideo ? (
                        <video
                          src={preview}
                          className="w-full h-full object-cover rounded-md"
                          controls
                        />
                      ) : (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                        aria-label="Remover mídia"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {allowCaptions && onUpdateCaption && (
                      <div className="mt-2">
                        <Textarea
                          className="w-full text-sm resize-none"
                          placeholder="Adicione uma legenda para esta mídia..."
                          rows={2}
                          value={captions[index] || ""}
                          onChange={(e) => onUpdateCaption(index, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;

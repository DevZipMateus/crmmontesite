
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFileWithRetry, MAX_FILE_SIZE_MB } from "@/lib/file-upload-service";
import { formatFileSize } from "@/lib/sanitize-file";

export interface FileHandlersProps {
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setDepoimentoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setDepoimentoPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setMidiaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setMidiaPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setMidiaCaptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface MediaItem {
  file: File;
  preview: string;
  caption: string;
}

export const useFileUploadHandlers = (props: FileHandlersProps) => {
  const { toast } = useToast();
  const [uploadErrors, setUploadErrors] = useState<{[filename: string]: string}>({});
  const [uploading, setUploading] = useState<{[filename: string]: boolean}>({});
  
  const {
    setLogoFile,
    setLogoPreview,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews,
    setMidiaCaptions
  } = props;

  // Validate file before processing
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo ${file.name} excede o limite de ${MAX_FILE_SIZE_MB}MB (tamanho: ${formatFileSize(file.size)})`,
        variant: "destructive"
      });
      return false;
    }
    
    // Additional validation can be added here
    return true;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!validateFile(file)) return;
      
      // Generate preview
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setLogoFile(file);
      
      toast({
        description: "Logo carregada com sucesso",
      });
    }
  };

  const handleDepoimentoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      const validPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        if (validateFile(file)) {
          validFiles.push(file);
          validPreviews.push(URL.createObjectURL(file));
        }
      });
      
      if (validFiles.length > 0) {
        setDepoimentoFiles((prev) => [...prev, ...validFiles]);
        setDepoimentoPreviews((prev) => [...prev, ...validPreviews]);
        
        toast({
          description: `${validFiles.length} ${validFiles.length === 1 ? 'depoimento adicionado' : 'depoimentos adicionados'} com sucesso`,
        });
      }
    }
  };

  const handleRemoveDepoimento = (index: number) => {
    setDepoimentoFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setDepoimentoPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    toast({
      description: "Depoimento removido",
    });
  };

  const handleMidiaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      const validPreviews: string[] = [];
      const validCaptions: string[] = [];
      
      Array.from(files).forEach(file => {
        if (validateFile(file)) {
          validFiles.push(file);
          
          if (file.type.startsWith('image/') || file.type === 'image/gif') {
            validPreviews.push(URL.createObjectURL(file));
          } else {
            validPreviews.push(file.type.startsWith('video/') ? URL.createObjectURL(file) : '');
          }
          
          validCaptions.push("");
        }
      });
      
      if (validFiles.length > 0) {
        setMidiaFiles((prev) => [...prev, ...validFiles]);
        setMidiaPreviews((prev) => [...prev, ...validPreviews]);
        setMidiaCaptions((prev) => [...prev, ...validCaptions]);
        
        toast({
          description: `${validFiles.length} ${validFiles.length === 1 ? 'mídia adicionada' : 'mídias adicionadas'} com sucesso`,
        });
      }
    }
  };

  const handleRemoveMidia = (index: number) => {
    setMidiaFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setMidiaPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setMidiaCaptions((prev) => {
      const newCaptions = [...prev];
      newCaptions.splice(index, 1);
      return newCaptions;
    });

    toast({
      description: "Mídia removida com sucesso",
    });
  };

  const handleUpdateMidiaCaption = (index: number, caption: string) => {
    setMidiaCaptions((prev) => {
      const newCaptions = [...prev];
      newCaptions[index] = caption;
      return newCaptions;
    });
  };

  return {
    handleLogoUpload,
    handleDepoimentoUpload,
    handleRemoveDepoimento,
    handleMidiaUpload,
    handleRemoveMidia,
    handleUpdateMidiaCaption,
    uploadErrors,
    uploading
  };
};

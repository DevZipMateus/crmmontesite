
import React from "react";
import { useToast } from "@/hooks/use-toast";

export interface FileHandlersProps {
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setDepoimentoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setDepoimentoPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setMidiaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setMidiaPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useFileUploadHandlers = (props: FileHandlersProps) => {
  const { toast } = useToast();
  const {
    setLogoFile,
    setLogoPreview,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews
  } = props;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleDepoimentoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDepoimentoFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setDepoimentoPreviews((prev) => [...prev, ...newPreviews]);
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
  };

  const handleMidiaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMidiaFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => {
        if (file.type.startsWith('image/') || file.type === 'image/gif') {
          return URL.createObjectURL(file);
        }
        return file.type.startsWith('video/') ? URL.createObjectURL(file) : '';
      });
      setMidiaPreviews((prev) => [...prev, ...newPreviews]);
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

    toast({
      description: "Mídia removida com sucesso",
    });
  };

  return {
    handleLogoUpload,
    handleDepoimentoUpload,
    handleRemoveDepoimento,
    handleMidiaUpload,
    handleRemoveMidia
  };
};


import { uploadFileWithRetry } from "@/lib/file-upload-service";
import { UploadProgress } from "../types/submission";

export const uploadFiles = async (
  logoFile: File | null,
  depoimentoFiles: File[],
  midiaFiles: File[],
  midiaCaptions: string[],
  updateProgress: (fileType: string, index: number, progress: number) => void,
  toast: any
) => {
  let logoUrl = null;
  const depoimentoUrls: string[] = [];
  const midiaItems: string[] = [];

  // Process logo upload with retry
  if (logoFile) {
    console.log("📁 Uploading logo file:", logoFile.name);
    
    const { success, filePath, error } = await uploadFileWithRetry(logoFile, {
      folderPath: "logos",
      onProgress: (progress) => updateProgress("logo", 0, progress)
    });
    
    if (!success || !filePath) {
      console.error("❌ Logo upload error:", error);
      throw new Error(`Erro ao fazer upload da logo: ${error?.message || 'Falha desconhecida'}`);
    }

    logoUrl = filePath;
    console.log("✅ Logo uploaded successfully:", logoUrl);
  }

  // Process depoimento uploads with retry
  for (let i = 0; i < depoimentoFiles.length; i++) {
    const file = depoimentoFiles[i];
    console.log("📁 Uploading depoimento file:", file.name);
    
    try {
      const { success, filePath, error } = await uploadFileWithRetry(file, {
        folderPath: "depoimentos",
        onProgress: (progress) => updateProgress("depoimento", i, progress)
      });
      
      if (!success || !filePath) {
        console.error("❌ Depoimento upload error:", error);
        throw error;
      }

      depoimentoUrls.push(filePath);
      console.log("✅ Depoimento uploaded successfully:", filePath);
    } catch (fileError) {
      console.error("❌ Error in depoimento upload:", fileError);
      toast({
        description: `Erro ao enviar ${file.name}. Tentando continuar com os outros arquivos.`,
        variant: "destructive",
      });
    }
  }

  // Process media items with captions and retry
  for (let i = 0; i < midiaFiles.length; i++) {
    const file = midiaFiles[i];
    const caption = i < midiaCaptions.length ? midiaCaptions[i] : "";
    
    console.log(`📁 Uploading midia file ${i+1}/${midiaFiles.length}:`, file.name, "Caption:", caption);
    
    try {
      const { success, filePath, error } = await uploadFileWithRetry(file, {
        folderPath: "midias",
        onProgress: (progress) => updateProgress("midia", i, progress)
      });
      
      if (!success || !filePath) {
        console.error("❌ Midia upload error:", error);
        throw error;
      }

      const mediaItemObj = {
        url: filePath,
        caption: caption
      };
      
      const serializedMediaItem = JSON.stringify(mediaItemObj);
      midiaItems.push(serializedMediaItem);
      
      console.log("✅ Midia uploaded successfully with caption:", filePath, caption);
    } catch (fileError) {
      console.error("❌ Error in midia upload:", fileError);
      toast({
        description: `Erro ao enviar ${file.name}. Tentando continuar com os outros arquivos.`,
        variant: "destructive",
      });
    }
  }

  return { logoUrl, depoimentoUrls, midiaItems };
};


import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/lib/sanitize-file";

export const uploadFiles = async (
  logoFile: File | null,
  depoimentoFiles: File[],
  midiaFiles: File[],
  midiaCaptions: string[],
  updateProgress: (fileType: string, index: number, progress: number) => void,
  toast: any,
  personalizationId?: string
) => {
  console.log("🔄 Starting file uploads...");
  
  let logoUrl: string | null = null;
  const depoimentoUrls: string[] = [];
  const midiaItems: any[] = [];

  // Upload logo
  if (logoFile) {
    console.log("📤 Uploading logo...");
    updateProgress("logo", 0, 0);
    
    const sanitizedLogoName = sanitizeFileName(logoFile.name);
    const logoPath = `logos/${Date.now()}_${sanitizedLogoName}`;
    
    const { data: logoData, error: logoError } = await supabase.storage
      .from("site_personalizacoes")
      .upload(logoPath, logoFile);

    if (logoError) {
      console.error("❌ Logo upload error:", logoError);
      throw new Error(`Erro no upload da logo: ${logoError.message}`);
    }

    logoUrl = logoPath;
    updateProgress("logo", 0, 100);
    console.log("✅ Logo uploaded:", logoUrl);
  }

  // Upload depoimento files
  if (depoimentoFiles.length > 0) {
    console.log("📤 Uploading depoimento files...");
    
    for (let i = 0; i < depoimentoFiles.length; i++) {
      const file = depoimentoFiles[i];
      updateProgress("depoimento", i, 0);
      
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `depoimentos/${Date.now()}_${i}_${sanitizedFileName}`;
      
      const { data, error } = await supabase.storage
        .from("site_personalizacoes")
        .upload(filePath, file);

      if (error) {
        console.error(`❌ Depoimento file ${i} upload error:`, error);
        throw new Error(`Erro no upload do arquivo de depoimento ${i + 1}: ${error.message}`);
      }

      depoimentoUrls.push(filePath);
      updateProgress("depoimento", i, 100);
      console.log(`✅ Depoimento file ${i} uploaded:`, filePath);
    }
  }

  // Upload midia files
  if (midiaFiles.length > 0) {
    console.log("📤 Uploading midia files...");
    
    for (let i = 0; i < midiaFiles.length; i++) {
      const file = midiaFiles[i];
      updateProgress("midia", i, 0);
      
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `midias/${Date.now()}_${i}_${sanitizedFileName}`;
      
      const { data, error } = await supabase.storage
        .from("site_personalizacoes")
        .upload(filePath, file);

      if (error) {
        console.error(`❌ Midia file ${i} upload error:`, error);
        throw new Error(`Erro no upload do arquivo de mídia ${i + 1}: ${error.message}`);
      }

      const midiaItem = {
        url: filePath,
        caption: midiaCaptions[i] || ""
      };
      
      midiaItems.push(midiaItem);
      updateProgress("midia", i, 100);
      console.log(`✅ Midia file ${i} uploaded:`, filePath);
    }
  }

  // Se temos um personalizationId, atualizar com as URLs dos arquivos
  if (personalizationId && (logoUrl || depoimentoUrls.length > 0 || midiaItems.length > 0)) {
    console.log("📝 Updating personalization with file URLs...");
    
    const updateData: any = {};
    if (logoUrl) updateData.logo_url = logoUrl;
    if (depoimentoUrls.length > 0) updateData.depoimento_urls = depoimentoUrls;
    if (midiaItems.length > 0) updateData.midia_urls = midiaItems;

    const { error: updateError } = await supabase
      .from("site_personalizacoes")
      .update(updateData)
      .eq('id', personalizationId);

    if (updateError) {
      console.error("❌ Error updating personalization with files:", updateError);
      // Não vamos falhar aqui, apenas logar
    } else {
      console.log("✅ Personalization updated with file URLs");
    }
  }

  return { logoUrl, depoimentoUrls, midiaItems };
};

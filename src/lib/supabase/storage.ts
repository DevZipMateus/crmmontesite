
import { supabase } from "@/integrations/supabase/client";

// Função para obter URL assinada para arquivos de personalização
export async function getSignedUrl(filePath: string, bucket: string = 'site_personalizacoes', expiresIn: number = 3600) {
  if (!filePath) return null;
  
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error(`Erro ao gerar URL para arquivo (bucket: ${bucket}):`, error);
      return null;
    }
    
    return data.signedUrl;
  } catch (err) {
    console.error(`Erro ao processar arquivo (bucket: ${bucket}):`, err);
    return null;
  }
}

// Verifica se um arquivo existe no Storage
export async function checkFileExists(filePath: string, bucket: string = 'site_personalizacoes') {
  try {
    // Tenta obter os metadados do arquivo para verificar se existe
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    if (error) {
      console.error(`Erro ao verificar arquivo (bucket: ${bucket}):`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Erro ao verificar arquivo (bucket: ${bucket}):`, err);
    return false;
  }
}

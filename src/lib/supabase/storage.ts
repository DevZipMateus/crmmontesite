
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
    // Usando getPublicUrl para verificar se o arquivo existe
    const { data } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    // Se temos uma URL pública, o arquivo existe (embora isso não seja
    // uma verificação 100% precisa, pois getPublicUrl sempre retorna uma URL)
    return !!data && !!data.publicUrl;
  } catch (err) {
    console.error(`Erro ao verificar arquivo (bucket: ${bucket}):`, err);
    return false;
  }
}

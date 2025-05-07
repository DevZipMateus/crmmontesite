
import { supabase } from "@/integrations/supabase/client";

// Função para obter URL assinada para arquivos de personalização
export async function getSignedUrl(filePath: string, bucket: string = 'site_personalizacoes', expiresIn: number = 3600) {
  if (!filePath) return null;
  
  try {
    // Normaliza o caminho do arquivo removendo eventuais barras duplicadas
    const normalizedPath = filePath.replace(/\/\/+/g, '/');
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(normalizedPath, expiresIn);
    
    if (error) {
      console.error(`Erro ao gerar URL para arquivo (bucket: ${bucket}, path: ${normalizedPath}):`, error);
      return null;
    }
    
    return data.signedUrl;
  } catch (err) {
    console.error(`Erro ao processar arquivo (bucket: ${bucket}, path: ${filePath}):`, err);
    return null;
  }
}

// Verifica se um arquivo existe no Storage
export async function checkFileExists(filePath: string, bucket: string = 'site_personalizacoes') {
  if (!filePath) return false;
  
  try {
    // Normaliza o caminho do arquivo removendo eventuais barras duplicadas
    const normalizedPath = filePath.replace(/\/\/+/g, '/');
    
    // Primeiro tente uma operação mais precisa para verificar se o arquivo existe
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from(bucket)
      .list(normalizedPath.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: normalizedPath.split('/').pop() || ''
      });
      
    if (fileError) {
      console.error(`Erro ao verificar arquivo (bucket: ${bucket}, path: ${normalizedPath}):`, fileError);
      return false;
    }
    
    // Se encontramos o arquivo na lista, ele existe
    if (fileData && fileData.length > 0) {
      return true;
    }
    
    // Fallback para o método getPublicUrl
    const { data } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(normalizedPath);
    
    // Tenta fazer uma solicitação HEAD para verificar se o arquivo existe
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  } catch (err) {
    console.error(`Erro ao verificar arquivo (bucket: ${bucket}, path: ${filePath}):`, err);
    return false;
  }
}

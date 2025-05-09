
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName, generateUniqueFilePath, validateFileSize } from "./sanitize-file";
import { useToast } from "@/hooks/use-toast";

// Maximum file size in MB
export const MAX_FILE_SIZE_MB = 10;

// Default bucket name
const DEFAULT_BUCKET = "site_personalizacoes";

export interface FileUploadOptions {
  bucketName?: string;
  folderPath?: string;
  maxRetries?: number;
  timeout?: number;
  onProgress?: (progress: number) => void;
  validateFile?: (file: File) => boolean | string;
}

export interface FileUploadResult {
  success: boolean;
  filePath: string | null;
  error: Error | null;
  retries?: number;
}

/**
 * Upload a file to Supabase storage with retry mechanism
 */
export async function uploadFileWithRetry(
  file: File,
  options: FileUploadOptions = {}
): Promise<FileUploadResult> {
  const {
    bucketName = DEFAULT_BUCKET,
    folderPath = "",
    maxRetries = 3,
    timeout = 30000,
    onProgress,
    validateFile
  } = options;
  
  let retries = 0;
  
  // Validate file size
  if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
    return {
      success: false,
      filePath: null,
      error: new Error(`O arquivo excede o tamanho máximo permitido (${MAX_FILE_SIZE_MB}MB)`)
    };
  }
  
  // Custom file validation if provided
  if (validateFile) {
    const validationResult = validateFile(file);
    if (validationResult !== true) {
      return {
        success: false,
        filePath: null,
        error: new Error(typeof validationResult === 'string' ? validationResult : 'Arquivo inválido')
      };
    }
  }
  
  // Generate sanitized file path
  const filePath = generateUniqueFilePath(folderPath, file.name);
  
  const uploadWithTimeout = async (): Promise<{ data: any, error: any }> => {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Upload file with Supabase
      const uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      clearTimeout(timeoutId);
      return uploadResult;
    } catch (error) {
      clearTimeout(timeoutId);
      return { data: null, error };
    }
  };
  
  // Retry logic
  while (retries <= maxRetries) {
    try {
      // If not first attempt, delay before retrying (exponential backoff)
      if (retries > 0) {
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (onProgress) {
          onProgress(Math.min((retries / maxRetries) * 100, 95));
        }
      }
      
      const { data, error } = await uploadWithTimeout();
      
      // If successful, return the result
      if (!error) {
        if (onProgress) onProgress(100);
        
        return {
          success: true,
          filePath,
          error: null,
          retries
        };
      }
      
      // If reached max retries, throw the last error
      if (retries === maxRetries) {
        console.error(`Upload failed after ${maxRetries} retries:`, error);
        let errorMessage = "Falha no upload após várias tentativas.";
        
        // Improve error message based on error type
        if (error.message?.includes("invalid key")) {
          errorMessage = "Nome de arquivo inválido. Renomeie o arquivo removendo caracteres especiais e espaços.";
        } else if (error.message?.includes("permission denied")) {
          errorMessage = "Permissão negada para fazer upload. Entre em contato com o suporte.";
        }
        
        throw new Error(errorMessage);
      }
      
      console.log(`Upload attempt ${retries + 1} failed, retrying...`, error);
      retries++;
    } catch (error) {
      return {
        success: false,
        filePath: null,
        error: error instanceof Error ? error : new Error("Erro desconhecido no upload"),
        retries
      };
    }
  }
  
  // This should not be reached, but just in case
  return {
    success: false,
    filePath: null,
    error: new Error("Erro no processo de upload"),
    retries
  };
}

/**
 * React hook for file uploads with toast notifications
 */
export function useFileUploader() {
  const { toast } = useToast();
  
  const uploadFile = async (
    file: File, 
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> => {
    try {
      const result = await uploadFileWithRetry(file, options);
      
      if (!result.success) {
        toast({
          title: "Erro no upload",
          description: result.error?.message || "Falha ao fazer upload do arquivo.",
          variant: "destructive"
        });
      } else if (result.retries && result.retries > 0) {
        toast({
          title: "Upload concluído",
          description: `Upload bem-sucedido após ${result.retries} tentativas.`
        });
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      return {
        success: false,
        filePath: null,
        error: error instanceof Error ? error : new Error("Erro desconhecido")
      };
    }
  };
  
  return { uploadFile };
}

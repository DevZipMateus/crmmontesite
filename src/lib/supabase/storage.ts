
import { supabase } from "@/integrations/supabase/client";

/**
 * Get signed URL for personalization files
 * @param filePath Path to the file in storage or object containing url property
 * @param bucket Storage bucket name (defaults to 'site_personalizacoes')
 * @param expiresIn Expiration time in seconds (defaults to 3600 = 1 hour)
 * @returns Signed URL or null if error
 */
export async function getSignedUrl(filePath: string | { url: string; caption?: string }, bucket: string = 'site_personalizacoes', expiresIn: number = 3600) {
  if (!filePath) {
    console.error('getSignedUrl: No file path provided');
    return null;
  }
  
  try {
    // Extract the actual path string if filePath is an object
    let actualPath: string;
    
    if (typeof filePath === 'string') {
      actualPath = filePath;
    } else if (typeof filePath === 'object' && filePath.url) {
      actualPath = filePath.url;
    } else {
      console.error('getSignedUrl: Invalid file path format:', filePath);
      return null;
    }
    
    // Normalize the path by removing duplicate slashes
    const normalizedPath = actualPath.replace(/\/\/+/g, '/');
    
    console.log(`Generating signed URL for: ${normalizedPath} (bucket: ${bucket})`);
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(normalizedPath, expiresIn);
    
    if (error) {
      console.error(`Error generating signed URL for file (bucket: ${bucket}, path: ${normalizedPath}):`, error);
      return null;
    }
    
    return data.signedUrl;
  } catch (err) {
    console.error(`Error processing signed URL request:`, err);
    return null;
  }
}

/**
 * Check if a file exists in the storage
 * @param filePath Path to the file in storage or object containing url property
 * @param bucket Storage bucket name (defaults to 'site_personalizacoes')
 * @returns Boolean indicating if file exists
 */
export async function checkFileExists(filePath: string | { url: string; caption?: string }, bucket: string = 'site_personalizacoes') {
  if (!filePath) {
    console.error('checkFileExists: No file path provided');
    return false;
  }
  
  try {
    // Extract the actual path string if filePath is an object
    let actualPath: string;
    
    if (typeof filePath === 'string') {
      actualPath = filePath;
    } else if (typeof filePath === 'object' && filePath.url) {
      actualPath = filePath.url;
    } else {
      console.error('checkFileExists: Invalid file path format:', filePath);
      return false;
    }
    
    // Normalize the path by removing duplicate slashes
    const normalizedPath = actualPath.replace(/\/\/+/g, '/');
    
    console.log(`Checking if file exists: ${normalizedPath} (bucket: ${bucket})`);
    
    // Split the path into directory and filename
    const pathParts = normalizedPath.split('/');
    const fileName = pathParts.pop() || '';
    const directory = pathParts.join('/');
    
    // First try to list the directory containing the file
    if (directory) {
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from(bucket)
        .list(directory, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
        
      if (fileError) {
        console.error(`Error listing directory (bucket: ${bucket}, directory: ${directory}):`, fileError);
      } else if (fileData && fileData.length > 0) {
        // Check if the file exists in the directory
        const fileExists = fileData.some(file => file.name === fileName);
        if (fileExists) {
          console.log(`File found in directory listing: ${normalizedPath}`);
          return true;
        }
      }
    }
    
    // Fallback method: Try to get public URL and check if it's accessible
    const { data } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(normalizedPath);
    
    if (data && data.publicUrl) {
      try {
        console.log(`Checking public URL accessibility for: ${normalizedPath}`);
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        const exists = response.ok;
        console.log(`File exists check result: ${exists} for ${normalizedPath}`);
        return exists;
      } catch (fetchErr) {
        console.error(`Error checking file URL accessibility: ${normalizedPath}`, fetchErr);
        return false;
      }
    }
    
    return false;
  } catch (err) {
    console.error(`Error checking if file exists:`, err);
    return false;
  }
}

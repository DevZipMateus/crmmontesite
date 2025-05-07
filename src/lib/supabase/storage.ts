
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
    
    // Remove any leading slashes to avoid double slashes
    if (actualPath.startsWith('/')) {
      actualPath = actualPath.substring(1);
    }
    
    console.log(`Generating signed URL for: ${actualPath} (bucket: ${bucket})`);
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(actualPath, expiresIn);
    
    if (error) {
      console.error(`Error generating signed URL for file (bucket: ${bucket}, path: ${actualPath}):`, error);
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
    
    // Remove any leading slashes to avoid double slashes
    if (actualPath.startsWith('/')) {
      actualPath = actualPath.substring(1);
    }
    
    console.log(`Checking if file exists: ${actualPath} (bucket: ${bucket})`);
    
    // First get the public URL for the file
    const publicUrlResponse = supabase
      .storage
      .from(bucket)
      .getPublicUrl(actualPath);
    
    // The getPublicUrl method doesn't return an error property,
    // it always returns a data object with publicUrl
    const publicUrl = publicUrlResponse.data.publicUrl;
    
    try {
      // Try to fetch the URL to see if it exists
      const response = await fetch(publicUrl, { method: 'HEAD' });
      return response.ok;
    } catch (fetchError) {
      console.error(`Error fetching file URL for existence check:`, fetchError);
      return false;
    }
  } catch (err) {
    console.error(`Error in checkFileExists:`, err);
    return false;
  }
}

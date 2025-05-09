
/**
 * File sanitization utility to ensure file names are compatible with storage services
 */

/**
 * Sanitizes a file name by removing special characters, spaces, and accents
 * @param fileName Original file name
 * @returns Sanitized file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return "";
  
  // Get file extension
  const lastDot = fileName.lastIndexOf('.');
  const extension = lastDot >= 0 ? fileName.substring(lastDot) : '';
  const baseName = lastDot >= 0 ? fileName.substring(0, lastDot) : fileName;
  
  // Remove accents/diacritics
  const withoutAccents = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Remove special characters and spaces, replace with underscores
  const sanitized = withoutAccents
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
  
  // Ensure the filename is not too long (max 100 chars)
  const truncated = sanitized.substring(0, 100);
  
  return truncated + extension.toLowerCase();
}

/**
 * Generate a unique file path for storage
 * @param folderPath Base folder path
 * @param fileName Original file name
 * @returns Unique sanitized file path
 */
export function generateUniqueFilePath(folderPath: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFileName(fileName);
  return `${folderPath.replace(/^\/+|\/+$/g, '')}/${timestamp}_${sanitized}`;
}

/**
 * Validates file size
 * @param file File object
 * @param maxSizeMB Maximum size in MB
 * @returns Boolean indicating if file is valid
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

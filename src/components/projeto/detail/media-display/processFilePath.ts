
/**
 * Processes the file path and extracts displayName, fileName, and caption
 */
export interface FilePathInfo {
  displayName: string;
  fileName: string;
  captionText: string;
}

export const processFilePath = (
  filePath: string | { url: string; caption?: string },
  type: 'logo' | 'midia' | 'depoimento',
  index?: number,
  caption?: string
): FilePathInfo => {
  let displayName = '';
  let fileName = '';
  let captionText = caption || '';
  
  if (typeof filePath === 'string') {
    // Check if filePath is a JSON string
    if (filePath.startsWith('{') || filePath.startsWith('[')) {
      try {
        const parsed = JSON.parse(filePath);
        if (parsed && typeof parsed === 'object') {
          captionText = parsed.caption || caption || '';
          const path = parsed.url || '';
          fileName = path.split('/').pop() || '';
          displayName = captionText || `${type} ${(index !== undefined) ? index + 1 : ''}`;
        } else {
          displayName = caption || `${type} ${(index !== undefined) ? index + 1 : ''}`;
          fileName = filePath.split('/').pop() || displayName;
        }
      } catch (e) {
        displayName = caption || `${type} ${(index !== undefined) ? index + 1 : ''}`;
        fileName = filePath.split('/').pop() || displayName;
      }
    } else {
      displayName = caption || `${type} ${(index !== undefined) ? index + 1 : ''}`;
      fileName = filePath.split('/').pop() || displayName;
    }
  } else if (filePath && typeof filePath === 'object') {
    captionText = filePath.caption || caption || '';
    displayName = captionText || `${type} ${(index !== undefined) ? index + 1 : ''}`;
    const path = filePath.url || '';
    fileName = path.split('/').pop() || displayName;
  }

  return {
    displayName,
    fileName,
    captionText,
  };
};

/**
 * Checks if file is an image based on its extension
 */
export const isImageFile = (fileName: string): boolean => {
  return fileName ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName) : false;
};

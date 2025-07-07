export interface ConversionOptions {
  outputFormat: 'jpeg' | 'png';
  quality: number; // 0.1 to 1.0 for JPEG
}

export interface ConversionResult {
  blob: Blob;
  newFileName: string;
  originalFormat: string;
  converted: boolean;
}

export class ImageConversionService {
  private static supportedInputFormats = ['webp', 'svg', 'gif', 'bmp', 'tiff', 'avif'];

  static async convertImage(
    imageBlob: Blob,
    originalFileName: string,
    options: ConversionOptions = { outputFormat: 'jpeg', quality: 0.9 }
  ): Promise<ConversionResult> {
    try {
      const originalFormat = this.getFileExtension(originalFileName).toLowerCase();
      
      // Check if conversion is needed
      if (!this.needsConversion(originalFormat)) {
        return {
          blob: imageBlob,
          newFileName: originalFileName,
          originalFormat,
          converted: false
        };
      }

      // Create image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Load image
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            ctx.drawImage(img, 0, 0);

            // Convert to desired format
            const mimeType = `image/${options.outputFormat}`;
            const quality = options.outputFormat === 'jpeg' ? options.quality : undefined;

            canvas.toBlob((convertedBlob) => {
              URL.revokeObjectURL(imageUrl);
              
              if (!convertedBlob) {
                reject(new Error('Failed to convert image'));
                return;
              }

              const newFileName = this.getNewFileName(originalFileName, options.outputFormat);
              
              resolve({
                blob: convertedBlob,
                newFileName,
                originalFormat,
                converted: true
              });
            }, mimeType, quality);
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(error);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Failed to load image for conversion'));
        };

        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Image conversion error:', error);
      // Return original if conversion fails
      return {
        blob: imageBlob,
        newFileName: originalFileName,
        originalFormat: this.getFileExtension(originalFileName).toLowerCase(),
        converted: false
      };
    }
  }

  private static needsConversion(fileExtension: string): boolean {
    return this.supportedInputFormats.includes(fileExtension);
  }

  private static getFileExtension(fileName: string): string {
    const match = fileName.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  }

  private static getNewFileName(originalFileName: string, newFormat: 'jpeg' | 'png'): string {
    const nameWithoutExtension = originalFileName.replace(/\.[^.]+$/, '');
    const extension = newFormat === 'jpeg' ? 'jpg' : 'png';
    return `${nameWithoutExtension}.${extension}`;
  }

  static getConvertibleFormats(fileNames: string[]): string[] {
    return fileNames
      .map(name => this.getFileExtension(name).toLowerCase())
      .filter(ext => this.needsConversion(ext))
      .filter((ext, index, arr) => arr.indexOf(ext) === index); // unique
  }
}

import React, { useState, useEffect } from "react";
import { MediaLoadingState } from "./media-display/MediaLoadingState";
import { MediaErrorState } from "./media-display/MediaErrorState";
import { ImageDisplay } from "./media-display/ImageDisplay";
import { FileDisplay } from "./media-display/FileDisplay";
import { MediaActions } from "./media-display/MediaActions";
import { MediaInfo } from "./media-display/MediaInfo";
import { processFilePath, isImageFile } from "./media-display/processFilePath";
import { getSignedUrl } from "@/lib/supabase/storage";

interface MediaFileDisplayProps {
  filePath: string | { url: string; caption?: string };
  type: 'logo' | 'midia' | 'depoimento';
  caption?: string;
  index?: number;
  getFileUrl: (path: string | { url: string; caption?: string }) => Promise<string | null>;
}

export const MediaFileDisplay: React.FC<MediaFileDisplayProps> = ({ 
  filePath, 
  type, 
  caption, 
  index, 
  getFileUrl 
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        if (!filePath) {
          console.error("No file path provided");
          setIsError(true);
          setIsLoading(false);
          return;
        }
        
        console.log(`Fetching URL for media:`, filePath);
        
        // Process the filePath (could be a string, JSON string, or object)
        let path: string | { url: string; caption?: string } = filePath;
        
        // If filePath is a string that looks like JSON, try to parse it
        if (typeof filePath === 'string' && (filePath.startsWith('{') || filePath.startsWith('['))) {
          try {
            const parsed = JSON.parse(filePath);
            path = parsed;
            console.log("Parsed JSON string to object:", path);
          } catch (parseError) {
            console.log("Not a valid JSON string, using as-is");
          }
        }
        
        // Get the URL using the imported utility function from storage.ts
        const url = await getSignedUrl(path);
        console.log("Generated URL:", url);
        
        if (!url) {
          console.error("Failed to get signed URL for", path);
          setIsError(true);
        } else {
          setFileUrl(url);
        }
      } catch (err) {
        console.error("Error fetching file URL:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUrl();
  }, [filePath]);

  // Display loading state
  if (isLoading) {
    return <MediaLoadingState />;
  }
  
  // Display error state
  if (isError || !fileUrl) {
    return <MediaErrorState filePath={filePath} />;
  }

  // Process file info
  const { displayName, fileName, captionText } = processFilePath(filePath, type, index, caption);
  
  // Check if file is an image
  const isImage = isImageFile(fileName);

  return (
    <div className="flex flex-col">
      <div className="relative group">
        {isImage ? (
          <ImageDisplay 
            fileUrl={fileUrl} 
            displayName={displayName}
            fileName={fileName}
          />
        ) : (
          <FileDisplay 
            fileUrl={fileUrl}
            fileName={fileName}
            displayName={displayName}
          />
        )}
      </div>
      <div className="flex flex-col mt-1">
        <MediaInfo displayName={displayName} captionText={captionText} />
        <MediaActions fileUrl={fileUrl} fileName={fileName} />
      </div>
    </div>
  );
};

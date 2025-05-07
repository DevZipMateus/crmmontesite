
import React from "react";

interface MediaInfoProps {
  displayName: string;
  captionText?: string;
}

export const MediaInfo: React.FC<MediaInfoProps> = ({ displayName, captionText }) => {
  return (
    <>
      <p className="text-sm text-gray-500 truncate max-w-[150px]" title={displayName}>
        {displayName}
      </p>
      {captionText && (
        <p className="text-xs text-gray-400 truncate max-w-[150px]" title={captionText}>
          {captionText}
        </p>
      )}
    </>
  );
};


import React from "react";
import { FileIcon } from "lucide-react";

interface FileDisplayProps {
  fileUrl?: string;
  fileName?: string;
  displayName?: string;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({ 
  fileUrl, 
  fileName, 
  displayName 
}) => {
  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
      <FileIcon className="h-8 w-8 text-gray-400" />
      {fileName && <p className="text-xs text-gray-400 mt-2 truncate max-w-full">{fileName}</p>}
    </div>
  );
};

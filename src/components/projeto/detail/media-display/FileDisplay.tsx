
import React from "react";
import { FileIcon } from "lucide-react";

export const FileDisplay: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
      <FileIcon className="h-8 w-8 text-gray-400" />
    </div>
  );
};

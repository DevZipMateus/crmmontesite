
import React from "react";

export const MediaLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32">
      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};

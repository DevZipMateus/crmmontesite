
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMediaSelection } from "./MediaBulkDownloader";

interface MediaCheckboxProps {
  index: number;
  type: 'logo' | 'midia' | 'depoimento';
}

export const MediaCheckbox: React.FC<MediaCheckboxProps> = ({ index, type }) => {
  const { selectedMedia, toggleMediaSelection } = useMediaSelection();

  // Only show checkbox for media type
  if (type !== 'midia') {
    return null;
  }

  const isSelected = selectedMedia.has(index);

  return (
    <div className="absolute top-2 left-2 z-10">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => toggleMediaSelection(index)}
        className="bg-white shadow-md border-2"
      />
    </div>
  );
};

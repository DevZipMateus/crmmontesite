
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="public/ChatGPT Image 15 de abr. de 2025, 15_28_16.png" 
        alt="MonteSite CRM Logo" 
        className={cn(
          "object-contain max-w-full max-h-full"
        )}
      />
    </div>
  );
};

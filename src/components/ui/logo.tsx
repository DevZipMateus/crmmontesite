
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="public/ChatGPT Image 15 de abr. de 2025, 15_28_16.png" 
        alt="MonteSite CRM Logo" 
        className={cn(
          "object-contain max-w-full max-h-full",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

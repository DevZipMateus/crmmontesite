
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto", 
    lg: "h-12 w-auto"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="public/ChatGPT Image 15 de abr. de 2025, 15_28_16.png" 
        alt="MonteSite CRM Logo" 
        className={cn(
          "object-contain",
          sizeClasses[size]
        )}
      />
    </div>
  );
};


import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-[150px] w-[200px]"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/logocrm.png" 
        alt="MonteSite CRM Logo" 
        className={cn(
          "object-contain max-w-full max-h-full",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

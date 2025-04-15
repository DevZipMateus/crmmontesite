
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 512 512" 
          className={cn(
            "text-primary",
            sizeClasses[size]
          )}
          fill="currentColor"
        >
          <path 
            d="M256 48c-55.2 0-100 44.8-100 100v216c0 55.2 44.8 100 100 100s100-44.8 100-100V148c0-55.2-44.8-100-100-100zm0 400c-27.6 0-50-22.4-50-50V148c0-27.6 22.4-50 50-50s50 22.4 50 50v250c0 27.6-22.4 50-50 50z" 
          />
        </svg>
      </div>
      <span className="font-medium text-lg tracking-tight text-foreground">
        CRM MonteSite
      </span>
    </div>
  );
};

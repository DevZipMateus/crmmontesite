
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-12 w-auto",
    md: "h-16 w-auto",
    lg: "h-20 w-auto",
    xl: "h-[200px] w-auto"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Link to="/home">
        <img 
          src="/logo.png" 
          alt="MonteSite CRM Logo" 
          className={cn(
            "object-contain max-w-full max-h-full cursor-pointer hover:opacity-80 transition-opacity",
            sizeClasses[size]
          )}
        />
      </Link>
    </div>
  );
};

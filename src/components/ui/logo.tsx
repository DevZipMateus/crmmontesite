
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
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 640 512"
        className={cn(
          "text-primary",
          sizeClasses[size]
        )}
        fill="currentColor"
      >
        <path d="M224 88c0-13.3 10.7-24 24-24h8c13.3 0 24 10.7 24 24v48h48V88c0-13.3 10.7-24 24-24h8c13.3 0 24 10.7 24 24v48h32V88c0-39.8-32.2-72-72-72h-8c-22.1 0-41.8 9.9-55.1 25.6C267.6 25.9 247.9 16 225.9 16h-8c-39.8 0-72 32.2-72 72v48h32V88zm32 240V224H384v104c0 13.3-10.7 24-24 24H280c-13.3 0-24-10.7-24-24zm-56-64V224H72c-22.1 0-40 17.9-40 40v168c0 22.1 17.9 40 40 40h496c22.1 0 40-17.9 40-40V264c0-22.1-17.9-40-40-40H440v40c0 39.8-32.2 72-72 72h-80c-39.8 0-72-32.2-72-72z"/>
        <path d="M400 336c0 8.8-7.2 16-16 16H256c-8.8 0-16-7.2-16-16v-96c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16v96zM104 320h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16zm0 64h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16zm304-64h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16zm0 64h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16zM104 192h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16zm304 0h64c8.8 0 16-7.2 16-16s-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16s7.2 16 16 16z"/>
      </svg>
    </div>
  );
};

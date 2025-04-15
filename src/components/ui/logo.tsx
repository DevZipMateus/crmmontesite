
import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary opacity-20 rounded-full blur-sm"></div>
        <div className="relative bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-full shadow-sm flex items-center justify-center">
          <span className={`${sizeClasses[size]} aspect-square flex items-center justify-center px-1`}>MS</span>
        </div>
      </div>
      <span className="font-medium tracking-tight text-lg">MonteSite</span>
    </div>
  );
};

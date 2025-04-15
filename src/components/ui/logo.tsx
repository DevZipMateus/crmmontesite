
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
        <div className="absolute inset-0 bg-primary opacity-20 rounded-lg blur-sm"></div>
        <div className="relative bg-gradient-to-r from-primary/80 to-blue-500/80 text-white font-bold rounded-lg p-1.5 shadow-lg flex items-center justify-center">
          <span className={`${sizeClasses[size]}`}>MS</span>
        </div>
      </div>
      <span className="font-semibold tracking-tight text-lg">MonteSite</span>
    </div>
  );
};

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSavedAt: Date | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  lastSavedAt,
  className
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 10) return 'agora';
    if (seconds < 60) return `há ${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    return `há ${hours}h`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm transition-opacity",
      className
    )}>
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">
            Salvo {getTimeAgo(lastSavedAt)}
          </span>
        </>
      ) : null}
    </div>
  );
};

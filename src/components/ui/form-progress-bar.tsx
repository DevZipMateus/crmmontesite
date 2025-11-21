import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressBarProps {
  progress: number;
  filledFields?: number;
  totalFields?: number;
  showDetails?: boolean;
  className?: string;
}

export const FormProgressBar: React.FC<FormProgressBarProps> = ({
  progress,
  filledFields,
  totalFields,
  showDetails = true,
  className
}) => {
  const getProgressColor = () => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProgressMessage = () => {
    if (progress === 100) return 'Formulário completo!';
    if (progress >= 75) return 'Quase lá!';
    if (progress >= 50) return 'Você está no meio do caminho';
    if (progress >= 25) return 'Continue preenchendo';
    return 'Vamos começar!';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {progress === 100 ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn("font-medium", getProgressColor())}>
            {getProgressMessage()}
          </span>
        </div>
        <span className={cn("font-semibold", getProgressColor())}>
          {progress}%
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
      />
      
      {showDetails && filledFields !== undefined && totalFields !== undefined && (
        <p className="text-xs text-muted-foreground text-center">
          {filledFields} de {totalFields} campos preenchidos
        </p>
      )}
    </div>
  );
};


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Images } from 'lucide-react';
import { usePendingSubmissions } from '@/hooks/usePendingSubmissions';

interface PendingSubmissionsIndicatorProps {
  projectId: string;
}

export const PendingSubmissionsIndicator: React.FC<PendingSubmissionsIndicatorProps> = ({ projectId }) => {
  const { pendingCount, loading } = usePendingSubmissions(projectId);

  if (loading || pendingCount === 0) {
    return null;
  }

  return (
    <div className="pt-1 sm:pt-2">
      <Badge 
        variant="outline" 
        className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
        title={`${pendingCount} imagem(ns) pendente(s) do cliente`}
      >
        <Images className="h-3 w-3 mr-1" />
        {pendingCount} imagem{pendingCount !== 1 ? 's' : ''} pendente{pendingCount !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
};

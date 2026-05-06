import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  'Site pronto': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Victor': 'bg-blue-50 text-blue-700 border-blue-200',
  'Recebido': 'bg-violet-50 text-violet-700 border-violet-200',
  'Davi': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sem retorno': 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground border-border';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'Site pronto' ? 'bg-emerald-500' :
        status === 'Victor' ? 'bg-blue-500' :
        status === 'Recebido' ? 'bg-violet-500' :
        status === 'Davi' ? 'bg-amber-500' :
        status === 'Sem retorno' ? 'bg-red-500' :
        'bg-muted-foreground'
      }`} />
      {status}
    </span>
  );
}

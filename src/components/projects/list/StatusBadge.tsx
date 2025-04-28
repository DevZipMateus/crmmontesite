
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Função para determinar a cor do badge baseado no status
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Site pronto':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Criando site':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Recebido':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Configurando Domínio':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Aguardando DNS':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(status)}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}

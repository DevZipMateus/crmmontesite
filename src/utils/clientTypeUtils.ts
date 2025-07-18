
export interface ClientTypeInfo {
  type: 'cliente_final' | 'parceiro' | 'cliente_parceiro' | 'outbound';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  cardBgColor: string; // Nova propriedade para o fundo do card
}

export function getClientTypeInfo(project: {
  client_type?: string;
  project_source?: string;
  partner_hash?: string;
}): ClientTypeInfo {
  // Se tem partner_hash, é cliente de parceiro
  if (project.partner_hash) {
    return {
      type: 'cliente_parceiro',
      label: 'Cliente de Parceiro',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-500',
      cardBgColor: 'bg-orange-50'
    };
  }

  // Se client_type é 'parceiro', é parceiro direto
  if (project.client_type?.toLowerCase() === 'parceiro') {
    return {
      type: 'parceiro',
      label: 'Parceiro',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      cardBgColor: 'bg-green-50'
    };
  }

  // Se client_type é 'outbound', é outbound (prioridade sobre project_source)
  if (project.client_type?.toLowerCase() === 'outbound') {
    return {
      type: 'outbound',
      label: 'Outbound',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500',
      cardBgColor: 'bg-purple-50'
    };
  }

  // Se project_source é 'outbound', é outbound (fallback para compatibilidade)
  if (project.project_source?.toLowerCase() === 'outbound') {
    return {
      type: 'outbound',
      label: 'Outbound',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500',
      cardBgColor: 'bg-purple-50'
    };
  }

  // Padrão: cliente final
  return {
    type: 'cliente_final',
    label: 'Cliente Final',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    cardBgColor: 'bg-blue-50'
  };
}


export interface ClientTypeInfo {
  type: 'cliente_final' | 'parceiro' | 'cliente_parceiro' | 'outbound';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
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
      borderColor: 'border-orange-500'
    };
  }

  // Se client_type é 'parceiro', é parceiro direto
  if (project.client_type?.toLowerCase() === 'parceiro') {
    return {
      type: 'parceiro',
      label: 'Parceiro',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500'
    };
  }

  // Se project_source é 'outbound', é outbound
  if (project.project_source?.toLowerCase() === 'outbound') {
    return {
      type: 'outbound',
      label: 'Outbound',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500'
    };
  }

  // Padrão: cliente final
  return {
    type: 'cliente_final',
    label: 'Cliente Final',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500'
  };
}

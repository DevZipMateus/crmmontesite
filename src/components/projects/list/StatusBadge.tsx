
interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === 'Site pronto'
        ? 'bg-green-100 text-green-800'
        : status === 'Criando site'
        ? 'bg-blue-100 text-blue-800'
        : status === 'Recebido'
        ? 'bg-purple-100 text-purple-800'
        : status === 'Configurando Domínio'
        ? 'bg-amber-100 text-amber-800'
        : status === 'Aguardando DNS'
        ? 'bg-orange-100 text-orange-800'
        : 'bg-gray-100 text-gray-800'
    }`}>
      {status}
    </span>
  );
}

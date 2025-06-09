
import { useState } from "react";
import { ApiForm } from "./api-management/ApiForm";
import { ApiTable } from "./api-management/ApiTable";
import { QuickSetupGuide } from "./api-management/QuickSetupGuide";
import { ApiEndpoint } from "./api-management/types";

export const ApiManagement = () => {
  // Mock data - em produção isso viria do backend
  const [apis, setApis] = useState<ApiEndpoint[]>([
    {
      id: '1',
      name: 'Notificação de Status',
      url: 'https://parceiro.com/webhook/status',
      description: 'Envia atualizações de status dos projetos',
      method: 'POST',
      status: 'active',
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Confirmação de Recebimento',
      url: 'https://parceiro.com/webhook/confirm',
      description: 'Confirma recebimento de novos dados',
      method: 'POST',
      status: 'inactive',
      lastTested: '2024-01-10T14:20:00Z'
    }
  ]);

  const handleEdit = (api: ApiEndpoint) => {
    // This will be handled by the ApiForm component
    console.log('Edit API:', api);
  };

  return (
    <div className="space-y-6">
      <ApiForm apis={apis} setApis={setApis} />
      <ApiTable apis={apis} setApis={setApis} onEdit={handleEdit} />
      <QuickSetupGuide />
    </div>
  );
};

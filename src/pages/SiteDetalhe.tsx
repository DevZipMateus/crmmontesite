
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

export default function SiteDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <PageLayout 
      title="Detalhes do Site"
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate(`/projeto/${id}/editar`)}
          className="flex items-center gap-2 shadow-sm"
        >
          <Edit className="h-4 w-4" /> Editar
        </Button>
      }
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={() => navigate('/projetos')}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
        </Button>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Carregando informações do site...</p>
      </div>
    </PageLayout>
  );
}

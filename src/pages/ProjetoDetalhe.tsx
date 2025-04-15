
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <PageLayout 
      title="Detalhes do Projeto"
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
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500">Carregando detalhes do projeto...</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

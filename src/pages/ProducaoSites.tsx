
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Construction } from "lucide-react";

export default function ProducaoSites() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Produção de Sites">
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Construction className="h-16 w-16 mb-6 text-primary/40" />
        <h2 className="text-2xl font-semibold mb-2">Em construção</h2>
        <p className="mb-6">Esta funcionalidade está sendo desenvolvida.</p>
        <Button onClick={() => navigate("/projetos")}>
          Voltar para Projetos
        </Button>
      </div>
    </PageLayout>
  );
}

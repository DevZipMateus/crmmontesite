
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Construction } from "lucide-react";

export default function ProducaoSites() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Produção de Sites">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-apple text-center">
          <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Em construção</h2>
          <p className="mb-6 text-muted-foreground">Esta funcionalidade está sendo desenvolvida.</p>
          <Button 
            onClick={() => navigate("/projetos")}
            className="bg-primary hover:bg-primary/90 shadow-sm"
          >
            Voltar para Projetos
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

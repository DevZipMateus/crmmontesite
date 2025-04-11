
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ProjetoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Aqui será implementado o formulário de edição do projeto {id}.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/projeto/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Em desenvolvimento",
                  description: "Esta funcionalidade será implementada em breve.",
                });
                navigate("/projetos");
              }}
            >
              Voltar para Projetos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

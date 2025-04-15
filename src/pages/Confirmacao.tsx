
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";

export default function Confirmacao() {
  const navigate = useNavigate();
  return (
    <div className="container py-12 max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Personalização Enviada!</CardTitle>
          <CardDescription>
            Suas informações foram recebidas com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Agradecemos por nos fornecer os detalhes da sua empresa. Nossa equipe irá utilizar essas informações para criar o seu site personalizado.</p>
          <p className="mb-6">
            Você receberá uma notificação assim que seu site estiver pronto para revisão.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/personalize-site")}
            >
              Voltar ao Formulário
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')}
              className="ml-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/projetos")}>
              Ver Projetos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

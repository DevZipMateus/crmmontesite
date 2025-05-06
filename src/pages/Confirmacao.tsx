
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Home, ArrowLeft, FileText } from "lucide-react";

export default function Confirmacao() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4 sm:px-6">
      <Card className="text-center border-gray-100 shadow-sm max-w-md w-full">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Personalização Enviada!</CardTitle>
          <CardDescription className="text-gray-500">
            Suas informações foram recebidas com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="mb-6 text-gray-600">Agradecemos por nos fornecer os detalhes da sua empresa. Nossa equipe irá utilizar essas informações para criar o seu site personalizado.</p>
          <p className="mb-8 text-gray-600">
            Você receberá uma notificação assim que seu site estiver pronto para revisão.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 px-6 pb-6 pt-0">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = "https://montesite.com.br"}
          >
            <Home className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/formulario/padrao")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Enviar Outro Formulário
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

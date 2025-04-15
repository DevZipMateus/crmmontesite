import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Detalhes do Projeto</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Existing project details code */}
    </div>
  );
}

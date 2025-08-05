import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VendedorManagerProps {
  vendedores: string[];
  onVendedoresChange: (vendedores: string[]) => void;
}

const VendedorManager: React.FC<VendedorManagerProps> = ({ 
  vendedores, 
  onVendedoresChange 
}) => {
  const [novoVendedor, setNovoVendedor] = useState("");

  const handleAddVendedor = () => {
    if (!novoVendedor.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o vendedor",
        variant: "destructive"
      });
      return;
    }

    if (vendedores.includes(novoVendedor.trim())) {
      toast({
        title: "Erro",
        description: "Este vendedor já existe",
        variant: "destructive"
      });
      return;
    }

    const novosVendedores = [...vendedores, novoVendedor.trim()];
    onVendedoresChange(novosVendedores);
    setNovoVendedor("");
    
    toast({
      title: "Sucesso",
      description: "Vendedor adicionado com sucesso"
    });
  };

  const handleRemoveVendedor = (vendedor: string) => {
    const novosVendedores = vendedores.filter(v => v !== vendedor);
    onVendedoresChange(novosVendedores);
    
    toast({
      title: "Sucesso",
      description: "Vendedor removido com sucesso"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Vendedores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome do vendedor"
            value={novoVendedor}
            onChange={(e) => setNovoVendedor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddVendedor()}
          />
          <Button onClick={handleAddVendedor} disabled={!novoVendedor.trim()}>
            <Plus size={16} className="mr-2" />
            Adicionar
          </Button>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vendedores cadastrados:</h4>
          <div className="flex flex-wrap gap-2">
            {vendedores.map((vendedor) => (
              <Badge key={vendedor} variant="secondary" className="flex items-center gap-1">
                {vendedor}
                <button
                  onClick={() => handleRemoveVendedor(vendedor)}
                  className="ml-1 hover:text-red-500"
                  title="Remover vendedor"
                >
                  <Trash2 size={12} />
                </button>
              </Badge>
            ))}
          </div>
          {vendedores.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum vendedor cadastrado</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendedorManager;
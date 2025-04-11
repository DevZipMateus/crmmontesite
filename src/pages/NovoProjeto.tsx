
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Novo Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Aqui será implementado o formulário de cadastro de novos projetos.
          </p>
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
        </CardContent>
      </Card>
    </div>
  );
}

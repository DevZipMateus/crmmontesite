
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonalizeForm } from "@/components/site-personalize/PersonalizeForm";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function PersonalizeSite() {
  const params = useParams();
  const modeloSelecionado = params.modelo || "Modelo 1";

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        breadcrumbs={[
          { label: "Início", href: "/home" },
          { label: "Formulário Avulso" },
        ]}
        actions={
          <Badge variant="outline" className="gap-1.5 text-xs">
            <FileText className="h-3 w-3" />
            Modelo: {modeloSelecionado}
          </Badge>
        }
      />

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold">Formulário de Cliente Avulso</CardTitle>
              <CardDescription>
                Preencha as informações da empresa para personalizar o site. O progresso é salvo automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalizeForm modeloSelecionado={modeloSelecionado} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

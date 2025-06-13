
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Palette } from "lucide-react";
import NovoProjeto from "./NovoProjeto";
import PersonalizeSite from "./PersonalizeSite";

export default function CriarProjetos() {
  return (
    <PageLayout 
      title="Criar Projetos"
      contentClass="bg-gray-50/50"
    >
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="novo-projeto" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="novo-projeto" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Novo Projeto
            </TabsTrigger>
            <TabsTrigger value="personalizar-site" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Personalizar Site
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="novo-projeto" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Adicionar Novo Site</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Importe documentos ou crie um projeto manualmente</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <NovoProjeto />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personalizar-site" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Personalizar Site</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Configure modelos e personalize sites para clientes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <PersonalizeSite />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

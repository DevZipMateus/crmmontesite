
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
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-10 sm:h-12">
            <TabsTrigger value="novo-projeto" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Novo Projeto</span>
              <span className="sm:hidden">Novo</span>
            </TabsTrigger>
            <TabsTrigger value="personalizar-site" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Personalizar Site</span>
              <span className="sm:hidden">Personalizar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="novo-projeto" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                    <FileUp className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl">Adicionar Novo Site</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Importe documentos ou crie um projeto manualmente</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                  <NovoProjeto />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personalizar-site" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                    <Palette className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl">Personalizar Site</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure modelos e personalize sites para clientes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
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

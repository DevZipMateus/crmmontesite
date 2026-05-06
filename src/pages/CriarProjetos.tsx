
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
import PersonalizeSite from "./PersonalizeSite";

export default function CriarProjetos() {
  return (
    <PageLayout 
      title="Criar Projetos"
      contentClass="bg-gray-50/50"
    >
      <div className="max-w-6xl mx-auto">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                <Palette className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">Personalizar Site</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure e personalize sites para clientes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <PersonalizeSite />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

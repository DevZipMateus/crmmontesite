
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomUrlManager from "@/components/site-personalize/CustomUrlManager";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default function CustomUrlAdmin() {
  const navigate = useNavigate();
  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-4xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/home')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold">Gerenciamento de URLs Personalizadas</h1>
          <p className="text-gray-500 mt-1">
            Configure URLs personalizadas para formulários de modelos de sites
          </p>
        </div>

        <div className="mb-8">
          <CustomUrlManager baseUrl={baseUrl} />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-1">Como usar URLs personalizadas</h3>
          <p className="text-sm text-blue-700">
            As URLs personalizadas permitem criar links mais amigáveis e memoráveis para seus formulários.
            Por exemplo, em vez de usar "/formulario/modelo1", você pode usar "/formulario/contabil".
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Para adicionar uma nova URL personalizada, selecione o modelo desejado e digite a URL personalizada no campo acima.
          </p>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

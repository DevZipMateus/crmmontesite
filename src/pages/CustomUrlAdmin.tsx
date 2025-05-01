
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

      <main className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/home')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold">Gerenciamento de Modelos e URLs</h1>
          <p className="text-gray-500 mt-1">
            Crie, edite e gerencie modelos de sites e suas URLs personalizadas
          </p>
        </div>

        <div className="mb-8">
          <CustomUrlManager baseUrl={baseUrl} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}


import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainMenuSection: React.FC = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      title: "Gerenciar Projetos",
      description: "Visualize, edite e gerencie todos os projetos de sites.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      action: () => navigate("/projetos"),
      buttonText: "Ver Projetos",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      title: "Adicionar Site",
      description: "Crie um novo site para um cliente.",
      icon: <PlusCircle className="h-8 w-8 text-green-600" />,
      action: () => navigate("/novo-projeto"),
      buttonText: "Adicionar Site",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Personalização de Sites",
      description: "Personalize as informações e conteúdo dos sites.",
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      action: () => navigate("/personalize-site"),
      buttonText: "Personalizar",
      bgGradient: "from-blue-50 to-sky-50"
    },
    {
      title: "Produção de Sites",
      description: "Acompanhe o status de produção dos sites.",
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      action: () => navigate("/producao-sites"),
      buttonText: "Ver Produção",
      bgGradient: "from-purple-50 to-fuchsia-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
      {menuItems.map((item, index) => (
        <Card 
          key={index} 
          className={`border border-gray-100 shadow-sm hover:shadow-md transition-all bg-gradient-to-br ${item.bgGradient}`}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                {item.icon}
              </div>
              <CardTitle>{item.title}</CardTitle>
            </div>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button onClick={item.action} className="w-full shadow-sm">
              {item.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MainMenuSection;

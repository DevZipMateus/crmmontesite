
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  PlusCircle, 
  Settings, 
  LayoutDashboard, 
  Globe,
  Briefcase
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Gerenciar Projetos",
      description: "Visualize, edite e gerencie todos os projetos de sites.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      action: () => navigate("/projetos"),
      buttonText: "Ver Projetos"
    },
    {
      title: "Novo Projeto",
      description: "Crie um novo projeto de site para um cliente.",
      icon: <PlusCircle className="h-8 w-8 text-green-600" />,
      action: () => navigate("/novo-projeto"),
      buttonText: "Criar Projeto"
    },
    {
      title: "Personalização de Sites",
      description: "Personalize as informações e conteúdo dos sites.",
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      action: () => navigate("/personalize-site"),
      buttonText: "Personalizar"
    },
    {
      title: "Produção de Sites",
      description: "Acompanhe o status de produção dos sites.",
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      action: () => navigate("/producao-sites"),
      buttonText: "Ver Produção"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Site Flow Connect</h1>
              <p className="text-gray-500 mt-1">Gerencie e personalize sites de forma eficiente</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={() => navigate("/projetos")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Completo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {item.icon}
                  <CardTitle>{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button onClick={item.action} className="w-full">
                  {item.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sites em Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold">--</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sites Publicados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold">--</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-3xl font-bold">--</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container max-w-7xl mx-auto">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Site Flow Connect - Sistema de Gerenciamento de Sites
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

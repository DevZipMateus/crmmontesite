import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projetos from "./pages/Projetos";
import NovoProjeto from "./pages/NovoProjeto";
import ProjetoDetalhe from "./pages/ProjetoDetalhe";
import ProjetoEditar from "./pages/ProjetoEditar";
import PersonalizeSite from "./pages/PersonalizeSite";
import Confirmacao from "./pages/Confirmacao";
import SiteDetalhe from "./pages/SiteDetalhe";
import ProducaoSites from "./pages/ProducaoSites";
import Login from "./pages/Login";
import AuthGuard from "./components/auth/AuthGuard";
import PublicPersonalizeForm from "./pages/PublicPersonalizeForm";

const queryClient = new QueryClient();

const App = () => {
  // Força o tema claro globalmente
  React.useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Página pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Página de formulário público para clientes - Keep this accessible without authentication */}
            <Route path="/formulario/:modelo" element={<PublicPersonalizeForm />} />
            
            {/* Página de confirmação pública - Keep this accessible without authentication */}
            <Route path="/confirmacao" element={<Confirmacao />} />
            
            {/* Página inicial - acessível apenas após login */}
            <Route path="/home" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            
            {/* Outras rotas protegidas */}
            <Route path="/projetos" element={
              <AuthGuard>
                <Projetos />
              </AuthGuard>
            } />
            <Route path="/novo-projeto" element={
              <AuthGuard>
                <NovoProjeto />
              </AuthGuard>
            } />
            <Route path="/projeto/:id" element={
              <AuthGuard>
                <ProjetoDetalhe />
              </AuthGuard>
            } />
            <Route path="/projeto/:id/editar" element={
              <AuthGuard>
                <ProjetoEditar />
              </AuthGuard>
            } />
            {/* Personalize site routes - default and with model parameter */}
            <Route path="/personalize-site" element={
              <AuthGuard>
                <PersonalizeSite />
              </AuthGuard>
            } />
            <Route path="/personalize-site/:modelo" element={
              <AuthGuard>
                <PersonalizeSite />
              </AuthGuard>
            } />
            <Route path="/site/:id" element={
              <AuthGuard>
                <SiteDetalhe />
              </AuthGuard>
            } />
            <Route path="/producao-sites" element={
              <AuthGuard>
                <ProducaoSites />
              </AuthGuard>
            } />
            
            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

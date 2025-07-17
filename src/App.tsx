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
import CustomUrlAdmin from "./pages/CustomUrlAdmin";
import PersonalizacaoDetalhe from "@/pages/PersonalizacaoDetalhe";
import WebhookManagement from "./pages/WebhookManagement";
import CriarProjetos from "./pages/CriarProjetos";
import LandingPagesVendedores from "./pages/LandingPagesVendedores";
import VendedorLandingForm from "./pages/VendedorLandingForm";
import Leads from "./pages/Leads";

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
            
            {/* Página inicial - acessível apenas após login de admin */}
            <Route path="/home" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            
            {/* Landing Pages para Vendedores */}
            <Route path="/landing-pages-vendedores" element={
              <AuthGuard>
                <LandingPagesVendedores />
              </AuthGuard>
            } />
            
            {/* Formulário público para vendedores */}
            <Route path="/formulario-vendedor" element={<VendedorLandingForm />} />
            
            {/* Nova rota unificada para criar projetos */}
            <Route path="/criar-projetos" element={
              <AuthGuard>
                <CriarProjetos />
              </AuthGuard>
            } />
            
            {/* Gestão de Leads */}
            <Route path="/leads" element={
              <AuthGuard>
                <Leads />
              </AuthGuard>
            } />
            
            {/* Redirect parceiros para webhooks com tab ativa */}
            <Route path="/parceiros" element={<Navigate to="/webhooks?tab=partners" replace />} />
            
            {/* Outras rotas protegidas - todas requerem admin */}
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
            
            {/* Rota para gerenciamento de modelos e URLs personalizadas */}
            <Route path="/custom-urls" element={
              <AuthGuard>
                <CustomUrlAdmin />
              </AuthGuard>
            } />
            
            {/* Rota para gerenciamento de webhooks e configurações */}
            <Route path="/webhooks" element={
              <AuthGuard>
                <WebhookManagement />
              </AuthGuard>
            } />
            
            {/* Add the new route for personalization details */}
            <Route path="/personalizacao/:id" element={<PersonalizacaoDetalhe />} />
            
            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

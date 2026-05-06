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
import LeadFormPage from "./pages/LeadFormPage";
import ProducaoSites from "./pages/ProducaoSites";
import Login from "./pages/Login";
import AuthGuard from "./components/auth/AuthGuard";
import PublicPersonalizeForm from "./pages/PublicPersonalizeForm";
import PersonalizacaoDetalhe from "@/pages/PersonalizacaoDetalhe";
import WebhookManagement from "./pages/WebhookManagement";
import CriarProjetos from "./pages/CriarProjetos";
import Leads from "./pages/Leads";
import ClientSubmissionPage from "./pages/ClientSubmissionPage";
import ProjetosInadimplentes from "./pages/ProjetosInadimplentes";
import TermosEntrega from "./pages/TermosEntrega";
import TermoEntregaForm from "./pages/TermoEntregaForm";

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
            
            {/* Página de formulário de lead - público */}
            <Route path="/formulario/lead/:form_hash" element={<LeadFormPage />} />
            
            {/* Página de confirmação pública - Keep this accessible without authentication */}
            <Route path="/confirmacao" element={<Confirmacao />} />
            
            {/* Página inicial - acessível apenas após login de admin */}
            <Route path="/home" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            
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
            
            {/* Projetos Inadimplentes - Nova rota */}
            <Route path="/projetos-inadimplentes" element={
              <AuthGuard>
                <ProjetosInadimplentes />
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
            
            
            
            {/* Rota para gerenciamento de webhooks e configurações */}
            <Route path="/webhooks" element={
              <AuthGuard>
                <WebhookManagement />
              </AuthGuard>
            } />
            
            {/* Add the new route for personalization details */}
            <Route path="/personalizacao/:id" element={<PersonalizacaoDetalhe />} />
            
            {/* Client submission form - public route */}
            <Route path="/cliente-images/:hash" element={<ClientSubmissionPage />} />
            
            {/* Etapa de Revisão - public form */}
            <Route path="/revisao/:hash" element={<TermoEntregaForm />} />
            
            {/* Etapa de Revisão - admin page */}
            <Route path="/revisoes" element={
              <AuthGuard>
                <TermosEntrega />
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

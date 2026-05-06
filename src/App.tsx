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
import TermosEntrega from "./pages/TermosEntrega";
import TermoEntregaForm from "./pages/TermoEntregaForm";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
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
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/formulario/:modelo" element={<PublicPersonalizeForm />} />
            <Route path="/formulario/lead/:form_hash" element={<LeadFormPage />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
            <Route path="/personalizacao/:id" element={<PersonalizacaoDetalhe />} />
            <Route path="/cliente-images/:hash" element={<ClientSubmissionPage />} />
            <Route path="/revisao/:hash" element={<TermoEntregaForm />} />
            
            {/* Authenticated routes with sidebar layout */}
            <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
              <Route path="/home" element={<Index />} />
              <Route path="/criar-projetos" element={<CriarProjetos />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/parceiros" element={<Navigate to="/webhooks?tab=partners" replace />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/novo-projeto" element={<NovoProjeto />} />
              <Route path="/projeto/:id" element={<ProjetoDetalhe />} />
              <Route path="/projeto/:id/editar" element={<ProjetoEditar />} />
              <Route path="/personalize-site" element={<PersonalizeSite />} />
              <Route path="/personalize-site/:modelo" element={<PersonalizeSite />} />
              <Route path="/site/:id" element={<SiteDetalhe />} />
              <Route path="/producao-sites" element={<ProducaoSites />} />
              <Route path="/webhooks" element={<WebhookManagement />} />
              <Route path="/revisoes" element={<TermosEntrega />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

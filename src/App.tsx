
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/novo-projeto" element={<NovoProjeto />} />
          <Route path="/projeto/:id" element={<ProjetoDetalhe />} />
          <Route path="/projeto/:id/editar" element={<ProjetoEditar />} />
          <Route path="/personalize-site" element={<PersonalizeSite />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/site/:id" element={<SiteDetalhe />} />
          <Route path="/producao-sites" element={<ProducaoSites />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

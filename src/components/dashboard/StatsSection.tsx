
import React, { useEffect, useState } from "react";
import { Briefcase, Globe, CheckCircle2, Users } from "lucide-react";
import StatsItem from "./StatsItem";
import { supabase } from "@/integrations/supabase/client";

// Define type for dashboard stats
interface DashboardStats {
  totalClients: number;
  partnerClients: number;
  finalClients: number;
  sitesInProduction: number;
  sitesPublished: number;
  sitesReady: number;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    partnerClients: 0,
    finalClients: 0,
    sitesInProduction: 0,
    sitesPublished: 0,
    sitesReady: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Get total clients count
        const { count: totalCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        
        // Get partner clients count
        const { count: partnerCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_type', 'parceiro');
        
        // Get final clients count
        const { count: finalCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_type', 'cliente_final');
        
        // Get sites in production count
        const { count: productionCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Criando site');
        
        // Get published sites count (contando os status "Configurando Domínio" e "Aguardando DNS")
        const { count: publishedCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .in('status', ['Configurando Domínio', 'Aguardando DNS']);
          
        // Get sites ready count
        const { count: readyCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Site pronto');
        
        setStats({
          totalClients: totalCount || 0,
          partnerClients: partnerCount || 0,
          finalClients: finalCount || 0,
          sitesInProduction: productionCount || 0,
          sitesPublished: publishedCount || 0,
          sitesReady: readyCount || 0
        });
        
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsItem
          title="Sites em Produção"
          value={stats.sitesInProduction}
          icon={<Briefcase className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          loading={loading}
        />
        <StatsItem
          title="Sites em Configuração"
          value={stats.sitesPublished}
          icon={<Globe className="h-6 w-6 text-orange-600" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          loading={loading}
        />
        <StatsItem
          title="Sites Prontos"
          value={stats.sitesReady}
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          loading={loading}
        />
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatsItem
          title="Parceiros"
          value={stats.partnerClients}
          icon={<Users className="h-6 w-6 text-amber-600" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          loading={loading}
        />
        <StatsItem
          title="Clientes Finais"
          value={stats.finalClients}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default StatsSection;

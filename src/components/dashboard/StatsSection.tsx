import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color?: string;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        const [
          { count: productionCount },
          { count: configCount },
          { count: partnerCount },
          { count: finalCount },
          { count: inadCount },
        ] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["Recebido", "Victor", "Davi"]),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "Configurando Domínio"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("client_type", "parceiro"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("client_type", "cliente_final"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "Inadimplente"),
        ]);

        setStats([
          { label: "Sites em produção", value: productionCount || 0, change: "+3 esta semana", changeType: "positive" },
          { label: "Sites em configuração", value: configCount || 0, change: "estável", changeType: "neutral" },
          { label: "Parceiros", value: partnerCount || 0, change: "+2 este mês", changeType: "positive" },
          { label: "Clientes finais", value: finalCount || 0, change: "+9 este mês", changeType: "positive" },
          { label: "Inadimplentes", value: inadCount || 0, change: inadCount ? `R$ ${((inadCount || 0) * 600).toLocaleString("pt-BR")}` : "—", changeType: inadCount ? "negative" : "neutral" },
        ]);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-border p-5">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
          {stat.change && (
            <div className="flex items-center gap-1">
              {stat.changeType === "positive" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {stat.changeType === "negative" && <TrendingDown className="h-3 w-3 text-red-500" />}
              {stat.changeType === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span
                className={cn(
                  "text-xs font-medium",
                  stat.changeType === "positive" && "text-emerald-600",
                  stat.changeType === "negative" && "text-red-600",
                  stat.changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {stat.change}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsSection;

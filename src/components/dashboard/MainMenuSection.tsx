import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Terminal,
  FileText,
  FileCheck,
  Plug,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { useLeads } from "@/hooks/useLeads";

interface QuickAccessItem {
  icon: React.ElementType;
  label: string;
  href: string;
  subtitle: string;
  stat?: string;
  statLabel?: string;
  isExternal?: boolean;
  variant?: "default" | "green";
}

const MainMenuSection: React.FC = () => {
  const { projects } = useProjects();
  const { data: leads } = useLeads();

  const activeProjects = projects?.filter(
    (p) => p.status !== "Arquivado" && p.status !== "Concluído"
  ).length || 0;

  const inProduction = projects?.filter((p) => p.status === "Recebido").length || 0;

  const items: QuickAccessItem[] = [
    {
      icon: LayoutGrid,
      label: "Ver Projetos",
      href: "/projetos",
      stat: String(activeProjects),
      statLabel: "EM PRODUÇÃO",
      subtitle: `${activeProjects} ativos`,
    },
    {
      icon: Users,
      label: "Gestão de Leads",
      href: "/leads",
      stat: String(leads?.length || 0),
      statLabel: "LEADS ATIVOS",
      subtitle: `${leads?.length || 0} leads`,
    },
    {
      icon: Terminal,
      label: "Gerar Comandos",
      href: "/producao-sites",
      stat: String(inProduction),
      statLabel: "NA FILA",
      subtitle: `${inProduction} prontos para produção`,
    },
    {
      icon: FileText,
      label: "Formulário Avulso",
      href: "/criar-projetos",
      subtitle: "Personalização sem cliente",
    },
    {
      icon: FileCheck,
      label: "Etapa de Revisão",
      href: "/revisoes",
      subtitle: "Termos de entrega",
    },
    {
      icon: Plug,
      label: "Integrações",
      href: "/webhooks",
      subtitle: "eGestor · Blaster · Hostinger",
    },
    {
      icon: ExternalLink,
      label: "Gestão de Layouts",
      href: "https://layouts-importacoes.netlify.app/",
      subtitle: "Google Sheets",
      isExternal: true,
      variant: "green",
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Acesso rápido</h2>
        <span className="text-xs text-muted-foreground">{items.length} áreas</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const content = (
            <div
              className={cn(
                "bg-white rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group",
                item.variant === "green"
                  ? "border-emerald-200 hover:border-emerald-400"
                  : "border-border"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    item.variant === "green"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-primary/5 text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                {item.stat && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{item.stat}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {item.statLabel}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
              {item.isExternal && (
                <ExternalLink className="h-3 w-3 text-muted-foreground mt-1" />
              )}
            </div>
          );

          if (item.isExternal) {
            return (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} to={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MainMenuSection;

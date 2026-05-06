import React from "react";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  "Recebido": "bg-blue-500",
  "Victor": "bg-orange-500",
  "Davi": "bg-purple-500",
  "Em revisão": "bg-yellow-500",
  "Concluído": "bg-emerald-500",
  "Site pronto": "bg-emerald-500",
  "Configurando Domínio": "bg-sky-500",
  "Inadimplente": "bg-red-500",
};

const statusLabels: Record<string, string> = {
  "Recebido": "Recebido",
  "Victor": "Em produção",
  "Davi": "Em produção",
  "Em revisão": "Em revisão",
  "Concluído": "Concluído",
  "Site pronto": "Concluído",
  "Configurando Domínio": "Configurando",
  "Inadimplente": "Inadimplente",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

export function RecentActivityCard() {
  const { projects } = useProjects();

  const recentProjects = [...(projects || [])]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="bg-white rounded-lg border border-border p-5 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Atividade recente</h3>
        <Link to="/projetos" className="text-xs text-primary hover:underline">
          Ver tudo
        </Link>
      </div>

      <div className="space-y-3">
        {recentProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projeto/${project.id}`}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex-shrink-0">
              {(project.responsible_name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {project.client_name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {project.responsible_name || "—"} · {timeAgo(project.updated_at || project.created_at)}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white flex-shrink-0",
                statusColors[project.status] || "bg-gray-400"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {statusLabels[project.status] || project.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

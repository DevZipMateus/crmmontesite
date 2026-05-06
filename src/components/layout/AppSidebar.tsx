import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Users,
  Terminal,
  FileCheck,
  FileText,
  ExternalLink,
  Settings,
  Plug,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useProjects } from "@/hooks/use-projects";
import { useLeads } from "@/hooks/useLeads";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
  isExternal?: boolean;
}

const workspaceItems: NavItem[] = [
  { title: "Início", url: "/home", icon: Home },
  { title: "Projetos", url: "/projetos", icon: LayoutGrid },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Produção", url: "/producao-sites", icon: Terminal },
  { title: "Revisões", url: "/revisoes", icon: FileCheck },
];

const operationsItems: NavItem[] = [
  { title: "Formulário Avulso", url: "/criar-projetos", icon: FileText },
  {
    title: "Gestão de Layouts",
    url: "https://layouts-importacoes.netlify.app/",
    icon: ExternalLink,
    isExternal: true,
  },
];

const systemItems: NavItem[] = [
  { title: "Integrações", url: "/webhooks", icon: Plug },
  { title: "Configurações", url: "/webhooks?tab=partners", icon: Settings },
];

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useLocation();
  const active = !item.isExternal && pathname === item.url;

  if (item.isExternal) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={false}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-3 py-2 text-sm"
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </>
            )}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <NavLink
          to={item.url}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { projects } = useProjects();
  const { data: leads } = useLeads();

  // Dynamic badges
  const activeProjects = projects?.filter(
    (p) => p.status !== "Arquivado" && p.status !== "Concluído"
  ).length || 0;
  const activeLeads = leads?.length || 0;
  const inProduction = projects?.filter((p) => p.status === "Recebido").length || 0;

  const workspaceWithBadges = workspaceItems.map((item) => {
    if (item.url === "/projetos") return { ...item, badge: activeProjects };
    if (item.url === "/leads") return { ...item, badge: activeLeads };
    if (item.url === "/producao-sites") return { ...item, badge: inProduction };
    return item;
  });

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Logo size="sm" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">MonteSite</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">CRM</span>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-3 mb-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceWithBadges.map((item) => (
                <SidebarNavItem key={item.url} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-3 mb-1">
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarNavItem key={item.url} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-3 mb-1">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarNavItem key={item.url} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            AD
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">Admin</span>
            <span className="text-[11px] text-muted-foreground">Administrador</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

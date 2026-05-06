
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Plus,
  ExternalLink,
  Code,
  Book,
  Shield,
  Zap,
  CheckCircle,
  Users,
  Activity
} from "lucide-react";
import { WebhookConfiguration } from "@/components/webhook/WebhookConfiguration";
import { WebhookDocumentation } from "@/components/webhook/WebhookDocumentation";
import { WebhookLogs } from "@/components/webhook/WebhookLogs";
import { ApiManagement } from "@/components/webhook/ApiManagement";
import { AuthenticationLogs } from "@/components/webhook/AuthenticationLogs";
import { MakeIntegration } from "@/components/webhook/MakeIntegration";
import { PartnersTable } from "@/components/partners/PartnersTable";
import { PartnerDialog } from "@/components/partners/PartnerDialog";
import { WebhookLogsCard } from "@/components/partners/WebhookLogsCard";
import { EGestorIntegrationCard } from "@/components/webhook/egestor/EGestorIntegrationCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "@/types/webhook";

const tabs = [
  { key: "config", label: "eGestor", icon: Activity },
  { key: "make", label: "Make.com", icon: Zap },
  { key: "partners", label: "Parceiros", icon: Users },
  { key: "logs", label: "Logs", icon: Code },
  { key: "apis", label: "API", icon: ExternalLink },
  { key: "docs", label: "Documentação", icon: Book },
  { key: "auth", label: "Autenticação", icon: Shield },
] as const;

export default function WebhookManagement() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "config");
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const { data: partners, isLoading: partnersLoading, refetch: refetchPartners } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Partner[];
    }
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleEditPartner = (partner: Partner) => { setSelectedPartner(partner); setIsPartnerDialogOpen(true); };
  const handleNewPartner = () => { setSelectedPartner(null); setIsPartnerDialogOpen(true); };
  const handleClosePartnerDialog = () => { setIsPartnerDialogOpen(false); setSelectedPartner(null); refetchPartners(); };

  // Integration status items
  const integrations = [
    { name: "eGestor", status: "Conectado", ok: true },
    { name: "Blaster", status: "Ativo", ok: true },
    { name: "Make.com", status: "Configurado", ok: true },
    { name: "Supabase", status: "Ativo", ok: true },
  ];

  return (
    <PageLayout title="Integrações">
      <TopBar
        breadcrumbs={[
          { label: "MonteSite CRM", href: "/home" },
          { label: "Integrações & Webhooks" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "partners" && (
              <Button onClick={handleNewPartner} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Novo Parceiro
              </Button>
            )}
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sistema Ativo
            </Badge>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Main content */}
          <div className="space-y-5">
            {/* Tab navigation */}
            <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === t.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "config" && (
                <div className="space-y-4">
                  <EGestorIntegrationCard />
                  <WebhookConfiguration />
                </div>
              )}
              {activeTab === "docs" && <WebhookDocumentation />}
              {activeTab === "logs" && <WebhookLogs />}
              {activeTab === "auth" && <AuthenticationLogs />}
              {activeTab === "apis" && <ApiManagement />}
              {activeTab === "make" && <MakeIntegration />}
              {activeTab === "partners" && (
                <div className="space-y-4">
                  <PartnersTable partners={partners || []} loading={partnersLoading} onEdit={handleEditPartner} onRefresh={refetchPartners} />
                  <WebhookLogsCard />
                  <PartnerDialog open={isPartnerDialogOpen} onClose={handleClosePartnerDialog} partner={selectedPartner} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Integration statuses */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status das Integrações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {integrations.map((int, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{int.name}</span>
                    <Badge variant="outline" className={cn("text-[10px]", int.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                      {int.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={handleNewPartner}>
                  <Users className="h-3.5 w-3.5 mr-2" />
                  Configurar parceiro
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => setActiveTab("docs")}>
                  <Book className="h-3.5 w-3.5 mr-2" />
                  Ver documentação
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => setActiveTab("logs")}>
                  <Code className="h-3.5 w-3.5 mr-2" />
                  Ver logs recentes
                </Button>
              </CardContent>
            </Card>

            {/* Automation status */}
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Processamento Automático</span>
                </div>
                <div className="text-xs text-emerald-600 space-y-1">
                  <p>Webhooks processados em tempo real</p>
                  <p>Notificações instantâneas</p>
                  <p>Falhas registradas automaticamente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

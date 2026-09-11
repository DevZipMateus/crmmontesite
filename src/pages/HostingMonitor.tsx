import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageLayout } from "@/components/layout/PageLayout";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  HardDrive,
  Globe,
  PlusCircle,
  MinusCircle,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  PowerOff,
  Power,
  Link2,
  Unlink,
  Eraser,
  ShieldOff,
} from "lucide-react";
import { WebsiteRowActions } from "@/components/hosting/WebsiteRowActions";
import { getFunctionErrorMessage } from "@/lib/functionError";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const EVENT_META: Record<string, { icon: typeof PlusCircle; color: string; label: string }> = {
  site_created: { icon: PlusCircle, color: "text-green-600", label: "foi criado" },
  site_deleted: { icon: MinusCircle, color: "text-red-600", label: "foi removido (detectado na sincronização)" },
  site_deleted_manual: { icon: MinusCircle, color: "text-red-600", label: "foi excluído pelo painel" },
  site_deactivated: { icon: PowerOff, color: "text-orange-600", label: "foi tirado do ar" },
  site_reactivated: { icon: Power, color: "text-green-600", label: "foi reativado" },
  project_linked: { icon: Link2, color: "text-blue-600", label: "foi vinculado a um projeto" },
  project_unlinked: { icon: Unlink, color: "text-blue-600", label: "teve o vínculo com projeto removido" },
  cache_cleared: { icon: Eraser, color: "text-purple-600", label: "teve o cache limpo" },
  domain_auto_renewal_disabled: { icon: ShieldOff, color: "text-red-600", label: "teve a renovação automática desativada" },
};

const DEFAULT_EVENT_META = { icon: PlusCircle, color: "text-muted-foreground", label: "" };

function formatBytes(bytes: number | null) {
  if (bytes === null || bytes === undefined) return "—";
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(1)} GB`;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

export default function HostingMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["hosting_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hosting_plans").select("*").order("order_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: websites, isLoading: loadingWebsites } = useQuery({
    queryKey: ["hosting_websites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hosting_websites")
        .select("*, projects:linked_project_id (id, client_name)")
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["hosting_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hosting_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const filteredWebsites = useMemo(() => {
    if (!websites) return [];
    const term = search.trim().toLowerCase();

    return websites.filter((w) => {
      if (term && !w.domain.toLowerCase().includes(term)) return false;
      if (platformFilter !== "all" && w.platform !== platformFilter) return false;

      if (statusFilter !== "all") {
        const status = w.deleted_at
          ? "deleted"
          : w.panel_state === "offline"
          ? "offline"
          : w.is_placeholder
          ? "placeholder"
          : "active";
        if (status !== statusFilter) return false;
      }

      const firstSeen = new Date(w.first_seen_at);
      if (dateFrom && firstSeen < dateFrom) return false;
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (firstSeen > endOfDay) return false;
      }

      return true;
    });
  }, [websites, search, platformFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredWebsites.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedWebsites = useMemo(
    () => filteredWebsites.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredWebsites, currentPage, pageSize]
  );

  const hasActiveFilters =
    !!search || platformFilter !== "all" || statusFilter !== "all" || !!dateFrom || !!dateTo;

  const resetFilters = () => {
    setSearch("");
    setPlatformFilter("all");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const lastSyncedAt = plans?.reduce<string | null>((latest, p) => {
    if (!p.last_synced_at) return latest;
    if (!latest || new Date(p.last_synced_at) > new Date(latest)) return p.last_synced_at;
    return latest;
  }, null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke("hosting-sync", { body: {} });
      if (response.error) {
        const message = await getFunctionErrorMessage(response.error, "Erro ao sincronizar");
        throw new Error(message);
      }
      const result = response.data;
      toast({
        title: "Sincronização concluída",
        description: `${result.created?.length ?? 0} site(s) novo(s), ${result.deleted?.length ?? 0} removido(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ["hosting_plans"] });
      queryClient.invalidateQueries({ queryKey: ["hosting_websites"] });
      queryClient.invalidateQueries({ queryKey: ["hosting_events"] });
    } catch (error) {
      console.error("Erro ao sincronizar hospedagem:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível sincronizar.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageLayout
      title="Hospedagem"
      actions={
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
          Sincronizar agora
        </Button>
      }
    >
      <div className="space-y-6">
        {lastSyncedAt && (
          <p className="text-xs text-muted-foreground">
            Última sincronização: {new Date(lastSyncedAt).toLocaleString("pt-BR")}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingPlans && <p className="text-sm text-muted-foreground">Carregando planos...</p>}
          {plans?.map((plan) => (
            <Card key={plan.order_id} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{plan.plan_name}</span>
                  <Badge variant="outline">{plan.platform === "h5g" ? "Agency" : "Cloud"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" /> Sites
                    </span>
                    <span className="font-medium">
                      {plan.site_count}
                      {plan.site_limit ? ` / ${plan.site_limit}` : " (sem limite)"}
                    </span>
                  </div>
                  {plan.site_limit && (
                    <Progress value={(plan.site_count / plan.site_limit) * 100} />
                  )}
                </div>
                {plan.disk_bytes_limit && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <HardDrive className="h-3.5 w-3.5" /> Disco
                      </span>
                      <span className="font-medium">
                        {formatBytes(plan.disk_bytes_used)} / {formatBytes(plan.disk_bytes_limit)}
                      </span>
                    </div>
                    <Progress
                      value={((plan.disk_bytes_used ?? 0) / plan.disk_bytes_limit) * 100}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!loadingPlans && (!plans || plans.length === 0) && (
            <AnalyticsCard
              title="Nenhum dado ainda"
              value="—"
              description='Clique em "Sincronizar agora" para buscar os dados da Hostinger pela primeira vez.'
            />
          )}
        </div>

        <Tabs defaultValue="sites">
          <TabsList>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            <Card>
              <CardHeader className="gap-3">
                <CardTitle>Sites hospedados</CardTitle>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5 min-w-[180px]">
                    <label className="text-xs font-medium text-muted-foreground">Buscar domínio</label>
                    <Input
                      placeholder="ex: meusite.com.br"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-[160px]">
                    <label className="text-xs font-medium text-muted-foreground">Plataforma</label>
                    <Select
                      value={platformFilter}
                      onValueChange={(v) => {
                        setPlatformFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="h5g">Agency Growth</SelectItem>
                        <SelectItem value="cloudlinux">Cloud Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-[140px]">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => {
                        setStatusFilter(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="offline">Fora do ar</SelectItem>
                        <SelectItem value="placeholder">Placeholder</SelectItem>
                        <SelectItem value="deleted">Removido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Criado de</label>
                    <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 text-xs font-normal w-[130px] justify-start">
                          <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          {dateFrom ? format(dateFrom, "dd/MM/yy") : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={(date) => {
                            setDateFrom(date);
                            setOpenFromDate(false);
                            setPage(1);
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">até</label>
                    <Popover open={openToDate} onOpenChange={setOpenToDate}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 text-xs font-normal w-[130px] justify-start">
                          <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          {dateTo ? format(dateTo, "dd/MM/yy") : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={(date) => {
                            setDateTo(date);
                            setOpenToDate(false);
                            setPage(1);
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingWebsites ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredWebsites.length > 0 ? (
                  <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domínio</TableHead>
                        <TableHead>Plataforma</TableHead>
                        <TableHead>Projeto vinculado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Visto por último</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWebsites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">{site.domain}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {site.platform === "h5g" ? "Agency Growth" : "Cloud Professional"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {site.projects ? (
                              <Link to={`/projeto/${site.projects.id}`} className="text-primary hover:underline">
                                {site.projects.client_name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {site.deleted_at ? (
                              <Badge variant="destructive">Removido</Badge>
                            ) : site.panel_state === "offline" ? (
                              <Badge className="bg-orange-500">Fora do ar</Badge>
                            ) : site.is_placeholder ? (
                              <Badge variant="secondary">Placeholder</Badge>
                            ) : (
                              <Badge className="bg-green-500">Ativo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {timeAgo(site.last_seen_at)}
                          </TableCell>
                          <TableCell>
                            <WebsiteRowActions site={site} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t mt-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Mostrando {(currentPage - 1) * pageSize + 1}–
                        {Math.min(currentPage * pageSize, filteredWebsites.length)} de {filteredWebsites.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>por página:</span>
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(v) => {
                            setPageSize(parseInt(v));
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="h-7 w-16 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum site encontrado.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de mudanças</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-2">
                    {events.map((event) => {
                      const meta = EVENT_META[event.event_type] ?? DEFAULT_EVENT_META;
                      const Icon = meta.icon;
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Icon className={`h-4 w-4 flex-shrink-0 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {event.domain} <span className="text-muted-foreground font-normal">{meta.label}</span>
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex-shrink-0">
                            {timeAgo(event.created_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum evento registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

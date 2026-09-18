import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFunctionErrorMessage } from "@/lib/functionError";
import { MoreVertical, Link2, PowerOff, Power, Trash2, Globe2, Eraser, Github } from "lucide-react";
import { DomainRenewalDialog } from "./DomainRenewalDialog";

interface WebsiteRow {
  id: string;
  domain: string;
  platform: string;
  panel_state: string;
  deleted_at: string | null;
  linked_project_id: string | null;
  is_decommissioned?: boolean;
  github_backup_url?: string | null;
  projects?: { id: string; client_name: string; project_link?: string | null } | null;
}

export function WebsiteRowActions({ site }: { site: WebsiteRow }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkOpen, setLinkOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [search, setSearch] = useState("");

  // Sem projeto vinculado, o link fica guardado no próprio site (staging).
  // Com projeto vinculado, o site "conversa" com o campo Link do Projeto
  // (Lovable/GitHub) do projeto — a mesma informação editável nos dois lugares.
  const effectiveBackupUrl = site.linked_project_id
    ? site.projects?.project_link ?? ""
    : site.github_backup_url ?? "";

  const isOffline = site.panel_state === "offline";
  const isDeleted = !!site.deleted_at;
  const isDecommissioned = !!site.is_decommissioned;
  // Sites sem hospedagem (nem Hostinger, nem VPS) já saíram da Hostinger pra
  // sempre, mas ainda precisam poder ser vinculados a um projeto pra manter o
  // histórico — só as ações que dependem da API da Hostinger ficam bloqueadas.
  const canCallHostinger = !isDeleted;
  const canToggle = canCallHostinger && site.platform === "h5g";

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["hosting_websites"] });
    queryClient.invalidateQueries({ queryKey: ["hosting_events"] });
  };

  const { data: projectOptions } = useQuery({
    queryKey: ["projects-search", search],
    queryFn: async () => {
      const query = supabase.from("projects").select("id, client_name, domain").order("created_at", { ascending: false }).limit(20);
      const { data, error } = search
        ? await query.or(`client_name.ilike.%${search}%,domain.ilike.%${search}%`)
        : await query;
      if (error) throw error;
      return data;
    },
    enabled: linkOpen,
  });

  const linkMutation = useMutation({
    mutationFn: async (projectId: string | null) => {
      const { error } = await supabase
        .from("hosting_websites")
        .update({ linked_project_id: projectId })
        .eq("id", site.id);
      if (error) throw error;

      // Se já tinha um link de backup guardado no site (antes de vincular) e o
      // projeto ainda não tem "Link do Projeto" preenchido, aproveita e leva
      // essa informação pro projeto agora.
      if (projectId && site.github_backup_url) {
        const { data: project } = await supabase
          .from("projects")
          .select("project_link")
          .eq("id", projectId)
          .maybeSingle();
        if (project && !project.project_link) {
          await supabase
            .from("projects")
            .update({ project_link: site.github_backup_url })
            .eq("id", projectId);
        }
      }

      await supabase.from("hosting_events").insert({
        event_type: projectId ? "project_linked" : "project_unlinked",
        domain: site.domain,
        order_id: null,
        detail: {},
      });
    },
    onSuccess: (_data, projectId) => {
      toast({ title: "Vínculo atualizado" });
      setLinkOpen(false);
      invalidateAll();
      if (projectId) queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível vincular o projeto.",
        variant: "destructive",
      });
    },
  });

  const githubMutation = useMutation({
    mutationFn: async (url: string) => {
      if (site.linked_project_id) {
        const { error } = await supabase
          .from("projects")
          .update({ project_link: url || null })
          .eq("id", site.linked_project_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("hosting_websites")
          .update({ github_backup_url: url || null })
          .eq("id", site.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Link do backup salvo" });
      setGithubOpen(false);
      invalidateAll();
      if (site.linked_project_id) {
        queryClient.invalidateQueries({ queryKey: ["project", site.linked_project_id] });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar o link.",
        variant: "destructive",
      });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "deactivate" | "reactivate" | "delete" | "clear_cache") => {
      const response = await supabase.functions.invoke("hosting-website-action", {
        body: { website_id: site.id, action },
      });
      if (response.error) {
        throw new Error(await getFunctionErrorMessage(response.error, "Não foi possível concluir a ação."));
      }
      if (response.data && response.data.success === false) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (_data, action) => {
      const messages = {
        deactivate: "Site tirado do ar.",
        reactivate: "Site reativado.",
        delete: "Site excluído.",
        clear_cache: "Cache limpo.",
      };
      toast({ title: messages[action] });
      setToggleOpen(false);
      setDeleteOpen(false);
      invalidateAll();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível concluir a ação.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDeleted && !isDecommissioned}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setLinkOpen(true)}>
            <Link2 className="h-4 w-4 mr-2" /> Vincular a projeto
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRenewalOpen(true)}>
            <Globe2 className="h-4 w-4 mr-2" /> Gerenciar renovação do domínio
          </DropdownMenuItem>
          {isDecommissioned && (
            <DropdownMenuItem
              onSelect={() => {
                setGithubUrl(effectiveBackupUrl);
                setGithubOpen(true);
              }}
            >
              <Github className="h-4 w-4 mr-2" />
              {effectiveBackupUrl ? "Editar link do backup" : "Adicionar link do backup"}
            </DropdownMenuItem>
          )}
          {canCallHostinger && (
            <>
              <DropdownMenuSeparator />
              {canToggle ? (
                <DropdownMenuItem onSelect={() => setToggleOpen(true)}>
                  {isOffline ? (
                    <>
                      <Power className="h-4 w-4 mr-2" /> Reativar site
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" /> Tirar do ar
                    </>
                  )}
                </DropdownMenuItem>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem disabled>
                        <PowerOff className="h-4 w-4 mr-2" /> Tirar do ar
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Disponível apenas para sites do plano Agency Growth</TooltipContent>
                </Tooltip>
              )}
              <DropdownMenuItem
                disabled={actionMutation.isPending}
                onSelect={() => actionMutation.mutate("clear_cache")}
              >
                <Eraser className="h-4 w-4 mr-2" /> Limpar cache
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Excluir site
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vincular a projeto */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular {site.domain} a um projeto</DialogTitle>
          </DialogHeader>
          <Command shouldFilter={false}>
            <CommandInput placeholder="Buscar por cliente ou domínio..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
              <CommandGroup>
                {site.linked_project_id && (
                  <CommandItem onSelect={() => linkMutation.mutate(null)} className="text-red-600">
                    Remover vínculo atual
                  </CommandItem>
                )}
                {projectOptions?.map((p) => (
                  <CommandItem key={p.id} onSelect={() => linkMutation.mutate(p.id)}>
                    <div>
                      <div>{p.client_name}</div>
                      <div className="text-xs text-muted-foreground">{p.domain || "sem domínio"}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Link do backup no GitHub */}
      <Dialog open={githubOpen} onOpenChange={setGithubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link do backup de {site.domain}</DialogTitle>
          </DialogHeader>
          {site.linked_project_id && (
            <p className="text-xs text-muted-foreground -mt-2">
              Esse site está vinculado a {site.projects?.client_name ?? "um projeto"} — salvar aqui atualiza o
              campo "Link do Projeto (Lovable/GitHub)" desse projeto, e vice-versa.
            </p>
          )}
          <Input
            placeholder="https://github.com/organizacao/repositorio"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGithubOpen(false)} disabled={githubMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={() => githubMutation.mutate(githubUrl.trim())} disabled={githubMutation.isPending}>
              {githubMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tirar do ar / reativar */}
      <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isOffline ? "Reativar site" : "Tirar site do ar"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isOffline
                ? `O domínio ${site.domain} será revinculado ao site e voltará a ficar acessível.`
                : `O domínio ${site.domain} será desvinculado e o site ficará inacessível. Os arquivos e o banco de dados não são apagados — você pode reativar depois.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                actionMutation.mutate(isOffline ? "reactivate" : "deactivate");
              }}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? "Aguarde..." : isOffline ? "Reativar" : "Tirar do ar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excluir site */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir site</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{site.domain}</strong>? Esta ação é irreversível e apaga
              todos os arquivos e bancos de dados do site na Hostinger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                actionMutation.mutate("delete");
              }}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? "Excluindo..." : "Excluir site"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DomainRenewalDialog open={renewalOpen} onOpenChange={setRenewalOpen} domain={site.domain} />
    </>
  );
}

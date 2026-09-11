import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFunctionErrorMessage } from "@/lib/functionError";

interface Candidate {
  id: string;
  name: string;
  status: string;
  total_price: number;
  currency_code: string;
  next_billing_at: string | null;
  expires_at: string | null;
  is_auto_renewed: boolean;
  date_diff_ms: number;
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
}

export function DomainRenewalDialog({
  open,
  onOpenChange,
  domain,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hosting-domain-renewal-candidates", domain],
    queryFn: async () => {
      const response = await supabase.functions.invoke("hosting-domain-renewal", {
        body: { action: "find_candidates", domain },
      });
      if (response.error) {
        throw new Error(await getFunctionErrorMessage(response.error, "Erro ao consultar a renovação."));
      }
      if (response.data?.success === false) throw new Error(response.data.error);
      return response.data as { domain_expires_at: string | null; candidates: Candidate[] };
    },
    enabled: open,
  });

  const disableMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await supabase.functions.invoke("hosting-domain-renewal", {
        body: { action: "disable", subscription_id: subscriptionId, domain },
      });
      if (response.error) {
        throw new Error(await getFunctionErrorMessage(response.error, "Erro ao consultar a renovação."));
      }
      if (response.data?.success === false) throw new Error(response.data.error);
    },
    onSuccess: () => {
      toast({ title: "Renovação automática desativada", description: domain });
      setConfirmOpen(false);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["hosting_events"] });
    },
    onError: (err) => {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Não foi possível desativar a renovação.",
        variant: "destructive",
      });
    },
  });

  const selected = data?.candidates.find((c) => c.id === selectedId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovação automática — {domain}</DialogTitle>
          </DialogHeader>

          {isLoading && <p className="text-sm text-muted-foreground">Buscando assinatura correspondente...</p>}
          {error && (
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : "Erro ao buscar candidatos."}
            </p>
          )}

          {data && data.candidates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma assinatura de domínio com data de renovação próxima de {domain} foi encontrada
              automaticamente. Verifique manualmente em Faturamento no hPanel.
            </p>
          )}

          {data && data.candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                A Hostinger não expõe qual assinatura pertence a qual domínio — estas são as assinaturas de
                domínio cuja data de renovação mais se aproxima do vencimento de <strong>{domain}</strong>{" "}
                ({data.domain_expires_at ? new Date(data.domain_expires_at).toLocaleDateString("pt-BR") : "—"}).
                Confira o valor e a data antes de confirmar.
              </p>
              <RadioGroup value={selectedId ?? undefined} onValueChange={setSelectedId}>
                {data.candidates.map((c) => (
                  <div key={c.id} className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value={c.id} id={c.id} />
                    <Label htmlFor={c.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(c.total_price, c.currency_code)} · renova em{" "}
                        {c.next_billing_at ? new Date(c.next_billing_at).toLocaleDateString("pt-BR") : "—"} ·{" "}
                        {c.is_auto_renewed ? "renovação automática ativa" : "já sem renovação automática"}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button
              variant="destructive"
              disabled={!selectedId || !selected?.is_auto_renewed}
              onClick={() => setConfirmOpen(true)}
            >
              Desativar renovação automática
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a renovação automática da assinatura{" "}
              <strong>{selected?.name}</strong> ({selected && formatPrice(selected.total_price, selected.currency_code)}
              , renova em {selected?.next_billing_at ? new Date(selected.next_billing_at).toLocaleDateString("pt-BR") : "—"})?
              Se esta não for a assinatura correta de <strong>{domain}</strong>, o domínio errado deixará de
              renovar. Esta ação não pode ser desfeita pelo painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disableMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={disableMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (selectedId) disableMutation.mutate(selectedId);
              }}
            >
              {disableMutation.isPending ? "Desativando..." : "Confirmar desativação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

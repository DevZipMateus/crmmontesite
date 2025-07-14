
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead } from "@/types/lead";
import { useUpdateLead } from "@/hooks/useLeads";

interface LeadEditDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  vendedores: string[];
  situacoes: string[];
}

const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  lead,
  isOpen,
  onClose,
  vendedores,
  situacoes
}) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const updateLead = useUpdateLead();

  React.useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lead && formData) {
      updateLead.mutate({
        id: lead.id,
        updates: formData
      });
      onClose();
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Lead - {lead.empresa}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa || ''}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente || ''}
                onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendedor">Vendedor</Label>
              <Select
                value={formData.vendedor || 'none'}
                onValueChange={(value) => setFormData({ ...formData, vendedor: value === 'none' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="situacao">Situação</Label>
              <Select
                value={formData.situacao || ''}
                onValueChange={(value) => setFormData({ ...formData, situacao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar situação" />
                </SelectTrigger>
                <SelectContent>
                  {situacoes.map((situacao) => (
                    <SelectItem key={situacao} value={situacao}>
                      {situacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="link_blaster">Link Blaster</Label>
              <Input
                id="link_blaster"
                value={formData.link_blaster || ''}
                onChange={(e) => setFormData({ ...formData, link_blaster: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="link_chat">Link Chat</Label>
              <Input
                id="link_chat"
                value={formData.link_chat || ''}
                onChange={(e) => setFormData({ ...formData, link_chat: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="data_ultimo_contato">Data do Último Contato</Label>
            <Input
              id="data_ultimo_contato"
              type="date"
              value={formData.data_ultimo_contato ? new Date(formData.data_ultimo_contato).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, data_ultimo_contato: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações sobre o lead..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditDialog;


import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateLead } from "@/hooks/useLeads";
import { Lead, SITUACOES_PADRONIZADAS } from "@/types/lead";
import LeadSchedulingSection from "./LeadSchedulingSection";

interface LeadEditDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  vendedores: string[];
}

const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  lead,
  isOpen,
  onClose,
  vendedores,
}) => {
  const [formData, setFormData] = useState({
    empresa: "",
    nome_cliente: "",
    vendedor: "",
    situacao: "",
    link_blaster: "",
    link_chat: "",
    observacoes: "",
  });

  const updateLead = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setFormData({
        empresa: lead.empresa || "",
        nome_cliente: lead.nome_cliente || "",
        vendedor: lead.vendedor || "",
        situacao: lead.situacao || "",
        link_blaster: lead.link_blaster || "",
        link_chat: lead.link_chat || "",
        observacoes: lead.observacoes || "",
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: {
          ...formData,
          data_ultimo_contato: new Date().toISOString(),
        },
      });
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead - {lead.empresa}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de edição */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange("empresa", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
                  <Input
                    id="nome_cliente"
                    value={formData.nome_cliente}
                    onChange={(e) => handleInputChange("nome_cliente", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendedor">Vendedor</Label>
                  <Select
                    value={formData.vendedor}
                    onValueChange={(value) => handleInputChange("vendedor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((vendedor) => (
                        <SelectItem key={vendedor} value={vendedor}>
                          {vendedor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="situacao">Situação</Label>
                  <Select
                    value={formData.situacao}
                    onValueChange={(value) => handleInputChange("situacao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar situação" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITUACOES_PADRONIZADAS.map((situacao) => (
                        <SelectItem key={situacao} value={situacao}>
                          {situacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_blaster">Link Blaster</Label>
                <Input
                  id="link_blaster"
                  type="url"
                  value={formData.link_blaster}
                  onChange={(e) => handleInputChange("link_blaster", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_chat">Link do Chat</Label>
                <Input
                  id="link_chat"
                  type="url"
                  value={formData.link_chat}
                  onChange={(e) => handleInputChange("link_chat", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateLead.isPending}
                  className="flex-1"
                >
                  {updateLead.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>

          {/* Seção de agendamentos e anotações */}
          <div>
            <LeadSchedulingSection leadId={lead.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditDialog;

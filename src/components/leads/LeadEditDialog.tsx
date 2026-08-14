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
import { MessageSquare } from "lucide-react";
import { useUpdateLead } from "@/hooks/useLeads";
import { Lead, SITUACOES_PADRONIZADAS } from "@/types/lead";
import LeadSchedulingSection from "./LeadSchedulingSection";
import { formatPhoneNumber } from "@/lib/phone";

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
    email: "",
    telefone: "",
    cnpj: "",
    vendedor: "",
    situacao: "",
    link_blaster: "",
    link_chat: "",
    observacoes: "",
    tipo_servico: "Site",
  });

  const updateLead = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setFormData({
        empresa: lead.empresa || "",
        nome_cliente: lead.nome_cliente || "",
        email: lead.email || "",
        telefone: lead.telefone || "",
        cnpj: lead.cnpj || "",
        vendedor: lead.vendedor || "",
        situacao: lead.situacao || "",
        link_blaster: lead.link_blaster || "",
        link_chat: lead.link_chat || "",
        observacoes: lead.observacoes || "",
        tipo_servico: lead.tipo_servico || "Site",
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
          {/* Descrição para acessibilidade, evita warning de aria-describedby */}
          <p className="sr-only" id="lead-edit-desc">Atualize as informações do lead, como situação, vendedor e observações.</p>
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
                  <Label htmlFor="telefone">Número de Contato</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", formatPhoneNumber(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ/CPF</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
                  <Select
                    value={formData.tipo_servico}
                    onValueChange={(value) => handleInputChange("tipo_servico", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Site">Site</SelectItem>
                      <SelectItem value="Site + Vitrine">Site + Vitrine</SelectItem>
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
                <div className="flex gap-2">
                  <Input
                    id="link_chat"
                    type="url"
                    value={formData.link_chat}
                    onChange={(e) => handleInputChange("link_chat", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.link_chat, '_blank')}
                    disabled={!formData.link_chat}
                    className="flex items-center gap-2 px-3"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Abrir Chat
                  </Button>
                </div>
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

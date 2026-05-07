
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SITUACOES_PADRONIZADAS } from "@/types/lead";
import { useCreateLead } from "@/hooks/useLeads";

interface LeadCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendedores: string[];
}

const LeadCreateDialog: React.FC<LeadCreateDialogProps> = ({
  isOpen,
  onClose,
  vendedores
}) => {
  const [formData, setFormData] = useState({
    empresa: '',
    nome_cliente: '',
    email: '',
    cnpj: '',
    vendedor: '',
    situacao: 'Em Contato',
    link_blaster: '',
    link_chat: '',
    data_ultimo_contato: new Date().toISOString().split('T')[0],
    observacoes: '',
    tipo_servico: 'Site'
  });

  const createLead = useCreateLead();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      ...formData,
      vendedor: formData.vendedor === 'none' ? null : formData.vendedor,
      data_ultimo_contato: formData.data_ultimo_contato
    };

    createLead.mutate(leadData, {
      onSuccess: () => {
        setFormData({
          empresa: '',
          nome_cliente: '',
          email: '',
          cnpj: '',
          vendedor: '',
          situacao: 'Em Contato',
          link_blaster: '',
          link_chat: '',
          data_ultimo_contato: new Date().toISOString().split('T')[0],
          observacoes: '',
          tipo_servico: 'Site'
        });
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="empresa">Empresa *</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendedor">Vendedor</Label>
              <Select
                value={formData.vendedor || 'none'}
                onValueChange={(value) => setFormData({ ...formData, vendedor: value === 'none' ? '' : value })}
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
                value={formData.situacao}
                onValueChange={(value) => setFormData({ ...formData, situacao: value })}
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
            <div>
              <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
              <Select
                value={formData.tipo_servico}
                onValueChange={(value) => setFormData({ ...formData, tipo_servico: value })}
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
            <div>
              <Label htmlFor="link_blaster">Link Blaster</Label>
              <Input
                id="link_blaster"
                value={formData.link_blaster}
                onChange={(e) => setFormData({ ...formData, link_blaster: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="link_blaster">Link Blaster</Label>
              <Input
                id="link_blaster"
                value={formData.link_blaster}
                onChange={(e) => setFormData({ ...formData, link_blaster: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="link_chat">Link Chat</Label>
              <Input
                id="link_chat"
                value={formData.link_chat}
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
              value={formData.data_ultimo_contato}
              onChange={(e) => setFormData({ ...formData, data_ultimo_contato: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações sobre o lead..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? 'Criando...' : 'Criar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCreateDialog;


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Partner } from "@/types/webhook";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Copy, Key } from "lucide-react";

interface PartnerDialogProps {
  open: boolean;
  onClose: () => void;
  partner?: Partner | null;
}

export function PartnerDialog({ open, onClose, partner }: PartnerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    hash: '',
    webhook_url: '',
    auth_token: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        hash: partner.hash,
        webhook_url: partner.webhook_url || '',
        auth_token: partner.auth_token || '',
        active: partner.active
      });
    } else {
      setFormData({
        name: '',
        hash: '',
        webhook_url: '',
        auth_token: '',
        active: true
      });
    }
  }, [partner, open]);

  const generateHash = () => {
    const hash = 'partner_' + Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({ ...prev, hash }));
  };

  const generateToken = () => {
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({ ...prev, auth_token: token }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.hash) {
      toast({
        title: "Erro",
        description: "Nome e hash são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (partner) {
        // Atualizar
        const { error } = await supabase
          .from('partners')
          .update({
            name: formData.name,
            hash: formData.hash,
            webhook_url: formData.webhook_url || null,
            auth_token: formData.auth_token || null,
            active: formData.active
          })
          .eq('id', partner.id);

        if (error) throw error;

        toast({
          title: "Parceiro atualizado",
          description: "As informações foram salvas com sucesso."
        });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('partners')
          .insert({
            name: formData.name,
            hash: formData.hash,
            webhook_url: formData.webhook_url || null,
            auth_token: formData.auth_token || null,
            active: formData.active
          });

        if (error) throw error;

        toast({
          title: "Parceiro criado",
          description: "Novo parceiro foi cadastrado com sucesso."
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o parceiro.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const webhookUrl = `${window.location.origin}/functions/v1/receive-partner-data`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {partner ? 'Editar Parceiro' : 'Novo Parceiro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Parceiro</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Agência XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hash">Hash Identificador</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateHash}
              >
                Gerar
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="hash"
                value={formData.hash}
                onChange={(e) => setFormData(prev => ({ ...prev, hash: e.target.value }))}
                placeholder="partner_abc123"
                required
              />
              {formData.hash && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formData.hash, 'Hash')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook (Opcional)</Label>
            <Textarea
              id="webhook_url"
              value={formData.webhook_url}
              onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
              placeholder="https://parceiro.com/webhook"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              URL onde o parceiro receberá notificações de status
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auth_token">Token de Autenticação (Opcional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateToken}
              >
                <Key className="h-4 w-4 mr-1" />
                Gerar
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="auth_token"
                value={formData.auth_token}
                onChange={(e) => setFormData(prev => ({ ...prev, auth_token: e.target.value }))}
                placeholder="tok_..."
                type="password"
              />
              {formData.auth_token && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formData.auth_token, 'Token')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Parceiro ativo</Label>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">URL para Receber Dados</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-muted text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(webhookUrl, 'URL do webhook')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL que o parceiro deve usar para enviar dados de projetos
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (partner ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

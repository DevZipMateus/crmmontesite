
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DomainRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (domain: string) => void;
  projectName: string;
  isLoading?: boolean;
}

export function DomainRequiredDialog({ 
  open, 
  onClose, 
  onConfirm, 
  projectName, 
  isLoading = false 
}: DomainRequiredDialogProps) {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateDomain = (domain: string): boolean => {
    if (!domain.trim()) {
      setError("Domínio é obrigatório");
      return false;
    }

    // Remove protocolo se existir
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
    
    // Validação básica de formato de domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    
    if (!domainRegex.test(cleanDomain)) {
      setError("Formato de domínio inválido");
      return false;
    }

    setError("");
    return true;
  };

  const handleConfirm = () => {
    if (!validateDomain(domain)) {
      return;
    }

    // Limpar o domínio (remover protocolo e www)
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
    onConfirm(cleanDomain);
    setDomain("");
    setError("");
  };

  const handleClose = () => {
    setDomain("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Domínio obrigatório
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Atenção!</p>
              <p className="text-amber-700">
                Para marcar "<strong>{projectName}</strong>" como "Site pronto", é necessário informar o domínio do site.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domínio do site</Label>
            <Input
              id="domain"
              type="text"
              placeholder="exemplo.com.br"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                if (error) setError("");
              }}
              className={error ? "border-red-500 focus:border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Exemplo: meusite.com.br (sem http:// ou www.)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Salvando..." : "Confirmar e finalizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

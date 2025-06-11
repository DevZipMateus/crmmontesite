
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormStatusIndicatorProps {
  formularioPreenchido: boolean;
  partnerHash?: string;
  modeloEscolhido?: string;
  dataFormulario?: string;
}

export const FormStatusIndicator = ({ 
  formularioPreenchido, 
  partnerHash, 
  modeloEscolhido,
  dataFormulario 
}: FormStatusIndicatorProps) => {
  const formUrl = partnerHash ? `https://montesite.com.br/${partnerHash}` : null;

  if (formularioPreenchido && modeloEscolhido) {
    return (
      <div className="space-y-2">
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-300 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Formulário preenchido
        </Badge>
        {dataFormulario && (
          <div className="text-xs text-gray-600">
            Em: {new Date(dataFormulario).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    );
  }

  if (partnerHash && formUrl) {
    return (
      <div className="space-y-2">
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Aguardando formulário
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => window.open(formUrl, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Abrir formulário
        </Button>
        <div className="text-xs text-gray-500 break-all">
          {formUrl}
        </div>
      </div>
    );
  }

  return null;
};

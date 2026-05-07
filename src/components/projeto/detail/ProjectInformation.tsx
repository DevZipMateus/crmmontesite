import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe } from "lucide-react";
import { formatCnpjCpf } from "@/utils/documentFormatter";
import { useEditedFieldsData } from "@/hooks/useEditedFieldsData";
import { EditedFieldsIndicator } from "./EditedFieldsIndicator";

interface ProjectInformationProps {
  project: Project;
}

export const ProjectInformation: React.FC<ProjectInformationProps> = ({ project }) => {
  const { modelName, isLoading: modelLoading } = useModelDetails(project.template);
  const { editData } = useEditedFieldsData(project.personalization_id);

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formattedDateTime = (dateStr?: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR')}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Edited fields indicator */}
      {editData && editData.edited_fields && editData.edited_fields.length > 0 && (
        <EditedFieldsIndicator
          editedFields={editData.edited_fields}
          lastEditedAt={editData.last_edited_at}
          editCount={editData.edit_count}
        />
      )}

      {/* Dados do cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Dados do cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="EMPRESA" value={project.client_name} />
            <InfoField label="CNPJ" value={project.cnpj ? formatCnpjCpf(project.cnpj) : '--'} />
            <InfoField label="TELEFONE" value={project.telefone || '--'} />
            <InfoField label="E-MAIL" value={project.email_complementar || '--'} />
            <InfoField label="TIPO DE CLIENTE" value={project.client_type === 'parceiro' ? 'Parceiro' : 'Cliente final'} />
            <InfoField label="ENDERECO" value={'--'} />
          </div>
        </CardContent>
      </Card>

      {/* Site & integracoes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Site & integracoes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField 
              label="DOMINIO" 
              value={project.domain || '--'} 
              isLink={!!project.domain}
              href={project.domain ? `https://${project.domain}` : undefined}
            />
            <InfoField label="TEMPLATE" value={modelLoading ? 'Carregando...' : (modelName || '--')} />
            <InfoField 
              label="LINK DO BLASTER" 
              value={project.blaster_link || '--'} 
              isLink={!!project.blaster_link}
              href={project.blaster_link || undefined}
            />
             <InfoField 
               label="LINK DA VITRINE" 
               value={project.showcase_link || '--'} 
               isLink={!!project.showcase_link}
               href={project.showcase_link || undefined}
             />
            <InfoField label="ULTIMA ATUALIZACAO" value={formattedDateTime(project.updated_at)} />
            <InfoField label="CRIADO EM" value={formattedDate(project.created_at)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function InfoField({ label, value, isLink, href, mono }: { 
  label: string; 
  value: string; 
  isLink?: boolean; 
  href?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      {isLink && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
          {value}
        </a>
      ) : (
        <p className={`text-sm text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      )}
    </div>
  );
}

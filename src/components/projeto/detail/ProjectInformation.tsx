import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe } from "lucide-react";
import { formatCnpjCpf } from "@/utils/documentFormatter";
import { useEditedFieldsData } from "@/hooks/useEditedFieldsData";
import { EditedFieldsIndicator } from "./EditedFieldsIndicator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectInformationProps {
  project: Project;
}

export const ProjectInformation: React.FC<ProjectInformationProps> = ({ project }) => {
  const { editData } = useEditedFieldsData(project.personalization_id);

  const { data: personalization } = useQuery({
    queryKey: ["personalization-address", project.personalization_id],
    queryFn: async () => {
      if (!project.personalization_id) return null;
      const { data } = await supabase
        .from("site_personalizacoes")
        .select("cep,logradouro,numero,complemento,bairro,cidade,estado,endereco")
        .eq("id", project.personalization_id)
        .maybeSingle();
      return data;
    },
    enabled: !!project.personalization_id,
  });

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formattedDateTime = (dateStr?: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR')}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const p: any = personalization || {};
  const hasStructuredAddress = !!(p.cep || p.logradouro || p.cidade);
  const enderecoFallback = p.endereco || '--';

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
            {hasStructuredAddress ? (
              <>
                <InfoField label="CEP" value={p.cep || '--'} />
                <InfoField label="LOGRADOURO" value={[p.logradouro, p.numero].filter(Boolean).join(', ') || '--'} />
                <InfoField label="COMPLEMENTO" value={p.complemento || '--'} />
                <InfoField label="BAIRRO" value={p.bairro || '--'} />
                <InfoField label="CIDADE" value={p.cidade || '--'} />
                <InfoField label="ESTADO" value={p.estado || '--'} />
              </>
            ) : (
              <InfoField label="ENDERECO" value={enderecoFallback} />
            )}
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
            <InfoField 
              label="LINK DO PROJETO (LOVABLE/GITHUB)" 
              value={project.project_link || '--'} 
              isLink={!!project.project_link}
              href={project.project_link || undefined}
            />
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
            <div className="col-span-2">
              <InfoField label="OBSERVACOES" value={project.provider_credentials || '--'} />
            </div>
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

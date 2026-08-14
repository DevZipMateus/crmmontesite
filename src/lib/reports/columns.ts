import { Lead } from "@/types/lead";

export type ReportRow = Record<string, string | number>;

type LeadWithProject = Lead & {
  projects?: { client_name?: string; status?: string } | null;
};

export interface ReportColumn {
  key: string;
  label: string;
  defaultSelected: boolean;
  getValue: (lead: LeadWithProject) => string | number;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR");
};

export const calcDiasSemResposta = (lead: Lead) => {
  if (lead.situacao.toLowerCase().includes("site pronto")) return 0;
  const contactDate = new Date(lead.data_ultimo_contato);
  const diffMs = Date.now() - contactDate.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const getProjeto = (lead: LeadWithProject): string => lead.projects?.client_name || "";
const getStatusProjeto = (lead: LeadWithProject): string => lead.projects?.status || "";

export const REPORT_COLUMNS: ReportColumn[] = [
  { key: "empresa", label: "Empresa", defaultSelected: true, getValue: (l) => l.empresa || "" },
  { key: "nome_cliente", label: "Cliente", defaultSelected: true, getValue: (l) => l.nome_cliente || "" },
  { key: "telefone", label: "Número de Contato", defaultSelected: true, getValue: (l) => l.telefone || "" },
  { key: "vendedor", label: "Vendedor", defaultSelected: true, getValue: (l) => l.vendedor || "" },
  { key: "situacao", label: "Situação", defaultSelected: true, getValue: (l) => l.situacao || "" },
  { key: "tipo_servico", label: "Tipo de Serviço", defaultSelected: true, getValue: (l) => l.tipo_servico || "" },
  { key: "data_ultimo_contato", label: "Último Contato", defaultSelected: true, getValue: (l) => formatDate(l.data_ultimo_contato) },
  { key: "dias_sem_resposta", label: "Dias sem Resposta", defaultSelected: true, getValue: (l) => calcDiasSemResposta(l) },
  { key: "created_at", label: "Data de Cadastro", defaultSelected: true, getValue: (l) => formatDate(l.created_at) },
  { key: "observacoes", label: "Observações", defaultSelected: true, getValue: (l) => l.observacoes || "" },
  { key: "email", label: "E-mail", defaultSelected: false, getValue: (l) => l.email || "" },
  { key: "cnpj", label: "CNPJ", defaultSelected: false, getValue: (l) => l.cnpj || "" },
  { key: "projeto_vinculado", label: "Projeto Vinculado", defaultSelected: false, getValue: getProjeto },
  { key: "status_projeto", label: "Status do Projeto", defaultSelected: false, getValue: getStatusProjeto },
  { key: "link_blaster", label: "Link Blaster", defaultSelected: false, getValue: (l) => l.link_blaster || "" },
  { key: "link_chat", label: "Link Chat", defaultSelected: false, getValue: (l) => l.link_chat || "" },
];

export const DEFAULT_COLUMN_KEYS = REPORT_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key);

export function buildReportRows(leads: Lead[], columnKeys: string[]): ReportRow[] {
  const columns = REPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
  return leads.map((lead) => {
    const row: ReportRow = {};
    columns.forEach((col) => {
      row[col.label] = col.getValue(lead);
    });
    return row;
  });
}

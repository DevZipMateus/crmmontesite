import * as XLSX from "xlsx";
import { Lead } from "@/types/lead";
import { ReportRow, calcDiasSemResposta } from "./columns";

const timestampSuffix = () => new Date().toISOString().slice(0, 10);

const countBy = (leads: Lead[], getKey: (lead: Lead) => string) => {
  const counts = new Map<string, number>();
  leads.forEach((lead) => {
    const key = getKey(lead) || "Não definido";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, total]) => ({ label, total }));
};

function buildSummaryRows(leads: Lead[]) {
  const total = leads.length;
  const mediaDias = total > 0
    ? Math.round(leads.reduce((acc, l) => acc + calcDiasSemResposta(l), 0) / total)
    : 0;
  const vinculados = leads.filter((l) => l.project_id).length;

  const rows: Record<string, string | number>[] = [
    { Indicador: "Total de leads no relatório", Valor: total },
    { Indicador: "Leads vinculados a projeto", Valor: vinculados },
    { Indicador: "Média de dias sem resposta", Valor: mediaDias },
    { Indicador: "", Valor: "" },
    { Indicador: "Por Situação", Valor: "" },
    ...countBy(leads, (l) => l.situacao).map((c) => ({ Indicador: c.label, Valor: c.total })),
    { Indicador: "", Valor: "" },
    { Indicador: "Por Vendedor", Valor: "" },
    ...countBy(leads, (l) => l.vendedor || "").map((c) => ({ Indicador: c.label, Valor: c.total })),
    { Indicador: "", Valor: "" },
    { Indicador: "Por Tipo de Serviço", Valor: "" },
    ...countBy(leads, (l) => l.tipo_servico || "").map((c) => ({ Indicador: c.label, Valor: c.total })),
  ];

  return rows;
}

export function exportReportToXlsx(rows: ReportRow[], leads: Lead[], fileName = "relatorio-leads") {
  const workbook = XLSX.utils.book_new();

  const leadsSheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, leadsSheet, "Leads");

  const summarySheet = XLSX.utils.json_to_sheet(buildSummaryRows(leads));
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

  XLSX.writeFile(workbook, `${fileName}_${timestampSuffix()}.xlsx`);
}

export function exportReportToCsv(rows: ReportRow[], fileName = "relatorio-leads") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}_${timestampSuffix()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lead } from "@/types/lead";
import { calcDiasSemResposta } from "@/lib/reports/columns";

interface ReportSummaryCardsProps {
  leads: Lead[];
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ leads }) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const vinculados = leads.filter((l) => l.project_id).length;
    const mediaDias = total > 0
      ? Math.round(leads.reduce((acc, l) => acc + calcDiasSemResposta(l), 0) / total)
      : 0;

    const porSituacao = new Map<string, number>();
    leads.forEach((l) => porSituacao.set(l.situacao, (porSituacao.get(l.situacao) || 0) + 1));
    const situacaoTop = Array.from(porSituacao.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      vinculados,
      pctVinculados: total > 0 ? Math.round((vinculados / total) * 100) : 0,
      mediaDias,
      situacaoTop: situacaoTop ? `${situacaoTop[0]} (${situacaoTop[1]})` : "—",
    };
  }, [leads]);

  const cards = [
    { label: "Leads no relatório", value: stats.total },
    { label: "Vinculados a projeto", value: `${stats.vinculados} (${stats.pctVinculados}%)` },
    { label: "Média dias sem resposta", value: stats.mediaDias },
    { label: "Situação mais comum", value: stats.situacaoTop },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{c.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 truncate">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportSummaryCards;

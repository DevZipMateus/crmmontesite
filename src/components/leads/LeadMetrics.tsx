
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lead } from "@/types/lead";

interface LeadMetricsProps {
  leads: Lead[];
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const LeadMetrics: React.FC<LeadMetricsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  
  const leadsProntos = leads.filter(lead => {
    const s = lead.situacao.toLowerCase();
    return s.includes('pronto') || s.includes('finalizado') || s.includes('site pronto');
  }).length;
  
  const leadsAtrasados = leads.filter(lead => {
    if (lead.situacao.toLowerCase().includes('site pronto')) return false;
    const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 7;
  }).length;
  
  const leadsCancelados = leads.filter(lead => {
    const s = lead.situacao.toLowerCase();
    return s.includes('cancelou') || s.includes('cancelado') || s.includes('cancelamento');
  }).length;

  const leadsComVendedor = leads.filter(lead => lead.vendedor && lead.vendedor.trim() !== '').length;

  const pctProntos = totalLeads > 0 ? ((leadsProntos / totalLeads) * 100).toFixed(1) : '0';
  const pctVendedor = totalLeads > 0 ? ((leadsComVendedor / totalLeads) * 100).toFixed(0) : '0';
  const pctAtrasados = totalLeads > 0 ? ((leadsAtrasados / totalLeads) * 100).toFixed(1) : '0';
  const pctCancelados = totalLeads > 0 ? ((leadsCancelados / totalLeads) * 100).toFixed(0) : '0';

  // Tempo médio de resposta
  const leadsAtivos = leads.filter(lead => !lead.situacao.toLowerCase().includes('site pronto'));
  const tempoMedio = leadsAtivos.length > 0 
    ? Math.round(leadsAtivos.reduce((acc, lead) => {
        const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
        return acc + dias;
      }, 0) / leadsAtivos.length)
    : 0;

  // Status distribution
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      const s = lead.situacao;
      counts[s] = (counts[s] || 0) + 1;
    });
    // Simplify to key groups
    const groups = [
      { label: "Novo", count: 0, color: "bg-gray-400" },
      { label: "Contato", count: 0, color: "bg-blue-500" },
      { label: "Negociando", count: 0, color: "bg-amber-500" },
      { label: "Fechado", count: 0, color: "bg-emerald-500" },
      { label: "Perdido", count: 0, color: "bg-red-500" },
    ];
    leads.forEach(lead => {
      const s = lead.situacao.toLowerCase();
      if (s.includes('novo') || s.includes('recebido')) groups[0].count++;
      else if (s.includes('contato') || s.includes('em contato')) groups[1].count++;
      else if (s.includes('negociando') || s.includes('negociar')) groups[2].count++;
      else if (s.includes('fechado') || s.includes('pronto') || s.includes('finalizado')) groups[3].count++;
      else if (s.includes('cancelou') || s.includes('cancelado') || s.includes('perdido')) groups[4].count++;
      else groups[1].count++; // default to contato
    });
    return groups;
  }, [leads]);

  // Vendedor distribution
  const vendedorDist = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      const v = lead.vendedor || 'Outros';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [leads]);

  const maxVendedorCount = Math.max(...vendedorDist.map(v => v.count), 1);

  const barColors = ['bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500'];

  return (
    <div className="space-y-4">
      {/* Summary subtitle */}
      <p className="text-sm text-muted-foreground">
        {totalLeads} leads ativos · {pctProntos}% prontos · tempo médio de resposta: {tempoMedio} dias
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Main stats card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            {/* Top row */}
            <div className="flex items-start gap-8 mb-6">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Total de Leads</p>
                <p className="text-4xl font-bold text-foreground mt-1">{totalLeads}</p>
                <p className="text-xs text-emerald-600 mt-1">funil saudável</p>
              </div>
              
              <div className="flex-1 grid grid-cols-4 gap-4 pt-1">
                {[
                  { label: "SITES PRONTOS", value: leadsProntos, pct: `${pctProntos}%`, color: "text-emerald-600" },
                  { label: "COM VENDEDOR", value: leadsComVendedor, pct: `${pctVendedor}%`, color: "text-foreground" },
                  { label: "ATRASADOS", value: leadsAtrasados, pct: `${pctAtrasados}%`, color: "text-amber-600" },
                  { label: "CANCELADOS", value: leadsCancelados, pct: `${pctCancelados}%`, color: "text-foreground" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                    <p className={`text-xs ${s.color}`}>{s.pct}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status distribution bars */}
            <div className="grid grid-cols-5 gap-3">
              {statusCounts.map((s, i) => (
                <div key={i}>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.count}</p>
                  <div className="h-1 rounded-full bg-muted mt-1">
                    <div 
                      className={`h-full rounded-full ${s.color}`} 
                      style={{ width: `${totalLeads > 0 ? Math.max((s.count / totalLeads) * 100, 2) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendor distribution sidebar */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-4">
              Distribuição por Vendedor
            </p>
            <div className="space-y-3">
              {vendedorDist.map((v, i) => (
                <div key={v.name} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${getAvatarColor(v.name)}`}>
                    {getInitials(v.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate">{v.name}</span>
                      <span className="text-sm font-semibold ml-2">{v.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                        style={{ width: `${(v.count / maxVendedorCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadMetrics;

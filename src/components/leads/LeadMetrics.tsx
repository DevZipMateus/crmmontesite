
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle, UserCheck, XCircle } from "lucide-react";
import { Lead } from "@/types/lead";

interface LeadMetricsProps {
  leads: Lead[];
}

const LeadMetrics: React.FC<LeadMetricsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  
  const leadsProntos = leads.filter(lead => 
    lead.situacao.toLowerCase().includes('pronto') || 
    lead.situacao.toLowerCase().includes('finalizado') ||
    lead.situacao.toLowerCase().includes('site pronto')
  ).length;
  
  const leadsAtrasados = leads.filter(lead => {
    if (lead.situacao.toLowerCase().includes('site pronto')) return false;
    const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 7;
  }).length;
  
  const leadsCancelados = leads.filter(lead =>
    lead.situacao.toLowerCase().includes('cancelou') ||
    lead.situacao.toLowerCase().includes('cancelado') ||
    lead.situacao.toLowerCase().includes('cancelamento')
  ).length;

  const leadsComVendedor = leads.filter(lead => lead.vendedor && lead.vendedor.trim() !== '').length;

  const pctProntos = totalLeads > 0 ? ((leadsProntos / totalLeads) * 100).toFixed(0) : '0';
  const pctVendedor = totalLeads > 0 ? ((leadsComVendedor / totalLeads) * 100).toFixed(0) : '0';

  const metrics = [
    {
      label: "Total de Leads",
      value: totalLeads,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Sites Prontos",
      value: leadsProntos,
      sub: `${pctProntos}%`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Com Vendedor",
      value: leadsComVendedor,
      sub: `${pctVendedor}%`,
      icon: UserCheck,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      label: "Atrasados",
      value: leadsAtrasados,
      sub: "> 7 dias",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Cancelados",
      value: leadsCancelados,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((m, i) => (
        <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`rounded-lg p-2 ${m.bgColor}`}>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{m.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${m.color}`}>{m.value}</span>
                {m.sub && <span className="text-xs text-muted-foreground">{m.sub}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadMetrics;

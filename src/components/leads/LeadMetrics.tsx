
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, AlertTriangle, TrendingUp, UserCheck } from "lucide-react";
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
    const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 7;
  }).length;
  
  const leadsCancelados = leads.filter(lead =>
    lead.situacao.toLowerCase().includes('cancelou') ||
    lead.situacao.toLowerCase().includes('cancelado') ||
    lead.situacao.toLowerCase().includes('cancelamento')
  ).length;

  const leadsComVendedor = leads.filter(lead => lead.vendedor && lead.vendedor.trim() !== '').length;
  
  const tempoMedioResposta = leads.length > 0 
    ? Math.round(leads.reduce((acc, lead) => {
        const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
        return acc + dias;
      }, 0) / leads.length)
    : 0;

  const metrics = [
    {
      title: "Total de Leads",
      value: totalLeads,
      icon: Users,
      color: "text-blue-600",
      description: "Total de leads no sistema"
    },
    {
      title: "Sites Prontos",
      value: leadsProntos,
      icon: CheckCircle,
      color: "text-green-600",
      description: `${((leadsProntos / totalLeads) * 100).toFixed(1)}% concluídos`
    },
    {
      title: "Leads Atrasados",
      value: leadsAtrasados,
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Sem resposta há mais de 7 dias"
    },
    {
      title: "Com Vendedor",
      value: leadsComVendedor,
      icon: UserCheck,
      color: "text-purple-600",
      description: `${((leadsComVendedor / totalLeads) * 100).toFixed(1)}% atribuídos`
    },
    {
      title: "Cancelados",
      value: leadsCancelados,
      icon: TrendingUp,
      color: "text-gray-600",
      description: "Leads cancelados ou perdidos"
    },
    {
      title: "Tempo Médio (dias)",
      value: tempoMedioResposta,
      icon: Clock,
      color: "text-orange-600",
      description: "Desde o último contato"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadMetrics;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Lead } from "@/types/lead";

interface LeadMetricsProps {
  leads: Lead[];
}

const LeadMetrics: React.FC<LeadMetricsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  
  const leadsProntos = leads.filter(lead => 
    lead.situacao.toLowerCase().includes('pronto') || 
    lead.situacao.toLowerCase().includes('finalizado')
  ).length;
  
  const leadsAtrasados = leads.filter(lead => {
    const dias = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
    return dias > 7;
  }).length;
  
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
      color: "text-blue-600"
    },
    {
      title: "Sites Prontos",
      value: leadsProntos,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Leads Atrasados",
      value: leadsAtrasados,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Tempo Médio (dias)",
      value: tempoMedioResposta,
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadMetrics;

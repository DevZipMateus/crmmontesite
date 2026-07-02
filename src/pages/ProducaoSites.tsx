
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/producao/LoadingState";
import { EmptyState } from "@/components/producao/EmptyState";
import { ProjectTable } from "@/components/producao/ProjectTable";
import { CommandDisplay } from "@/components/producao/CommandDisplay";
import { ListChecks, Clock, CheckCircle, Layers } from "lucide-react";

export default function ProducaoSites() {
  const { toast } = useToast();
  const { projects, loading } = useProjects("Recebido");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
        .then(() => toast({ title: "Copiado!", description: "Comando copiado para a area de transferencia." }))
        .catch(() => toast({ title: "Erro ao copiar", variant: "destructive" }));
    }
  };

  const stats = [
    { label: "Na fila", value: projects.length, icon: ListChecks, color: "text-primary", bg: "bg-primary/10" },
    { label: "Em producao hoje", value: 0, icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Concluidos esta semana", value: 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Tempo medio", value: "—", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <PageLayout
      title="Produção de Sites"
      breadcrumbs={[
        { label: "Início", href: "/home" },
        { label: "Produção de Sites" },
      ]}
    >
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <Card key={i} className="border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`rounded-lg p-2 ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/60">
              <h2 className="text-base font-semibold">Projetos Recebidos para Produção</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{projects.length} projeto(s) na fila</p>
            </div>
            <div className="overflow-x-auto">
              <ProjectTable 
                projects={projects} 
                onSelectProject={setSelectedProjectId}
                onGenerateCommand={setGeneratedText}
                selectedProjectId={selectedProjectId}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                generatedText={generatedText}
              />
            </div>
          </Card>
        )}

        {/* Command Display */}
        {generatedText && (
          <Card className="border-border/60 bg-black text-slate-100 overflow-hidden shadow-lg">
            <CommandDisplay 
              generatedText={generatedText} 
              onCopy={copyToClipboard} 
            />
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

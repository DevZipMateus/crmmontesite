
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/producao/LoadingState";
import { EmptyState } from "@/components/producao/EmptyState";
import { ProjectTable } from "@/components/producao/ProjectTable";
import { CommandDisplay } from "@/components/producao/CommandDisplay";

export default function ProducaoSites() {
  const { toast } = useToast();
  const { projects, loading } = useProjects("Recebido");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const copyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
        .then(() => {
          toast({
            title: "Copiado com sucesso!",
            description: "O comando foi copiado para a área de transferência."
          });
        })
        .catch(() => {
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o texto. Tente novamente.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <PageLayout title="Produção de Sites">
      {loading ? (
        <LoadingState />
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Projetos Recebidos para Produção</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] px-4 sm:px-0">
                <ProjectTable 
                  projects={projects} 
                  onSelectProject={setSelectedProjectId}
                  onGenerateCommand={setGeneratedText}
                  selectedProjectId={selectedProjectId}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
              </div>
            </div>
          </div>

          <CommandDisplay 
            generatedText={generatedText} 
            onCopy={copyToClipboard} 
          />
        </div>
      )}
    </PageLayout>
  );
}

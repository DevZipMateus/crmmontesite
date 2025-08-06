import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClientSubmissionForm } from "@/components/client-submission/ClientSubmissionForm";
import { ClientSubmissionService } from "@/services/clientSubmissionService";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ClientSubmissionPage() {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!hash) {
        setError("Link inválido");
        setLoading(false);
        return;
      }

      try {
        const projectData = await ClientSubmissionService.getProjectByHash(hash);
        setProject(projectData);
      } catch (err) {
        console.error('Error loading project:', err);
        setError("Projeto não encontrado ou link inválido");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [hash]);

  const handleSubmissionComplete = () => {
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Erro</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Enviado com sucesso!</h1>
              <p className="text-muted-foreground">
                Suas imagens foram enviadas para nossa equipe. 
                Em breve entraremos em contato.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <ClientSubmissionForm
          projectId={project.id}
          projectName={project.client_name}
          onSubmissionComplete={handleSubmissionComplete}
        />
      </div>
    </div>
  );
}
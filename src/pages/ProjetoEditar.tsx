
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validation";
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProject, getProjectById } from "@/server/project-actions";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export default function ProjetoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_name: "",
      responsible_name: "",
      template: "",
      status: "",
      client_type: "",
    },
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (project) {
      form.reset(project);
    }
  }, [project, form]);

  const { mutate: updateProjectMutation, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      if (!id) {
        throw new Error("Project ID is missing");
      }
      return updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Sucesso!",
        description: "Projeto atualizado com sucesso.",
      });
      navigate("/projetos");
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: "Houve um erro ao atualizar o projeto.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    updateProjectMutation(values);
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-7xl mx-auto">
        <div className="flex justify-center items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando projeto...
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Editar Projeto</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectInfoForm form={form} />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

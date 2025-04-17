
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Edit, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validation";
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { ManualDataFields } from "@/components/projeto/ManualDataFields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProject, getProjectById } from "@/server/project-actions";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { PageLayout } from "@/components/layout/PageLayout";

export default function ProjetoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showManualInput, setShowManualInput] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_name: "",
      responsible_name: "",
      template: "",
      status: "",
      client_type: "",
      domain: "",
      blaster_link: "",
      partner_link: "",
    },
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (project) {
      // Garantir que todos os campos estejam presentes, mesmo que sejam undefined
      const formData = {
        client_name: project.client_name || "",
        responsible_name: project.responsible_name || "",
        template: project.template || "",
        status: project.status || "",
        client_type: project.client_type || "",
        domain: project.domain || "",
        blaster_link: project.blaster_link || "",
        partner_link: project.partner_link || "",
      };
      form.reset(formData);
      
      // Log para debug
      console.log("Dados do projeto carregados:", formData);
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
      <PageLayout title="Carregando projeto...">
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-gray-500">Carregando informações do projeto...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Editar Projeto"
      actions={
        <Button 
          type="button" 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSubmitting}
          className="flex items-center gap-2 shadow-sm"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      }
    >
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <ProjectInfoForm form={form} />
              
              <div className="flex justify-between items-center my-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowManualInput(!showManualInput)}
                  type="button"
                  className="flex items-center gap-2 shadow-sm"
                >
                  {showManualInput ? (
                    <>
                      <Check className="h-4 w-4" /> Ocultar campos adicionais
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" /> Mostrar campos adicionais
                    </>
                  )}
                </Button>
              </div>
              
              {showManualInput && <ManualDataFields />}
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

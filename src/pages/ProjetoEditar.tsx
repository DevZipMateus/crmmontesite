
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";

// Schema de validação para o formulário de edição
const projectEditSchema = z.object({
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  template: z.string().optional(),
  responsible_name: z.string().optional(),
  status: z.string(),
  domain: z.string().optional(),
  provider_credentials: z.string().optional(),
  client_type: z.string().optional(),
  blaster_link: z.string().optional(),
});

export type ProjectEditValues = z.infer<typeof projectEditSchema>;

// Define a more complete ProjectType that includes all database fields
interface ProjectType {
  id: string;
  client_name: string;
  template: string | null;
  responsible_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  domain: string | null;
  provider_credentials: string | null;
  client_type: string | null;
  blaster_link: string | null;
}

export default function ProjetoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProjectEditValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      client_name: "",
      template: "",
      responsible_name: "",
      status: "Em andamento",
      domain: "",
      provider_credentials: "",
      client_type: "",
      blaster_link: "",
    },
  });

  // Carregar os dados do projeto ao montar o componente
  useEffect(() => {
    async function fetchProject() {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          form.reset({
            client_name: data.client_name || "",
            template: data.template || "",
            responsible_name: data.responsible_name || "",
            status: data.status || "Em andamento",
            domain: data.domain || "",
            provider_credentials: data.provider_credentials || "",
            client_type: data.client_type || "",
            blaster_link: data.blaster_link || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
        toast({
          title: "Erro ao carregar projeto",
          description: "Não foi possível carregar os dados do projeto.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, form, toast]);

  // Função para atualizar o projeto
  const handleUpdate = async (values: ProjectEditValues) => {
    if (!id) return;

    try {
      const projectData = {
        client_name: values.client_name,
        template: values.template || null,
        responsible_name: values.responsible_name || null,
        status: values.status,
        domain: values.domain || null,
        provider_credentials: values.provider_credentials || null,
        client_type: values.client_type || null,
        blaster_link: values.blaster_link || null,
      };

      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Projeto atualizado",
        description: "O projeto foi atualizado com sucesso.",
      });

      navigate(`/projeto/${id}`);
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro ao atualizar projeto",
        description: "Não foi possível atualizar o projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
                <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
                  <h3 className="text-lg font-medium">Informações do projeto</h3>
                  <ProjectInfoForm form={form} />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/projeto/${id}`)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

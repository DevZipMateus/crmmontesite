
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validation";
import { Project } from "@/types/project";

// Import our components
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { Form } from "@/components/ui/form";

// Use the same schema as in validation.ts
export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormEditProps {
  initialValues: Project;
  submitButtonText: string;
  mode: "edit" | "create";
}

export const ProjectFormEdit: React.FC<ProjectFormEditProps> = ({
  initialValues,
  submitButtonText,
  mode,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_name: initialValues?.client_name || "",
      template: initialValues?.template || "",
      responsible_name: initialValues?.responsible_name || "",
      status: initialValues?.status || "Recebido",
      domain: initialValues?.domain || "",
      client_type: initialValues?.client_type || "",
      blaster_link: initialValues?.blaster_link || "",
    },
  });

  const saveProject = async (values: ProjectFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!values.client_name) {
        toast({
          title: "Erro ao atualizar projeto",
          description: "Nome do cliente é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      
      // Include all fields in the projectData object
      const projectData = {
        client_name: values.client_name,
        template: values.template,
        responsible_name: values.responsible_name,
        status: values.status,
        domain: values.domain || null,
        client_type: values.client_type,
        blaster_link: values.blaster_link || null
      };
      
      let error;
      
      if (mode === "edit") {
        const result = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', initialValues.id);
          
        error = result.error;
      } else {
        const result = await supabase
          .from('projects')
          .insert(projectData)
          .select();
          
        error = result.error;
      }
      
      if (error) {
        console.error("Erro ao salvar projeto:", error);
        throw error;
      }
      
      toast({
        title: mode === "edit" ? "Projeto atualizado com sucesso" : "Projeto criado com sucesso",
        description: `O projeto para ${values.client_name} foi ${mode === "edit" ? "atualizado" : "criado"}.`,
      });
      
      if (mode === "edit") {
        navigate(`/projeto/${initialValues.id}`);
      } else {
        navigate("/projetos");
      }
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast({
        title: `Erro ao ${mode === "edit" ? "atualizar" : "criar"} projeto`,
        description: `Não foi possível ${mode === "edit" ? "atualizar" : "criar"} o projeto. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <ProjectInfoForm form={form} />
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            onClick={form.handleSubmit(saveProject)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : submitButtonText}
          </Button>
        </div>
      </div>
    </Form>
  );
};

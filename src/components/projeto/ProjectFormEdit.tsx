
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validation";
import { Project } from "@/types/project";
import { updateProject } from "@/server/project";

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
      partner_link: initialValues?.partner_link || "",
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
      
      let result;
      
      if (mode === "edit" && initialValues) {
        // Make sure we pass the project ID correctly
        result = await updateProject(initialValues.id, values);
      } else {
        // Leave the create functionality as is for now
        result = { success: false, error: new Error("Create not implemented in this component") };
      }
      
      if (!result.success) {
        throw result.error;
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

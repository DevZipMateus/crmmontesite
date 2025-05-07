
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
import { useToast } from "@/hooks/use-toast";

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
  
  // Initialize form with all values from initialValues
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
      provider_credentials: initialValues?.provider_credentials || "",
    },
  });

  const saveProject = async (values: ProjectFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log("Saving project with values:", values);
      
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
        // Create update values object with all fields explicitly defined
        const updateValues = {
          client_name: values.client_name,
          template: values.template,
          responsible_name: values.responsible_name,
          status: values.status,
          domain: values.domain,
          client_type: values.client_type,
          blaster_link: values.blaster_link,
          provider_credentials: values.provider_credentials,
          // Removed partner_link since it doesn't exist in the database
        };
        
        console.log("Sending update values:", updateValues);
        
        // Make sure we pass the project ID correctly
        result = await updateProject(initialValues.id, updateValues);
        console.log("Update result:", result);
        
        if (!result.success) {
          throw new Error(result.message || "Erro ao atualizar projeto");
        }
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
      
      let errorMessage = "Não foi possível atualizar o projeto. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: `Erro ao ${mode === "edit" ? "atualizar" : "criar"} projeto`,
        description: errorMessage,
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

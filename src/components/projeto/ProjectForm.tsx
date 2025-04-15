
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtractedProjectData } from "@/utils/documentParser";
import { projectSchema } from "@/lib/validation";

// Import our components
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { ExtractedDataForm } from "@/components/projeto/ExtractedDataForm";
import { ManualDataFields } from "@/components/projeto/ManualDataFields";
import { Form } from "@/components/ui/form";

// Use the same schema as in validation.ts
export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  extractedData: ExtractedProjectData;
  docContent: string;
  fileName: string;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  extractedData,
  docContent,
  fileName,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showManualInput, setShowManualInput] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_name: extractedData.client_name || "",
      template: extractedData.template || "",
      responsible_name: extractedData.responsible_name || "",
      status: "Recebido",
      domain: extractedData.domain || "",
      client_type: "",
      blaster_link: "",
    },
  });

  const saveProject = async (values: ProjectFormValues) => {
    try {
      if (!values.client_name) {
        toast({
          title: "Erro ao criar projeto",
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
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (error) {
        console.error("Erro ao criar projeto:", error);
        throw error;
      }
      
      toast({
        title: "Projeto criado com sucesso",
        description: `O projeto para ${values.client_name} foi criado.`,
      });
      
      navigate("/projetos");
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
          <h3 className="text-lg font-medium">Informações adicionais do projeto</h3>
          <ProjectInfoForm form={form} />
        </div>
        
        {docContent && (
          <div className="border rounded-lg p-4 bg-slate-50 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Dados extraídos para o projeto</h3>
            </div>
            
            <ExtractedDataForm 
              form={form}
              showManualInput={showManualInput}
              setShowManualInput={setShowManualInput}
              onSubmit={saveProject}
              onCancel={onCancel}
            />
            
            {showManualInput && (
              <>
                <ManualDataFields />
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                  >
                    Voltar para Projetos
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(saveProject)}
                  >
                    Criar Projeto
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Form>
    </>
  );
};

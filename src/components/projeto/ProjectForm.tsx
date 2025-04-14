
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtractedProjectData } from "@/utils/documentParser";

// Import our components
import { ProjectInfoForm } from "@/components/projeto/ProjectInfoForm";
import { ExtractedDataForm } from "@/components/projeto/ExtractedDataForm";
import { ManualDataFields } from "@/components/projeto/ManualDataFields";

const projectFormSchema = z.object({
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  template: z.string().optional(),
  responsible_name: z.string().optional(),
  status: z.string().default("Em andamento"),
  domain: z.string().optional(),
  provider_credentials: z.string().optional(),
  blaster_link: z.string().optional(),
  client_type: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

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
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      client_name: extractedData.client_name || "",
      template: extractedData.template || "",
      responsible_name: extractedData.responsible_name || "",
      status: "Em andamento",
      domain: extractedData.domain || "",
      provider_credentials: extractedData.provider_credentials || "",
      blaster_link: "",
      client_type: "",
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
      
      const projectData = {
        client_name: values.client_name,
        template: values.template || null,
        responsible_name: values.responsible_name || null,
        status: values.status || "Em andamento",
        domain: values.domain || null,
        provider_credentials: values.provider_credentials || null,
        blaster_link: values.blaster_link || null,
        client_type: values.client_type || null
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (error) {
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
      <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
        <h3 className="text-lg font-medium">Informações adicionais do projeto</h3>
        <ProjectInfoForm form={form} />
      </div>
      
      {docContent && (
        <div className="border rounded-lg p-4 bg-slate-50">
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
          
          {showManualInput && <ManualDataFields />}
        </div>
      )}
    </>
  );
};

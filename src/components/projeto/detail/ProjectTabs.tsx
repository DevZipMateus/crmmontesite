
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomizationTab } from "@/components/projeto/CustomizationTab";
import { Project } from "@/types/project";
import { ProjectInformation } from "./ProjectInformation";

interface ProjectTabsProps {
  project: Project | undefined;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="domain">Domínio</TabsTrigger>
        <TabsTrigger value="customization">Personalizações</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="gdocs">Google Docs</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        {project && <ProjectInformation project={project} />}
      </TabsContent>

      <TabsContent value="customization" className="space-y-4">
        {project ? (
          <CustomizationTab projectId={project.id} projectStatus={project.status || ''} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

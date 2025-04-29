
import React from "react";
import { RecentProjectsCard } from "@/components/dashboard/RecentProjectsCard";
import { Project } from "@/types/project";

interface InfoCardsSectionProps {
  projects: Project[];
}

export function InfoCardsSection({ 
  projects
}: InfoCardsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
      <RecentProjectsCard projects={projects} />
    </div>
  );
}


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
    <div className="grid grid-cols-1 gap-8 mb-10 fhd:mb-12">
      <RecentProjectsCard projects={projects} />
    </div>
  );
}

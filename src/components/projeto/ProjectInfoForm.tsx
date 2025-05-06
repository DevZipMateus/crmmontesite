
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/validation";
import { ClientInfoSection } from "./form-sections/ClientInfoSection";
import { SiteDetailsSection } from "./form-sections/SiteDetailsSection";

interface ProjectInfoFormProps {
  form: UseFormReturn<z.infer<typeof projectSchema>>;
}

export const ProjectInfoForm = ({ form }: ProjectInfoFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClientInfoSection form={form} />
        <SiteDetailsSection form={form} />
      </div>
    </div>
  );
};

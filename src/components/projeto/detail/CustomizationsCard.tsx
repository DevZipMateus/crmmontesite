
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomizationList } from "@/components/projeto/CustomizationList";
import { ProjectCustomization } from "@/types/customization";

interface CustomizationsCardProps {
  customizations: ProjectCustomization[];
  isLoading: boolean;
}

export const CustomizationsCard: React.FC<CustomizationsCardProps> = ({
  customizations,
  isLoading
}) => {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle>Customizações Solicitadas</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <CustomizationList customizations={customizations || []} />
        )}
      </CardContent>
    </Card>
  );
};

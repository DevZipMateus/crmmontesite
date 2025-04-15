
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  loading: boolean;
}

const StatsItem: React.FC<StatsItemProps> = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor, 
  loading 
}) => {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`${iconBgColor} p-3 rounded-full`}>
            {icon}
          </div>
          {loading ? (
            <div className={`h-8 w-8 rounded-full border-2 ${iconColor.replace('text-', 'border-')} border-t-transparent animate-spin`}></div>
          ) : (
            <span className="text-3xl font-bold">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsItem;

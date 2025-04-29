
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartComponent } from "@/components/dashboard/charts/BarChartComponent";
import { AreaChartComponent } from "@/components/dashboard/charts/AreaChartComponent";
import { PieChartComponent } from "@/components/dashboard/charts/PieChartComponent";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";
import { useEffect } from "react";

interface ProjectStatusChartProps {
  data: ChartDataItem[];
  title: string;
  type?: "bar" | "pie" | "area";
}

export function ProjectStatusChart({ 
  data, 
  title, 
  type = "bar" 
}: ProjectStatusChartProps) {
  
  useEffect(() => {
    console.log("ProjectStatusChart rendering with data:", data);
  }, [data]);
  
  return (
    <Card className="w-full shadow-sm h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-2 pb-2">
        <div className="h-full w-full">
          {type === "bar" ? (
            <BarChartComponent data={data} />
          ) : type === "area" ? (
            <AreaChartComponent data={data} />
          ) : (
            <PieChartComponent data={data} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

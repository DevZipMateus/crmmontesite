
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface ProjectStatusChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title: string;
  type?: "bar" | "pie" | "area";
}

export function ProjectStatusChart({ 
  data, 
  title, 
  type = "bar" 
}: ProjectStatusChartProps) {
  const COLORS = data.map(item => item.color);
  
  return (
    <Card className="w-full shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[180px] w-full">
          {type === "bar" ? (
            <ChartContainer
              config={{
                status: { label: "Status" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9 }} 
                    height={40} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 9 }} width={25} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: '9px', marginTop: '5px' }} />
                  <Bar 
                    dataKey="value" 
                    name="Quantidade" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={35}
                    fill="var(--primary)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : type === "area" ? (
            <ChartContainer
              config={{
                status: { label: "Status" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9 }} 
                    height={40} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 9 }} width={25} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: '9px', marginTop: '5px' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Quantidade"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <ChartContainer
              config={{
                status: { label: "Status" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: '9px', marginTop: '5px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

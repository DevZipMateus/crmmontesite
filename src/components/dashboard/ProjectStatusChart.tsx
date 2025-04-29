
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
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[160px] w-full">
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
                    tick={{ fontSize: 8 }} 
                    height={30} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 8 }} width={20} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: '8px', marginTop: '2px' }} />
                  <Bar 
                    dataKey="value" 
                    name="Quantidade" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
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
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 15 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 8 }} 
                    height={28} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 8 }} width={20} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: '8px', marginTop: '2px' }} />
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
                    outerRadius={45}
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
                  <Legend wrapperStyle={{ fontSize: '8px', marginTop: '2px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

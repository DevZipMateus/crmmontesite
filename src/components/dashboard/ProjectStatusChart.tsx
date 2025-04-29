
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
    <Card className="w-full shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-2 pb-12">
        <div className="h-[350px] w-full overflow-hidden">
          {type === "bar" ? (
            <ChartContainer
              config={{
                status: { label: "Status" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data} 
                  margin={{ top: 20, right: 40, left: 30, bottom: 70 }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    height={70} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    width={60}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', marginTop: '5px', paddingBottom: '30px' }}
                    verticalAlign="bottom"
                    height={40}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Quantidade" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
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
                <AreaChart 
                  data={data} 
                  margin={{ top: 20, right: 40, left: 30, bottom: 70 }}
                >
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    height={70} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    width={60} 
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', marginTop: '5px', paddingBottom: '30px' }}
                    verticalAlign="bottom"
                    height={40}
                  />
                  {data.map((entry, index) => (
                    <Area
                      key={`area-${index}`}
                      type="monotone"
                      dataKey="value"
                      name={entry.name}
                      stroke={entry.color}
                      fillOpacity={1}
                      fill={`url(#colorGradient${index})`}
                      hide={index !== 0}
                    />
                  ))}
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
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
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
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '10px', 
                      marginTop: '10px',
                      paddingBottom: '10px',
                      width: '100%',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    height={50}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

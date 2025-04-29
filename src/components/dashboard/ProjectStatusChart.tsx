
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
  Area,
  LabelList
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

// Custom component for the Pie chart label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only display the percentage if it's significant enough to be visible
  return percent > 0.05 ? (
    <text 
      x={x} 
      y={y} 
      fill="#888888"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

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
      <CardContent className="flex-1 overflow-hidden pt-2 pb-16">
        <div className="h-[500px] w-full overflow-hidden">
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
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 120 }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={140}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={renderCustomizedLabel}
                    paddingAngle={2}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ 
                      fontSize: '10px', 
                      width: '100%',
                      paddingTop: '20px',
                      bottom: 0,
                      position: 'absolute'
                    }}
                    iconSize={10}
                    iconType="circle"
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


import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface AreaChartComponentProps {
  data: ChartDataItem[];
}

export function AreaChartComponent({ data }: AreaChartComponentProps) {
  console.log("AreaChartComponent rendering with data:", data);
  // Filter out items with zero value to simplify the chart
  const activeData = data.filter(item => item.value > 0);
  
  if (activeData.length === 0) {
    // If no project data, provide some sample data for display
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum projeto com status definido</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        status: { label: "Status" },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={activeData} 
          margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
        >
          <defs>
            {activeData.map((entry, index) => (
              <linearGradient key={`colorGradient${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            height={60} 
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            width={30} 
            domain={[0, 'auto']}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ 
              fontSize: '12px', 
              paddingTop: '15px',
              bottom: '0px',
              position: 'relative'
            }}
          />
          {activeData.map((entry, index) => (
            <Area
              key={`area-${index}`}
              type="monotone"
              dataKey="value"
              name={entry.name}
              stroke={entry.color}
              fillOpacity={1}
              fill={`url(#colorGradient${index})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

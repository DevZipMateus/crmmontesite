
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
  // Filter out items with zero value to simplify the chart
  const activeData = data.filter(item => item.value > 0);
  
  if (activeData.length === 0) {
    // If no project data, provide message
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum projeto com status definido</p>
      </div>
    );
  }

  // Transform data for area chart (separate series for each status)
  const transformedData = activeData.map(item => ({
    name: item.name,
    value: item.value,
    color: item.color,
  }));

  return (
    <ChartContainer
      config={{
        status: { label: "Status" },
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart 
          data={transformedData} 
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <defs>
            {transformedData.map((entry, index) => (
              <linearGradient key={`colorGradient${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }} 
            height={40} 
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            width={30} 
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend 
            verticalAlign="top"
            height={20}
            wrapperStyle={{ 
              fontSize: '11px', 
              paddingTop: '5px'
            }}
          />
          {transformedData.map((entry, index) => (
            <Area
              key={`area-${entry.name}-${index}`}
              type="monotone"
              dataKey="value"
              name={entry.name}
              stroke={entry.color}
              fill={`url(#colorGradient${index})`}
              fillOpacity={0.6}
              stackId={1}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

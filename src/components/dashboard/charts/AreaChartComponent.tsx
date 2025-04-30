
import { 
  LineChart, 
  Line, 
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

  // Transform data for line chart
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={transformedData} 
          margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            height={40} 
            angle={-30}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            width={35} 
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend 
            verticalAlign="top"
            height={36}
            wrapperStyle={{ 
              fontSize: '12px', 
              paddingTop: '8px',
              paddingBottom: '4px'
            }}
          />
          {transformedData.map((entry, index) => (
            <Line
              key={`line-${entry.name}-${index}`}
              type="monotone"
              dataKey="value"
              name={entry.name}
              stroke={entry.color}
              strokeWidth={2}
              dot={{ fill: entry.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

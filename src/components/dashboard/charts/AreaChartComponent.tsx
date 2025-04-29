
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
  return (
    <ChartContainer
      config={{
        status: { label: "Status" },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 20, right: 50, left: 50, bottom: 100 }}
        >
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }} 
            height={90} 
            interval={0}
            angle={-45}
            textAnchor="end"
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            width={50} 
            domain={[0, 'auto']}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend 
            verticalAlign="bottom"
            height={60}
            wrapperStyle={{ 
              fontSize: '12px', 
              paddingTop: '15px',
              paddingBottom: '20px',
              bottom: 0
            }}
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
  );
}

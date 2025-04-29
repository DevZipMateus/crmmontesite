
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend
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
  );
}

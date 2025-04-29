
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface BarChartComponentProps {
  data: ChartDataItem[];
}

export function BarChartComponent({ data }: BarChartComponentProps) {
  return (
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
  );
}

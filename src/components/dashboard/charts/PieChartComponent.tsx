
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartDataItem } from "@/components/dashboard/useStatusChartData";

interface PieChartComponentProps {
  data: ChartDataItem[];
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

// Custom Legend renderer with better visibility and layout
const renderCustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2 bg-background/80 px-2 py-1 rounded">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PieChartComponent({ data }: PieChartComponentProps) {
  return (
    <ChartContainer
      config={{
        status: { label: "Status" },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={60}
            innerRadius={30}
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
            content={renderCustomLegend}
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

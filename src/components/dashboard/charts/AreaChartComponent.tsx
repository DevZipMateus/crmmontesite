
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
  // Prepara dados para gráfico de área para que todos os status sejam representados corretamente
  const preparedData = data.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color
  }));

  return (
    <ChartContainer
      config={{
        status: { label: "Status" },
      }}
      className="w-full h-[500px]" // Estabelecendo altura e largura fixas
    >
      <div style={{ width: '100%', height: '100%' }}>
        <AreaChart 
          data={preparedData} 
          margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
        >
          <defs>
            {preparedData.map((entry, index) => (
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
          {preparedData.map((entry, index) => (
            <Area
              key={`area-${index}`}
              type="monotone"
              dataKey="value"
              name={entry.name}
              stroke={entry.color}
              fillOpacity={1}
              fill={`url(#colorGradient${index})`}
              stackId="1"
            />
          ))}
        </AreaChart>
      </div>
    </ChartContainer>
  );
}

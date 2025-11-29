
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type DataItem = {
  name: string;
  value: number;
  color?: string;
};

type RingChartProps = {
  data: DataItem[];
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  dataKey?: string;
  formatter?: (value: number) => string;
  totalLabel?: string;
  className?: string;
};

const DEFAULT_COLORS = ["#6c5ce7", "#9b87f5", "#a29bfe", "#7E69AB", "#8B5CF6"];

const RingChart: React.FC<RingChartProps> = ({
  data,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 80,
  dataKey = "value",
  formatter = (value) => value.toString(),
  totalLabel = "Total",
  className = "",
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const customizedTooltip = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }
    
    const { name, value } = props.payload[0].payload;
    
    return (
      <div className="bg-white p-2 border border-gray-200 rounded-md shadow-md text-sm">
        <p className="text-gray-700 font-medium">{name}</p>
        <p className="text-gray-900">{formatter(value)}</p>
      </div>
    );
  };

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="relative w-1/2 h-full">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey={dataKey}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={customizedTooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xs text-gray-500">{totalLabel}</span>
          <span className="text-lg font-medium">{formatter(total)}</span>
        </div>
      </div>
      <div className="w-1/2 pl-4">
        <div className="grid gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: item.color || colors[index % colors.length] }} 
                />
                <span className="text-sm text-gray-700 truncate max-w-[120px]">{item.name}</span>
              </div>
              <span className="text-sm font-medium">{formatter(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RingChart;

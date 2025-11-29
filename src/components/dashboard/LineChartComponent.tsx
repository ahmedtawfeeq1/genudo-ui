
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "@/components/dashboard/ChartCard";

type LineChartComponentProps = {
  data: any[];
  title: string;
  dataKey: string;
  selectedValue: string;
  allValues: string[];
  color: string;
  tooltipFormatter?: (value: any) => [string, string];
  infoTooltip?: string;
};

const LineChartComponent = ({
  data,
  title,
  dataKey,
  selectedValue,
  allValues,
  color,
  tooltipFormatter = (value) => [`${value}`, dataKey],
  infoTooltip,
}: LineChartComponentProps) => {
  return (
    <ChartCard title={title} infoTooltip={infoTooltip}>
      <div style={{ height: "320px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
              formatter={tooltipFormatter}
            />
            <Legend />
            {selectedValue === "all" ? (
              <Line
                type="monotone"
                dataKey={allValues[0]}
                name={`${allValues[0]} (Sample)`}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={selectedValue}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default LineChartComponent;

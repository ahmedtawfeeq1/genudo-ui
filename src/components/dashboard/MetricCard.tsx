
import React from "react";
import { ArrowDown, ArrowUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MetricCardProps = {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: Array<{ value: number }>;
  icon: React.ReactNode;
  className?: string;
  secondaryMetric?: {
    label: string;
    value: string | number;
  };
  infoTooltip?: string;
};

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  sparklineData, 
  icon, 
  className, 
  secondaryMetric,
  infoTooltip
}: MetricCardProps) => {
  return (
    <div className={cn("metric-card rounded-lg border border-gray-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {infoTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="ml-1.5 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{infoTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-end mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {trend && (
              <div className="ml-3 flex items-center">
                {trend.isPositive ? (
                  <ArrowUp size={16} className="text-success" />
                ) : (
                  <ArrowDown size={16} className="text-destructive" />
                )}
                <span 
                  className={cn(
                    "ml-1 text-sm font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mt-1">vs last period</div>
          
          {secondaryMetric && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500">{secondaryMetric.label}</p>
              <p className="mt-1 text-base font-semibold text-primary">{secondaryMetric.value}</p>
            </div>
          )}
        </div>
        
        <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-10 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trend && trend.isPositive ? "#10B981" : "#EF4444"} 
                strokeWidth={1.5} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

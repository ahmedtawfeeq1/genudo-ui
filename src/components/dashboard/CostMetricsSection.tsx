
import React from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import { DollarSign, CreditCard } from "lucide-react";

type CostMetricsSectionProps = {
  spendMetrics: {
    total: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  avgConvMetrics: {
    total: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  avgMsgSparkline: Array<{ value: number }>;
  spendSparkline: Array<{ value: number }>;
  avgConvSparkline: Array<{ value: number }>;
};

const CostMetricsSection = ({
  spendMetrics,
  avgConvMetrics,
  avgMsgSparkline,
  spendSparkline,
  avgConvSparkline,
}: CostMetricsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <MetricCard
        title="Total Spend"
        value={`$${spendMetrics.total.toLocaleString()}`}
        trend={spendMetrics.trend}
        icon={<DollarSign size={22} />}
        sparklineData={spendSparkline}
        infoTooltip="Total amount spent across all channels and agents"
      />
      <MetricCard
        title="Avg. Spend / Conv."
        value={avgConvMetrics.total}
        trend={avgConvMetrics.trend}
        icon={<DollarSign size={22} />}
        sparklineData={avgConvSparkline}
        infoTooltip="Average cost per successful conversion"
      />
      <MetricCard
        title="Avg. Spend / Message"
        value={`$${avgMsgSparkline[avgMsgSparkline.length - 1].value.toFixed(2)}`}
        trend={{
          value: 5,
          isPositive: avgMsgSparkline[0].value > avgMsgSparkline[avgMsgSparkline.length - 1].value,
        }}
        icon={<CreditCard size={22} />}
        sparklineData={avgMsgSparkline}
        infoTooltip="Average cost per message sent across all channels"
      />
    </div>
  );
};

export default CostMetricsSection;

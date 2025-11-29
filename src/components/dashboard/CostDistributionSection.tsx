
import React from "react";
import ChartCard from "@/components/dashboard/ChartCard";
import RingChart from "@/components/dashboard/RingChart";
import { RING_COLORS } from "@/utils/dashboardUtils";
import { formatDollarValue, formatNumberValue } from "@/utils/dashboardUtils";

type CostDistributionSectionProps = {
  agentCostDistribution: any[];
  messageDistribution: any[];
};

const CostDistributionSection = ({
  agentCostDistribution,
  messageDistribution,
}: CostDistributionSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <ChartCard
        title="Cost Distribution by Agent"
        infoTooltip="Cost distribution across all agents"
      >
        <RingChart
          data={agentCostDistribution}
          colors={RING_COLORS}
          formatter={formatDollarValue}
          totalLabel="Total Cost"
        />
      </ChartCard>

      <ChartCard
        title="Messages Distribution by Agent"
        infoTooltip="Message volume distribution across all agents"
      >
        <RingChart
          data={messageDistribution}
          colors={RING_COLORS}
          formatter={formatNumberValue}
          totalLabel="Messages"
        />
      </ChartCard>
    </div>
  );
};

export default CostDistributionSection;

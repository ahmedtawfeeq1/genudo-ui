
import React from "react";
import RingChart from "@/components/dashboard/RingChart";
import ChartCard from "@/components/dashboard/ChartCard";
import { RING_COLORS } from "@/utils/dashboardUtils";
import { formatNumberValue } from "@/utils/dashboardUtils";

type DistributionSectionProps = {
  conversationsDistribution: any[];
  convertedClientsDistribution: any[];
  usersServedDistribution: any[];
};

const DistributionSection = ({
  conversationsDistribution,
  convertedClientsDistribution,
  usersServedDistribution,
}: DistributionSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <ChartCard
        title="Conversations by Agent"
        infoTooltip="Distribution of conversations handled by each agent"
        className="md:col-span-1"
      >
        <RingChart
          data={conversationsDistribution}
          colors={RING_COLORS}
          formatter={formatNumberValue}
          totalLabel="Conversations"
        />
      </ChartCard>

      <ChartCard
        title="Users Served by Agent"
        infoTooltip="Distribution of users served by each agent"
        className="md:col-span-1"
      >
        <RingChart
          data={usersServedDistribution}
          colors={RING_COLORS}
          formatter={formatNumberValue}
          totalLabel="Users"
        />
      </ChartCard>

      <ChartCard
        title="Converted Clients by Agent"
        infoTooltip="Distribution of converted clients by each agent"
        className="md:col-span-1"
      >
        <RingChart
          data={convertedClientsDistribution}
          colors={RING_COLORS}
          formatter={formatNumberValue}
          totalLabel="Clients"
        />
      </ChartCard>
    </div>
  );
};

export default DistributionSection;


import React from "react";
import CostMetricsSection from "@/components/dashboard/CostMetricsSection";
import CostDistributionSection from "@/components/dashboard/CostDistributionSection";
import LineChartComponent from "@/components/dashboard/LineChartComponent";
import { COLORS } from "@/utils/dashboardUtils";

type CostContentProps = {
  spendMetrics: any;
  avgConvMetrics: any;
  avgMsgSparkline: any[];
  spendSparkline: any[];
  avgConvSparkline: any[];
  agentCostDistribution: any[];
  messageDistribution: any[];
  filteredAgentSpendData: any[];
  filteredChannelSpendData: any[];
  selectedAgent: string;
  selectedChannel: string;
};

const CostContent = ({
  spendMetrics,
  avgConvMetrics,
  avgMsgSparkline,
  spendSparkline,
  avgConvSparkline,
  agentCostDistribution,
  messageDistribution,
  filteredAgentSpendData,
  filteredChannelSpendData,
  selectedAgent,
  selectedChannel,
}: CostContentProps) => {
  return (
    <>
      <CostMetricsSection
        spendMetrics={spendMetrics}
        avgConvMetrics={avgConvMetrics}
        avgMsgSparkline={avgMsgSparkline}
        spendSparkline={spendSparkline}
        avgConvSparkline={avgConvSparkline}
      />

      <CostDistributionSection
        agentCostDistribution={agentCostDistribution}
        messageDistribution={messageDistribution}
      />

      <div className="grid grid-cols-1 gap-4 mb-4">
        <LineChartComponent
          data={filteredAgentSpendData}
          title="Agent Cost Analysis"
          dataKey="Spend"
          selectedValue={selectedAgent}
          allValues={["Agent 1", "Agent 2", "Agent 3"]}
          color={COLORS.accent}
          tooltipFormatter={(value) => [`$${value}`, "Spend"]}
          infoTooltip="Track spend per agent over time"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <LineChartComponent
          data={filteredChannelSpendData}
          title="Channel Cost Analysis"
          dataKey="Spend"
          selectedValue={selectedChannel}
          allValues={["WhatsApp", "Website", "Messenger"]}
          color={COLORS.accent2}
          tooltipFormatter={(value) => [`$${value}`, "Spend"]}
          infoTooltip="Track spend per channel over time"
        />
      </div>
    </>
  );
};

export default CostContent;

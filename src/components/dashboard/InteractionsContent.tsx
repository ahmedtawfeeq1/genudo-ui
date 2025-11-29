
import React from "react";
import MetricsSection from "@/components/dashboard/MetricsSection";
import DistributionSection from "@/components/dashboard/DistributionSection";
import LineChartComponent from "@/components/dashboard/LineChartComponent";
import { COLORS } from "@/utils/dashboardUtils";

type InteractionsContentProps = {
  conversationMetrics: any;
  userMetrics: any;
  messageMetrics: any;
  conversionMetrics: any;
  avgDailyNewConversations: number;
  avgDailyNewUsers: number;
  conversationsDistribution: any[];
  convertedClientsDistribution: any[];
  usersServedDistribution: any[];
  filteredConversationData: any[];
  filteredMessageData: any[];
  convertedClientsData: any[];
  convSparkline: any[];
  userSparkline: any[];
  messageSparkline: any[];
  conversionSparkline: any[];
  selectedAgent: string;
  selectedChannel: string;
};

const InteractionsContent = ({
  conversationMetrics,
  userMetrics,
  messageMetrics,
  conversionMetrics,
  avgDailyNewConversations,
  avgDailyNewUsers,
  conversationsDistribution,
  convertedClientsDistribution,
  usersServedDistribution,
  filteredConversationData,
  filteredMessageData,
  convertedClientsData,
  convSparkline,
  userSparkline,
  messageSparkline,
  conversionSparkline,
  selectedAgent,
  selectedChannel,
}: InteractionsContentProps) => {
  return (
    <>
      <MetricsSection
        conversationMetrics={conversationMetrics}
        userMetrics={userMetrics}
        messageMetrics={messageMetrics}
        conversionMetrics={conversionMetrics}
        avgDailyNewConversations={avgDailyNewConversations}
        avgDailyNewUsers={avgDailyNewUsers}
        convSparkline={convSparkline}
        userSparkline={userSparkline}
        messageSparkline={messageSparkline}
        conversionSparkline={conversionSparkline}
      />

      <DistributionSection
        conversationsDistribution={conversationsDistribution}
        convertedClientsDistribution={convertedClientsDistribution}
        usersServedDistribution={usersServedDistribution}
      />

      <div className="grid grid-cols-1 gap-4 mb-4">
        <LineChartComponent
          data={filteredConversationData}
          title="Conversations by Agent"
          dataKey="Conversations"
          selectedValue={selectedAgent}
          allValues={["Agent 1", "Agent 2", "Agent 3"]}
          color={COLORS.primary}
          infoTooltip="Track conversation volume handled by each agent over time"
        />

        <LineChartComponent
          data={filteredMessageData}
          title="Messages by Channel"
          dataKey="Messages"
          selectedValue={selectedChannel}
          allValues={["WhatsApp", "Website", "Messenger"]}
          color={COLORS.secondary}
          infoTooltip="Track message volume across different communication channels"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <LineChartComponent
          data={convertedClientsData}
          title="Client Conversion Trends"
          dataKey="Clients"
          selectedValue="Converted"
          allValues={["Converted"]}
          color={COLORS.accent}
          infoTooltip="Track conversion performance over time"
        />
      </div>
    </>
  );
};

export default InteractionsContent;

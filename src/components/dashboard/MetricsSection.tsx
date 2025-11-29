
import React from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import { MessageSquare, Users, MessagesSquare, CheckSquare } from "lucide-react";

type MetricsSectionProps = {
  conversationMetrics: {
    total: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  userMetrics: {
    total: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  messageMetrics: {
    total: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  conversionMetrics: {
    total: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  avgDailyNewConversations: number;
  avgDailyNewUsers: number;
  convSparkline: Array<{ value: number }>;
  userSparkline: Array<{ value: number }>;
  messageSparkline: Array<{ value: number }>;
  conversionSparkline: Array<{ value: number }>;
};

const MetricsSection = ({
  conversationMetrics,
  userMetrics,
  messageMetrics,
  conversionMetrics,
  avgDailyNewConversations,
  avgDailyNewUsers,
  convSparkline,
  userSparkline,
  messageSparkline,
  conversionSparkline,
}: MetricsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <MetricCard
        title="Total Conversations"
        value={conversationMetrics.total.toLocaleString()}
        trend={conversationMetrics.trend}
        icon={<MessageSquare size={22} />}
        sparklineData={convSparkline}
        secondaryMetric={{
          label: "Avg. New Per Day",
          value: avgDailyNewConversations.toLocaleString(),
        }}
        infoTooltip="Total number of unique conversation threads across all channels"
      />
      <MetricCard
        title="Served Users"
        value={userMetrics.total.toLocaleString()}
        trend={userMetrics.trend}
        icon={<Users size={22} />}
        sparklineData={userSparkline}
        secondaryMetric={{
          label: "Avg. New Per Day",
          value: avgDailyNewUsers.toLocaleString(),
        }}
        infoTooltip="Number of unique users who were served by the platform"
      />
      <MetricCard
        title="Messages Sent"
        value={messageMetrics.total.toLocaleString()}
        trend={messageMetrics.trend}
        icon={<MessagesSquare size={22} />}
        sparklineData={messageSparkline}
        secondaryMetric={{
          label: "Per User",
          value: (messageMetrics.total / userMetrics.total).toFixed(1),
        }}
        infoTooltip="Total messages sent across all channels and conversations"
      />
      <MetricCard
        title="Converted Clients"
        value={conversionMetrics.total.toLocaleString()}
        trend={conversionMetrics.trend}
        icon={<CheckSquare size={22} />}
        sparklineData={conversionSparkline}
        secondaryMetric={{
          label: "Conversion Rate",
          value: ((conversionMetrics.total / userMetrics.total) * 100).toFixed(1) + "%",
        }}
        infoTooltip="Number of users who converted to paying clients"
      />
    </div>
  );
};

export default MetricsSection;

import React, { useState } from "react";
import ModernLayout from "@/components/layout/ModernLayout";
import SEOHead from "@/components/common/SEOHead";
import { pageConfigs } from "@/utils/pageConfig";
import { DateRange } from "react-day-picker";
import { AdvancedFilters } from "@/components/dashboard/AdvancedFilters";
import InteractionsContent from "@/components/dashboard/InteractionsContent";
import CostContent from "@/components/dashboard/CostContent";

// Import data
import {
  conversationData,
  messageData,
  agentSpendData,
  channelSpendData,
  convertedClientsData,
  messageSpendData,
  agentCostDistribution,
  messageDistribution,
  conversationsDistribution,
  convertedClientsDistribution,
  usersServedDistribution,
} from "@/data/dashboardData";

// Import utility functions
import {
  calculateMetricData,
} from "@/utils/dashboardUtils";

const Dashboard = () => {
  const [dashboardType, setDashboardType] = useState<string>("interactions");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 3, 3),
    to: new Date(2024, 3, 10),
  });
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  const agents = ["Agent 1", "Agent 2", "Agent 3"];
  const channels = ["WhatsApp", "Website", "Messenger"];

  const activeFiltersCount = 
    (selectedAgent !== "all" ? 1 : 0) + 
    (selectedChannel !== "all" ? 1 : 0) + 
    (dateRange ? 1 : 0);

  // Filter data based on selected agent and channel
  const filteredConversationData = conversationData.map(item => {
    const filtered: any = { date: item.date };
    
    if (selectedAgent === "all") {
      filtered["Agent 1"] = item["Agent 1"];
    } else {
      filtered[selectedAgent] = item[selectedAgent as keyof typeof item];
    }
    
    return filtered;
  });

  const filteredMessageData = messageData.map(item => {
    const filtered: any = { date: item.date };
    
    if (selectedChannel === "all") {
      filtered["WhatsApp"] = item["WhatsApp"];
    } else {
      filtered[selectedChannel] = item[selectedChannel as keyof typeof item];
    }
    
    return filtered;
  });

  const filteredAgentSpendData = agentSpendData.map(item => {
    const filtered: any = { date: item.date };
    
    if (selectedAgent === "all") {
      filtered["Agent 1"] = item["Agent 1"];
    } else {
      filtered[selectedAgent] = item[selectedAgent as keyof typeof item];
    }
    
    return filtered;
  });

  const filteredChannelSpendData = channelSpendData.map(item => {
    const filtered: any = { date: item.date };
    
    if (selectedChannel === "all") {
      filtered["WhatsApp"] = item["WhatsApp"];
    } else {
      filtered[selectedChannel] = item[selectedChannel as keyof typeof item];
    }
    
    return filtered;
  });

  // Calculate metrics
  const conversationMetrics = calculateMetricData(conversationData, ["Agent 1", "Agent 2", "Agent 3"]);
  const userMetrics = {
    total: 856,
    trend: {
      value: 8,
      isPositive: true
    }
  };
  const messageMetrics = calculateMetricData(messageData, ["WhatsApp", "Website", "Messenger"]);
  const conversionMetrics = calculateMetricData(convertedClientsData, ["Converted"]);

  // Calculate sparkline data
  const convSparkline = conversationData.map(item => ({
    value: item["Agent 1"] + item["Agent 2"] + item["Agent 3"]
  }));

  const userSparkline = conversationData.map(item => ({
    value: Math.round((item["Agent 1"] + item["Agent 2"] + item["Agent 3"]) * 0.8)
  }));

  const messageSparkline = messageData.map(item => ({
    value: item["WhatsApp"] + item["Website"] + item["Messenger"]
  }));

  const conversionSparkline = convertedClientsData.map(item => ({
    value: item["Converted"]
  }));

  // Spend metrics calculations
  const totalAgentSpend = agentSpendData.reduce((acc, item) => {
    return acc + item["Agent 1"] + item["Agent 2"] + item["Agent 3"];
  }, 0);

  const spendMetrics = {
    total: Math.round(totalAgentSpend * 10),
    trend: {
      value: 8,
      isPositive: false
    }
  };

  const spendSparkline = agentSpendData.map(item => ({
    value: (item["Agent 1"] + item["Agent 2"] + item["Agent 3"]) * 10
  }));

  const avgConvMetrics = {
    total: "$1.69",
    trend: {
      value: 3,
      isPositive: false
    }
  };

  const avgConvSparkline = agentSpendData.map((item, index) => {
    const totalSpend = item["Agent 1"] + item["Agent 2"] + item["Agent 3"];
    const totalConversations = conversationData[index] ? 
      conversationData[index]["Agent 1"] + conversationData[index]["Agent 2"] + conversationData[index]["Agent 3"] : 1;
    return {
      value: totalSpend / totalConversations
    };
  });

  const avgMsgSparkline = messageSpendData.map(item => ({
    value: item["Per Message"]
  }));

  const daysInPeriod = 7;
  const avgDailyNewConversations = Math.round(conversationMetrics.total / daysInPeriod);
  const avgDailyNewUsers = Math.round(userMetrics.total / daysInPeriod);

  return (
    <>
      <SEOHead 
        title={pageConfigs.dashboard.title}
        description={pageConfigs.dashboard.description}
        keywords={pageConfigs.dashboard.keywords}
      />
      <ModernLayout 
        title="Dashboard" 
        dashboardType={dashboardType} 
        setDashboardType={setDashboardType}
        openFiltersDialog={() => setFiltersDialogOpen(true)}
        activeFiltersCount={activeFiltersCount}
      >
        {filtersDialogOpen && (
          <AdvancedFilters 
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            agents={agents}
            channels={channels}
            dateRange={dateRange}
            setDateRange={setDateRange}
            open={filtersDialogOpen}
            setOpen={setFiltersDialogOpen}
          />
        )}
        
        {dashboardType === "interactions" ? (
          <InteractionsContent 
            conversationMetrics={conversationMetrics}
            userMetrics={userMetrics}
            messageMetrics={messageMetrics}
            conversionMetrics={conversionMetrics}
            avgDailyNewConversations={avgDailyNewConversations}
            avgDailyNewUsers={avgDailyNewUsers}
            conversationsDistribution={conversationsDistribution}
            convertedClientsDistribution={convertedClientsDistribution}
            usersServedDistribution={usersServedDistribution}
            filteredConversationData={filteredConversationData}
            filteredMessageData={filteredMessageData}
            convertedClientsData={convertedClientsData}
            convSparkline={convSparkline}
            userSparkline={userSparkline}
            messageSparkline={messageSparkline}
            conversionSparkline={conversionSparkline}
            selectedAgent={selectedAgent}
            selectedChannel={selectedChannel}
          />
        ) : (
          <CostContent 
            spendMetrics={spendMetrics}
            avgConvMetrics={avgConvMetrics}
            avgMsgSparkline={avgMsgSparkline}
            spendSparkline={spendSparkline}
            avgConvSparkline={avgConvSparkline}
            agentCostDistribution={agentCostDistribution}
            messageDistribution={messageDistribution}
            filteredAgentSpendData={filteredAgentSpendData}
            filteredChannelSpendData={filteredChannelSpendData}
            selectedAgent={selectedAgent}
            selectedChannel={selectedChannel}
          />
        )}
      </ModernLayout>
    </>
  );
};

export default Dashboard;

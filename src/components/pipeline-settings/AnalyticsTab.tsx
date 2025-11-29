// Enhanced AnalyticsTab with pipeline metrics and ring charts

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RingChart from "@/components/dashboard/RingChart";
import { DollarSign, Target, Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { formatDollarValue, formatNumberValue } from "@/utils/dashboardUtils";

const RING_COLORS = ["#6c5ce7", "#8B5CF6", "#a29bfe", "#7E69AB", "#D6BCFA"];

interface PipelineMetrics {
  total_cost: number;
  total_opportunities: number;
  active_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  total_messages?: number;
  avg_cost_per_deal?: number;
  avg_cost_per_message?: number;
}

interface AnalyticsTabProps {
  // Ring charts data
  costDistribution: Array<{ stage_id: string; stage_name: string; total_cost: number }>;
  messageDistribution: Array<{ stage_id: string; stage_name: string; message_count: number }>;
  performanceDistribution: Array<{ stage_id: string; stage_name: string; opportunity_count: number; conversation_count: number }>;
  // Pipeline metrics from settings page
  metrics?: PipelineMetrics;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  costDistribution,
  messageDistribution,
  performanceDistribution,
  metrics,
}) => {
  // Helper: Transform data for RingChart
  const costData = (costDistribution || []).map((item, i) => ({
    name: item.stage_name.length > 24 ? item.stage_name.slice(0, 24) + "..." : item.stage_name,
    value: Number(item.total_cost) || 0,
    color: RING_COLORS[i % RING_COLORS.length]
  }));
  const messageData = (messageDistribution || []).map((item, i) => ({
    name: item.stage_name.length > 24 ? item.stage_name.slice(0, 24) + "..." : item.stage_name,
    value: Number(item.message_count) || 0,
    color: RING_COLORS[i % RING_COLORS.length]
  }));
  const perfData = (performanceDistribution || []).map((item, i) => ({
    name: item.stage_name.length > 24 ? item.stage_name.slice(0, 24) + "..." : item.stage_name,
    value: Number(item.opportunity_count) || 0,
    color: RING_COLORS[i % RING_COLORS.length]
  }));

  // Calculate total messages from distribution if not provided
  const totalMessages = metrics?.total_messages || 
    messageData.reduce((sum, item) => sum + item.value, 0);

  // Calculate averages if not provided
  const avgCostPerDeal = metrics?.avg_cost_per_deal || 
    (metrics && metrics.total_opportunities > 0 ? metrics.total_cost / metrics.total_opportunities : 0);
  
  const avgCostPerMessage = metrics?.avg_cost_per_message || 
    (metrics && totalMessages > 0 ? metrics.total_cost / totalMessages : 0);

  return (
    <div className="space-y-8 py-6">
      {/* Pipeline Summary Metrics */}
      {metrics && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pipeline Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Cost Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <p className="text-xs font-medium text-blue-800">Total Pipeline Cost</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mb-2">{formatDollarValue(metrics.total_cost)}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-blue-700">
                        <span>Avg/Deal:</span>
                        <span className="font-medium">{avgCostPerDeal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-blue-700">
                        <span>Avg/Message:</span>
                        <span className="font-medium">${avgCostPerMessage.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Deals Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-purple-600" />
                      <p className="text-xs font-medium text-purple-800">Total Deals</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mb-2">{metrics.total_opportunities}</p>
                    <div className="flex items-center justify-between text-xs text-purple-700">
                      <span>Messages:</span>
                      <span className="font-medium">{totalMessages.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Deals Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-5 h-5 text-orange-600" />
                      <p className="text-xs font-medium text-orange-800">Active Deals</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 mb-2">{metrics.active_opportunities}</p>
                    <p className="text-xs text-orange-600">
                      {metrics.total_opportunities > 0 
                        ? `${((metrics.active_opportunities / metrics.total_opportunities) * 100).toFixed(1)}% of total`
                        : 'In Progress'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Won Deals Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <p className="text-xs font-medium text-green-800">Deals Won</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mb-2">{metrics.won_opportunities}</p>
                    <p className="text-xs text-green-600">
                      {metrics.total_opportunities > 0 
                        ? `${((metrics.won_opportunities / metrics.total_opportunities) * 100).toFixed(1)}% win rate`
                        : 'Successful'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lost Deals Card */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <p className="text-xs font-medium text-red-800">Deals Lost</p>
                    </div>
                    <p className="text-2xl font-bold text-red-900 mb-2">{metrics.lost_opportunities}</p>
                    <p className="text-xs text-red-600">
                      {metrics.total_opportunities > 0 
                        ? `${((metrics.lost_opportunities / metrics.total_opportunities) * 100).toFixed(1)}% loss rate`
                        : 'Unsuccessful'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Stage Distribution Charts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cost per Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Cost Distribution</CardTitle>
              <CardDescription className="text-gray-600">
                Total messaging cost allocated per pipeline stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {costData.length > 0 && costData.some(d => d.value > 0) ? (
                <RingChart
                  data={costData}
                  colors={RING_COLORS}
                  formatter={formatDollarValue}
                  totalLabel="Total Cost"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-center">
                  <span className="font-medium text-gray-700 mb-2">No Cost Data</span>
                  <span className="text-gray-400 text-xs">Costs will appear after you run deals and automate outreach.</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Messages per Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Messages by Stage</CardTitle>
              <CardDescription className="text-gray-600">
                Total messages sent by stage, including automations and replies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messageData.length > 0 && messageData.some(d => d.value > 0) ? (
                <RingChart
                  data={messageData}
                  colors={RING_COLORS}
                  formatter={formatNumberValue}
                  totalLabel="Total Messages"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-center">
                  <span className="font-medium text-gray-700 mb-2">No Message Data</span>
                  <span className="text-gray-400 text-xs">Send messages and enable automation to see activity.</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Stage Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Stage Performance</CardTitle>
              <CardDescription className="text-gray-600">
                Opportunity count per stage—shows active flow and blockages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {perfData.length > 0 && perfData.some(d => d.value > 0) ? (
                <RingChart
                  data={perfData}
                  colors={RING_COLORS}
                  formatter={formatNumberValue}
                  totalLabel="Opportunities"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-center">
                  <span className="font-medium text-gray-700 mb-2">No Opportunity Data</span>
                  <span className="text-gray-400 text-xs">Add opportunities to track performance flow.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
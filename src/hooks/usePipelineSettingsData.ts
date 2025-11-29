
import { useState, useCallback } from "react";
import { Pipeline, ConnectorAccount, StageData, PipelineMetrics } from "@/types/pipeline";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Add types for new analytics
type StageCostRing = { stage_id: string; stage_name: string; total_cost: number };
type StageMessageRing = { stage_id: string; stage_name: string; message_count: number };
type StagePerformanceRing = { stage_id: string; stage_name: string; opportunity_count: number; conversation_count: number };

/**
 * usePipelineSettingsData
 * Static-mode pipeline settings data: returns mock pipeline, connector account,
 * stages, metrics and ring chart distributions. Replace implementations with
 * real backend calls on integration.
 */
export function usePipelineSettingsData(id: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [connectorAccount, setConnectorAccount] = useState<ConnectorAccount | null>(null);
  const [stages, setStages] = useState<StageData[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    total_cost: 0,
    total_opportunities: 0,
    active_opportunities: 0,
    won_opportunities: 0,
    lost_opportunities: 0,
  });
  const [loading, setLoading] = useState(true);

  // New analytics state for ring charts
  const [costDistribution, setCostDistribution] = useState<StageCostRing[]>([]);
  const [messageDistribution, setMessageDistribution] = useState<StageMessageRing[]>([]);
  const [performanceDistribution, setPerformanceDistribution] = useState<StagePerformanceRing[]>([]);

  const fetchPipelineData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const uid = user?.id || 'u-1';
      const hasChannel = id !== 'pipe-4';
      const pipelineMock: Pipeline = {
        id,
        user_id: uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pipeline_name: "Sales Pipeline",
        pipeline_description: "Primary outbound funnel",
        connector_account_id: hasChannel ? "acc-1" : null,
        is_active: true,
        is_archived: false,
        routing_instructions: null,
      };
      setPipeline(pipelineMock);

      const connectorMock: ConnectorAccount = {
        id: "acc-1",
        user_id: uid,
        channel_type: "WHATSAPP",
        connector_account_identifier: "WhatsApp Business",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        connector_api_key: null,
        connector_sender_provider_id: "15550101@s.whatsapp.net",
        external_account_id: "ext-acc-001",
        result_metadata: { phoneNumber: "15550101" },
      };
      setConnectorAccount(hasChannel ? connectorMock : null);

      await fetchStageData(id);
      await fetchMetrics(id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch pipeline details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, id, toast]);

  const fetchMetrics = async (_pipelineId: string) => {
    const total_opportunities = 10;
    const active_opportunities = 7;
    const won_opportunities = 2;
    const lost_opportunities = 1;
    const total_cost = 28.6;
    setMetrics({ total_cost, total_opportunities, active_opportunities, won_opportunities, lost_opportunities });
  };

  const fetchStageData = async (_pipelineId: string) => {
    const stagesMock: StageData[] = [
      { id: 's1', stage_name: 'New', stage_nature: 'neutral', opportunity_count: 5, total_cost: 12.4 },
      { id: 's2', stage_name: 'Qualified', stage_nature: 'neutral', opportunity_count: 3, total_cost: 9.1 },
      { id: 's3', stage_name: 'Won', stage_nature: 'won', opportunity_count: 2, total_cost: 7.1 },
    ];
    setStages(stagesMock);
  };

  // New data fetching for ring charts
  const fetchCostDistribution = async (_pipelineId: string) => {
    setCostDistribution([
      { stage_id: 's1', stage_name: 'New', total_cost: 12.4 },
      { stage_id: 's2', stage_name: 'Qualified', total_cost: 9.1 },
    ]);
  };

  const fetchMessageDistribution = async (_pipelineId: string) => {
    setMessageDistribution([
      { stage_id: 's1', stage_name: 'New', message_count: 42 },
      { stage_id: 's2', stage_name: 'Qualified', message_count: 21 },
    ]);
  };

  const fetchPerformanceDistribution = async (_pipelineId: string) => {
    setPerformanceDistribution([
      { stage_id: 's1', stage_name: 'New', opportunity_count: 5, conversation_count: 10 },
      { stage_id: 's2', stage_name: 'Qualified', opportunity_count: 3, conversation_count: 6 },
    ]);
  };

  return {
    pipeline,
    connectorAccount,
    stages,
    metrics,
    loading,
    fetchPipelineData,
    setPipeline,
    setConnectorAccount,
    setStages,
    // New ring chart analytics
    costDistribution,
    messageDistribution,
    performanceDistribution,
  };
}

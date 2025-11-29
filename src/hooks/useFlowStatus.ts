// Custom hook for managing AI flow status state
// This tracks the current state of AI interactions and pipeline modifications

import { useState, useCallback } from 'react';

export interface FlowStatusData {
  status: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export const useFlowStatus = () => {
  const [flowStatus, setFlowStatusState] = useState<FlowStatusData | null>(null);
  const [flowHistory, setFlowHistory] = useState<FlowStatusData[]>([]);

  const updateFlowStatus = useCallback((status: string, metadata?: Record<string, any>) => {
    const newFlowStatus: FlowStatusData = {
      status,
      timestamp: new Date(),
      metadata
    };

    setFlowStatusState(newFlowStatus);
    setFlowHistory(prev => [...prev, newFlowStatus]);
  }, []);

  const clearFlowStatus = useCallback(() => {
    setFlowStatusState(null);
  }, []);

  const getLastFlowStatus = useCallback((statusType?: string) => {
    if (!statusType) {
      return flowHistory[flowHistory.length - 1] || null;
    }
    
    // Find the most recent status of the specified type
    for (let i = flowHistory.length - 1; i >= 0; i--) {
      if (flowHistory[i].status === statusType) {
        return flowHistory[i];
      }
    }
    
    return null;
  }, [flowHistory]);

  const hasStatus = useCallback((statusType: string) => {
    return flowHistory.some(item => item.status === statusType);
  }, [flowHistory]);

  return {
    flowStatus,
    flowHistory,
    updateFlowStatus,
    clearFlowStatus,
    getLastFlowStatus,
    hasStatus,
    // Helper getters
    isNewPipeline: flowStatus?.status === 'new_pipeline',
    isPipelineUpdated: flowStatus?.status === 'pipeline_updated',
    isStageAdded: flowStatus?.status === 'stage_added',
    isProcessing: flowStatus?.status === 'processing',
    isCompleted: flowStatus?.status === 'completed',
    isError: flowStatus?.status === 'error'
  };
};

export default useFlowStatus;


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from "@/lib/mock-db";
import { toast } from '@/hooks/use-toast';

export interface GeneratedPipeline {
  id: string;
  flow_status: 'new_pipeline' | 'pipeline_updated' | 'pipeline_error';
  json_result: any;
  session_id: string;
  user_id: string;
  business_needs: string;
  created_at: string;
  updated_at: string;
}

interface UseGeneratedPipelinesOptions {
  sessionId?: string | null;
  autoRefresh?: boolean;
  onPipelineUpdate?: (pipeline: GeneratedPipeline) => void;
}

export function useGeneratedPipelines(options: UseGeneratedPipelinesOptions = {}) {
  const { user } = useAuth();
  const { sessionId, autoRefresh = true, onPipelineUpdate } = options;
  
  const [pipelines, setPipelines] = useState<GeneratedPipeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Class: GeneratedPipelinesLoader
  // Purpose: Provide static generated pipelines for UI-only mode.
  // TODO: Integrate with backend persistence.
  const loadPipelines = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      await new Promise(res => setTimeout(res, 150));
      const demo: GeneratedPipeline[] = sessionId ? [
        {
          id: `gp-${Date.now()}`,
          flow_status: 'new_pipeline',
          json_result: { pipeline: { pipeline_name: 'Sales Pipeline' } },
          session_id: sessionId,
          user_id: user.id,
          business_needs: 'Demo generation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ] : [];
      setPipelines(demo);
    } catch (err) {
      console.error('Error loading generated pipelines (static):', err);
      setError(err instanceof Error ? err.message : 'Failed to load pipelines');
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  // Get the latest pipeline for current session
  const getLatestPipeline = useCallback(() => {
    if (!sessionId) return null;
    
    const sessionPipelines = pipelines.filter(p => p.session_id === sessionId);
    return sessionPipelines.length > 0 ? sessionPipelines[0] : null;
  }, [pipelines, sessionId]);

  // Get latest pipeline data (for backward compatibility)
  const getLatestPipelineData = useCallback(() => {
    const latest = getLatestPipeline();
    return latest?.json_result || null;
  }, [getLatestPipeline]);

  // Function: deletePipeline
  // Purpose: Remove pipeline from local state in static mode.
  const deletePipeline = useCallback(async (pipelineId: string) => {
    if (!user) return false;
    try {
      await new Promise(res => setTimeout(res, 100));
      setPipelines(prev => prev.filter(p => p.id !== pipelineId));
      toast({ title: "Pipeline Deleted", description: "The pipeline has been successfully deleted." });
      return true;
    } catch (err) {
      console.error('Error deleting pipeline (static):', err);
      setError(err instanceof Error ? err.message : 'Failed to delete pipeline');
      toast({ title: "Delete Failed", description: "Failed to delete the pipeline. Please try again.", variant: "destructive" });
      return false;
    }
  }, [user]);

  // Class: GeneratedPipelinesRealtimeSimulator
  // Purpose: Simulate realtime pipeline creation updates in static mode.
  useEffect(() => {
    if (!user || !autoRefresh) return;
    console.log('🔄 [Static] Starting generated pipelines simulation');
    const interval = setInterval(() => {
      const newPipeline: GeneratedPipeline = {
        id: `gp-${Date.now()}`,
        flow_status: 'pipeline_updated',
        json_result: { pipeline: { pipeline_name: 'Sales Pipeline (Updated)' } },
        session_id: sessionId || 's-1',
        user_id: user.id,
        business_needs: 'Auto refresh update',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPipelines(prev => [newPipeline, ...prev]);
      if (onPipelineUpdate) onPipelineUpdate(newPipeline);
      toast({ title: "Pipeline Updated!", description: "Your pipeline has been successfully modified." });
    }, 20000);
    return () => {
      console.log('🔌 [Static] Stopping generated pipelines simulation');
      clearInterval(interval);
    };
  }, [user, autoRefresh, onPipelineUpdate, sessionId]);

  // Load pipelines on mount and when dependencies change
  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  return {
    pipelines,
    isLoading,
    error,
    loadPipelines,
    getLatestPipeline,
    getLatestPipelineData,
    deletePipeline,
    clearError: () => setError(null),
  };
}

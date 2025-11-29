// Enhanced data management hooks using React Query
// Static-mode implementation: returns mock data structures that match
// the original types, with comments documenting integration points.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pipeline, Stage, Agent, StageAgent } from '@/types/pipeline';

// Custom hook for managing pipeline data with React Query
// This replaces static data with dynamic, database-backed functionality
/**
 * usePipelineData
 * Returns pipeline, stages, agents and mutations backed by mock data.
 * Replace queryFns/mutationFns with real API calls when integrating backend.
 */
export function usePipelineData(pipelineId: string) {
  const queryClient = useQueryClient();

  // Fetch the main pipeline information
  // React Query automatically caches this and provides loading/error states
  const {
    data: pipeline,
    isLoading: pipelineLoading,
    error: pipelineError
  } = useQuery({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return null;
      await new Promise(res => setTimeout(res, 150));
      return {
        id: pipelineId,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pipeline_name: 'Sales Pipeline',
        pipeline_description: 'Primary outbound funnel',
        connector_account_id: 'acc-1',
        is_active: true,
        is_archived: false,
      } as Pipeline;
    },
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all stages for this pipeline, ordered by position
  // This maintains the sequential flow that your existing UI expects
  const {
    data: stages,
    isLoading: stagesLoading,
    error: stagesError
  } = useQuery({
    queryKey: ['stages', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [] as Stage[];
      await new Promise(res => setTimeout(res, 150));
      const mock: Stage[] = [
        { id: 's1', pipeline_id: pipelineId, name: 'New', description: 'New leads', position: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), badge: 'ACTIVE', stage_nature: 'neutral' } as any,
        { id: 's2', pipeline_id: pipelineId, name: 'Qualified', description: 'Qualified leads', position: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), badge: 'ACTIVE', stage_nature: 'neutral' } as any,
        { id: 's3', pipeline_id: pipelineId, name: 'Won', description: 'Closed won', position: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), badge: 'WON', stage_nature: 'won' } as any,
      ];
      return mock;
    },
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all available agents
  // These are shared across all pipelines, so we cache them globally
  const {
    data: agents,
    isLoading: agentsLoading,
    error: agentsError
  } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      await new Promise(res => setTimeout(res, 150));
      const mock: Agent[] = [
        { id: 'agent-001', name: 'Sales Pro Alpha', role: 'AI Agent', persona: '', instructions: '', capabilities: [], color: '#3b82f6', created_at: new Date().toISOString() } as any,
        { id: 'agent-002', name: 'Assistant Beta', role: 'AI Agent', persona: '', instructions: '', capabilities: [], color: '#3b82f6', created_at: new Date().toISOString() } as any,
      ];
      return mock;
    },
    staleTime: 15 * 60 * 1000,
  });

  // Note: stage_agents table doesn't exist in the current schema
  // We'll simulate it with empty data for now
  const {
    data: stageAgents,
    isLoading: stageAgentsLoading,
    error: stageAgentsError
  } = useQuery({
    queryKey: ['stage-agents', pipelineId],
    queryFn: async () => {
      // Return empty array since stage_agents table doesn't exist
      // This could be implemented later when the table is added to the schema
      return [] as StageAgent[];
    },
    enabled: !!stages?.length,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation for saving pipeline and stage position updates
  // This handles the drag-and-drop functionality from your existing UI
  const savePipelineMutation = useMutation({
    mutationFn: async (stageUpdates: Array<{ id: string; x_position: number; y_position: number }>) => {
      // Note: x_position and y_position don't exist in current schema
      // This would need to be added to the stages table
      console.log('Stage position updates would be saved here:', stageUpdates);
      // For now, just return success
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate cache to trigger refetch with updated positions
      queryClient.invalidateQueries({ queryKey: ['stages', pipelineId] });
    },
    onError: (error) => {
      console.error('Failed to save pipeline:', error);
    },
  });

  // Mutation for creating new stages
  // This supports the AI chat functionality that can add stages dynamically
  const createStageMutation = useMutation({
    mutationFn: async (stageData: { name: string; description?: string; position?: number }) => {
      await new Promise(res => setTimeout(res, 150));
      return { id: `s-${Date.now()}`, pipeline_id: pipelineId, name: stageData.name, description: stageData.description, position: (stages?.length || 0) + 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), badge: 'ACTIVE', stage_nature: 'neutral' } as any;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stages', pipelineId] }); },
  });

  // Mutation for assigning agents to stages
  // Note: This would require a stage_agents table to be created
  const assignAgentMutation = useMutation({
    mutationFn: async ({ stageId, agentId }: { stageId: string; agentId: string }) => {
      await new Promise(res => setTimeout(res, 150));
      return { stageId, agentId } as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage-agents', pipelineId] });
      queryClient.invalidateQueries({ queryKey: ['stages', pipelineId] });
    },
  });

  // Calculate loading state across all queries
  const isLoading = pipelineLoading || stagesLoading || agentsLoading || stageAgentsLoading;
  const error = pipelineError || stagesError || agentsError || stageAgentsError;

  return {
    // Data from queries
    pipeline,
    stages,
    agents,
    stageAgents,
    
    // Loading and error states
    isLoading,
    error,
    
    // Mutation functions for updating data
    savePipeline: savePipelineMutation.mutateAsync,
    createStage: createStageMutation.mutateAsync,
    assignAgent: assignAgentMutation.mutateAsync,
    
    // Mutation loading states
    isSaving: savePipelineMutation.isPending,
    isCreatingStage: createStageMutation.isPending,
    isAssigningAgent: assignAgentMutation.isPending,
  };
}

// Hook for listing all pipelines for the current user
// This supports the pipeline management features
/**
 * usePipelineList
 * Returns a static list of pipelines with minimal fields.
 */
export function usePipelineList() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      await new Promise(res => setTimeout(res, 150));
      return [
        { id: 'pipe-1', user_id: 'demo-user', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), pipeline_name: 'Sales Pipeline', pipeline_description: 'Primary outbound funnel', connector_account_id: 'acc-1', is_active: true, is_archived: false } as any,
        { id: 'pipe-2', user_id: 'demo-user', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), pipeline_name: 'Inbound Leads', pipeline_description: 'Messenger intake', connector_account_id: 'acc-2', is_active: false, is_archived: false } as any,
      ] as Pipeline[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for creating new pipelines
/**
 * useCreatePipeline
 * Creates a pipeline in static mode by returning a mock object.
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pipelineData: {
      name: string;
      description?: string;
      stages?: Array<{ name: string; description?: string }>;
    }) => {
      await new Promise(res => setTimeout(res, 200));
      return {
        id: `pipe-${Date.now()}`,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pipeline_name: pipelineData.name,
        pipeline_description: pipelineData.description,
        connector_account_id: null,
        is_active: true,
        is_archived: false,
      } as Pipeline;
    },
    onSuccess: () => {
      // Refresh the pipelines list to show the new pipeline
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

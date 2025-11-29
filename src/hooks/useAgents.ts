import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as agentService from "@/services/agentService";
import type {
  Agent,
  AgentWithRelations,
  AgentListItem,
  CreateAgentDTO,
  UpdateAgentDTO,
  KnowledgeFile,
  AgentMetrics,
} from "@/types/agent";

/**
 * React Query Hooks for Agent Management
 */

// ============================================================================
// Query Keys
// ============================================================================

export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (filters?: any) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  metrics: (id: string) => [...agentKeys.all, "metrics", id] as const,
  knowledgeFiles: (id: string) => [...agentKeys.all, "knowledge-files", id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all agents
 */
export const useAgents = () => {
  return useQuery<AgentListItem[], Error>({
    queryKey: agentKeys.lists(),
    queryFn: agentService.fetchAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a single agent by ID with all relations
 */
export const useAgent = (agentId: string | undefined) => {
  return useQuery<AgentWithRelations, Error>({
    queryKey: agentKeys.detail(agentId || ""),
    queryFn: () => agentService.fetchAgentById(agentId!),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch agent metrics
 */
export const useAgentMetrics = (agentId: string | undefined) => {
  return useQuery<AgentMetrics | null, Error>({
    queryKey: agentKeys.metrics(agentId || ""),
    queryFn: () => agentService.fetchAgentMetrics(agentId!),
    enabled: !!agentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Fetch knowledge files for an agent
 */
export const useKnowledgeFiles = (agentId: string | undefined) => {
  return useQuery<KnowledgeFile[], Error>({
    queryKey: agentKeys.knowledgeFiles(agentId || ""),
    queryFn: () => agentService.fetchKnowledgeFiles(agentId!),
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new agent
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, CreateAgentDTO>({
    mutationFn: agentService.createAgent,
    onSuccess: (newAgent) => {
      // Invalidate agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success(`Agent "${newAgent.name}" created successfully!`);
    },
    onError: (error) => {
      console.error("Error creating agent:", error);
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
};

/**
 * Update an agent
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, { agentId: string; updates: UpdateAgentDTO }>({
    mutationFn: ({ agentId, updates }) => agentService.updateAgent(agentId, updates),
    onSuccess: (updatedAgent) => {
      // Invalidate both the list and the specific agent
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(updatedAgent.id) });
      toast.success(`Agent "${updatedAgent.name}" updated successfully!`);
    },
    onError: (error) => {
      console.error("Error updating agent:", error);
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });
};

/**
 * Delete an agent
 */
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: agentService.deleteAgent,
    onSuccess: (_, agentId) => {
      // Invalidate agents list and remove the specific agent from cache
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) });
      toast.success("Agent deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting agent:", error);
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });
};

/**
 * Toggle agent active status
 */
export const useToggleAgentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { agentId: string; isActive: boolean }>({
    mutationFn: ({ agentId, isActive }) => agentService.toggleAgentStatus(agentId, isActive),
    onSuccess: (_, { agentId, isActive }) => {
      // Invalidate both the list and the specific agent
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      toast.success(`Agent ${isActive ? "activated" : "deactivated"} successfully!`);
    },
    onError: (error) => {
      console.error("Error toggling agent status:", error);
      toast.error(`Failed to toggle agent status: ${error.message}`);
    },
  });
};

/**
 * Upload a knowledge file
 */
export const useUploadKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KnowledgeFile,
    Error,
    { agentId: string; file: File; fileType: "excel" | "markdown" | "text" }
  >({
    mutationFn: ({ agentId, file, fileType }) =>
      agentService.uploadKnowledgeFile(agentId, file, fileType),
    onSuccess: (_, { agentId }) => {
      // Invalidate knowledge files for this agent
      queryClient.invalidateQueries({ queryKey: agentKeys.knowledgeFiles(agentId) });
      toast.success("File uploaded successfully!");
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
};

/**
 * Delete a knowledge file
 */
export const useDeleteKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { fileId: string; agentId: string }>({
    mutationFn: ({ fileId }) => agentService.deleteKnowledgeFile(fileId),
    onSuccess: (_, { agentId }) => {
      // Invalidate knowledge files for this agent
      queryClient.invalidateQueries({ queryKey: agentKeys.knowledgeFiles(agentId) });
      toast.success("File deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting file:", error);
      toast.error(`Failed to delete file: ${error.message}`);
    },
  });
};

/**
 * Train agent with knowledge files
 * Sends files to Loop-X API for knowledge base training
 */
export const useTrainAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { agentId: string; fileIds: string[] }
  >({
    mutationFn: ({ agentId, fileIds }) => agentService.trainAgentWithFiles(agentId, fileIds),
    onMutate: async ({ agentId }) => {
      // Show a loading toast
      toast.loading("Training knowledge base...", { id: "training" });
    },
    onSuccess: (result, { agentId }) => {
      // Dismiss loading toast and show success
      toast.dismiss("training");
      toast.success(result.message);

      // Invalidate knowledge files to refresh the status
      queryClient.invalidateQueries({ queryKey: agentKeys.knowledgeFiles(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
    },
    onError: (error, { agentId }) => {
      // Dismiss loading toast and show error
      toast.dismiss("training");
      console.error("Error training agent:", error);
      toast.error(`Training failed: ${error.message}`);

      // Still invalidate to show the failed status
      queryClient.invalidateQueries({ queryKey: agentKeys.knowledgeFiles(agentId) });
    },
  });
};

/**
 * Update agent metrics
 */
export const useUpdateAgentMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AgentMetrics,
    Error,
    {
      agentId: string;
      metrics: Partial<Omit<AgentMetrics, "id" | "agent_id" | "created_at" | "updated_at">>;
    }
  >({
    mutationFn: ({ agentId, metrics }) => agentService.updateAgentMetrics(agentId, metrics),
    onSuccess: (_, { agentId }) => {
      // Invalidate metrics for this agent
      queryClient.invalidateQueries({ queryKey: agentKeys.metrics(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      toast.success("Metrics updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating metrics:", error);
      toast.error(`Failed to update metrics: ${error.message}`);
    },
  });
};

/**
 * Save agent profile (optimistic update)
 */
export const useSaveAgentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, { agentId: string; updates: UpdateAgentDTO }>({
    mutationFn: ({ agentId, updates }) => agentService.updateAgent(agentId, updates),
    // Optimistic update
    onMutate: async ({ agentId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.detail(agentId) });

      // Snapshot the previous value
      const previousAgent = queryClient.getQueryData<AgentWithRelations>(
        agentKeys.detail(agentId)
      );

    // Optimistically update to the new value
    if (previousAgent) {
      queryClient.setQueryData<AgentWithRelations>(agentKeys.detail(agentId), {
        ...previousAgent,
        ...updates,
        config_metadata: {
          ...previousAgent.config_metadata,
          ...updates.config_metadata,
        },
      } as AgentWithRelations);
    }

      // Return a context object with the snapshotted value
      return { previousAgent };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, { agentId }, context: any) => {
      if (context?.previousAgent) {
        queryClient.setQueryData(agentKeys.detail(agentId), context.previousAgent);
      }
      console.error("Error saving agent profile:", error);
      toast.error(`Failed to save changes: ${error.message}`);
    },
    // Always refetch after error or success
    onSettled: (_, __, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onSuccess: (updatedAgent) => {
      toast.success("Changes saved successfully!");
    },
  });
};

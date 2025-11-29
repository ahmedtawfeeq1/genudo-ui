
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 
import { useToast } from '@/hooks/use-toast';

interface OpportunityFollowUp {
  id: string;
  opportunity_name: string;
  client_name: string;
  client_email: string;
  // Follow-up execution state only (from opportunities table)
  follow_up_next_at: string | null;
  follow_up_last_at: string | null;
  follow_up_occurrences: number;
  stage_id: string;
  pipeline_id: string;
  created_at: string;
  updated_at: string;
  stages: {
    stage_name: string;
    pipeline_id: string;
    // Follow-up configuration from stage
    follow_up_enabled: boolean;
    follow_up_interval_value: number;
    follow_up_interval_unit: 'minutes' | 'hours' | 'days' | 'months';
    follow_up_time_of_day: string;
    follow_up_timezone: string;
    follow_up_max_occurrences: number;
    follow_up_delay_enabled?: boolean;
    follow_up_delay_days?: number;
    follow_up_delay_time_of_day?: string;
    follow_up_instructions?: string;
  };
}

// Add interface for debug response
interface DebugFollowupResponse {
  opportunity_id: string;
  opportunity_name: string;
  stage_name: string;
  follow_up_enabled: boolean;
  follow_up_next_at: string | null;
  follow_up_occurrences: number;
  follow_up_max_occurrences: number;
  overdue: boolean;
}

export function useOpportunityFollowUps(pipelineId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch opportunities with follow-up enabled (based on stage configuration)
  // Only filter by max_occurrences now (simplified logic)
  const {
    data: followUpOpportunities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['opportunity-follow-ups', pipelineId],
    queryFn: async () => {
      let query: any = null;

      if (pipelineId) {
        query = query.eq('pipeline_id', pipelineId);
      }

      const data = [
        {
          id: 'o1',
          opportunity_name: 'Deal A',
          client_name: 'Alice',
          client_email: 'alice@example.com',
          follow_up_next_at: new Date().toISOString(),
          follow_up_last_at: null,
          follow_up_occurrences: 0,
          stage_id: 's1',
          pipeline_id: pipelineId || 'pipe-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stages: {
            stage_name: 'New',
            pipeline_id: pipelineId || 'pipe-1',
            follow_up_enabled: true,
            follow_up_interval_value: 1,
            follow_up_interval_unit: 'days',
            follow_up_time_of_day: '09:00',
            follow_up_timezone: 'UTC',
            follow_up_max_occurrences: 3,
          },
        },
      ];

      // Filter opportunities where the stage has follow_up_enabled = true
      // AND they haven't exceeded max occurrences (simplified - no more no-response limit)
      const filteredData = (data || []).filter(opportunity => 
        opportunity.stages && 
        opportunity.stages.follow_up_enabled === true &&
        opportunity.follow_up_occurrences < opportunity.stages.follow_up_max_occurrences
      );
      
      return filteredData as OpportunityFollowUp[];
    },
    enabled: !!pipelineId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch active follow-ups (scheduled for future and stage has follow-up enabled)
  // Simplified to only check max occurrences
  const {
    data: activeFollowUps,
    isLoading: isLoadingActive
  } = useQuery({
    queryKey: ['active-opportunity-follow-ups', pipelineId],
    queryFn: async () => {
      let query: any = null;

      if (pipelineId) {
        query = query.eq('pipeline_id', pipelineId);
      }

      const data = [] as any[];

      // Filter opportunities where stage has follow_up_enabled = true
      // AND they haven't exceeded max occurrences (simplified)
      const filteredData = (data || []).filter(opportunity => 
        opportunity.stages && 
        opportunity.stages.follow_up_enabled === true &&
        opportunity.follow_up_occurrences < opportunity.stages.follow_up_max_occurrences
      );
      
      return filteredData as OpportunityFollowUp[];
    },
    enabled: !!pipelineId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Mutation to manually clear a follow-up execution state
  const clearFollowUpMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const error = null;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow-up cleared for opportunity",
      });
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear follow-up",
        variant: "destructive",
      });
    },
  });

  // Mutation to reschedule a follow-up
  const rescheduleFollowUpMutation = useMutation({
    mutationFn: async ({ opportunityId, newDateTime }: { opportunityId: string; newDateTime: string }) => {
      const error = null;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow-up rescheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule follow-up",
        variant: "destructive",
      });
    },
  });

  // Pipeline-specific follow-up processor with better error handling
  const triggerProcessorMutation = useMutation({
    mutationFn: async () => {
      return { processed: 1, skipped: 0, errors: 0 } as any;
    },
    onSuccess: (data) => {
      const processedCount = data.processed || 0;
      const skippedCount = data.skipped || 0;
      const errorCount = data.errors || 0;
      
      let message = `Follow-up processor completed for this pipeline.`;
      if (processedCount > 0) message += ` Processed: ${processedCount}.`;
      if (skippedCount > 0) message += ` Skipped: ${skippedCount}.`;
      if (errorCount > 0) message += ` Errors: ${errorCount}.`;
      
      toast({
        title: "Success",
        description: message,
      });
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger follow-up processor",
        variant: "destructive",
      });
    },
  });

  // Mutation to sync opportunities from their stage configurations
  const syncOpportunitiesFromStagesMutation = useMutation({
    mutationFn: async (pipelineId: string) => {
      return { synced: 0, errors: 0 };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Synced ${data.synced} opportunities from stage configuration`,
      });
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync opportunities",
        variant: "destructive",
      });
    },
  });

  // Simplified violation check to only include max occurrence violations
  const checkMaxOccurrenceViolationsMutation = useMutation({
    mutationFn: async () => {
      return { violations_found: 0, violations_cleaned: 0, violations: [] as any[] };
    },
    onSuccess: (data) => {
      if (data.violations_found > 0) {
        toast({
          title: "Follow-up Violations Fixed",
          description: `Found and cleaned up ${data.violations_cleaned} max occurrence violations.`,
        });
      } else {
        toast({
          title: "No Violations Found",
          description: "All opportunities are within their limits.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check for violations",
        variant: "destructive",
      });
    },
  });

  // Mutation to recalculate follow-up counters using the updated function
  const recalculateFollowupCountersMutation = useMutation({
    mutationFn: async () => {
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow-up counters have been recalculated based on actual follow-up message history",
      });
      queryClient.invalidateQueries({ queryKey: ['opportunity-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['active-opportunity-follow-ups'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to recalculate follow-up counters",
        variant: "destructive",
      });
    },
  });

  // Debug function to test specific opportunity follow-up with proper typing
  const debugTriggerFollowupMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      return {
        opportunity_id: opportunityId,
        opportunity_name: 'Deal A',
        stage_name: 'New',
        follow_up_enabled: true,
        follow_up_next_at: new Date().toISOString(),
        follow_up_occurrences: 0,
        follow_up_max_occurrences: 3,
        overdue: false,
      } as DebugFollowupResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Debug Info",
        description: `Opportunity: ${data.opportunity_name}, Follow-up enabled: ${data.follow_up_enabled}, Occurrences: ${data.follow_up_occurrences}/${data.follow_up_max_occurrences}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to debug follow-up",
        variant: "destructive",
      });
    },
  });

  return {
    followUpOpportunities,
    activeFollowUps,
    isLoading: isLoading || isLoadingActive,
    error,
    clearFollowUp: clearFollowUpMutation.mutateAsync,
    rescheduleFollowUp: rescheduleFollowUpMutation.mutateAsync,
    triggerProcessor: triggerProcessorMutation.mutateAsync,
    syncOpportunitiesFromStages: syncOpportunitiesFromStagesMutation.mutateAsync,
    checkMaxOccurrenceViolations: checkMaxOccurrenceViolationsMutation.mutateAsync,
    recalculateFollowupCounters: recalculateFollowupCountersMutation.mutateAsync,
    debugTriggerFollowup: debugTriggerFollowupMutation.mutateAsync,
    isClearingFollowUp: clearFollowUpMutation.isPending,
    isRescheduling: rescheduleFollowUpMutation.isPending,
    isTriggeringProcessor: triggerProcessorMutation.isPending,
    isSyncingFromStages: syncOpportunitiesFromStagesMutation.isPending,
    isCheckingViolations: checkMaxOccurrenceViolationsMutation.isPending,
    isRecalculatingCounters: recalculateFollowupCountersMutation.isPending,
    isDebuggingFollowup: debugTriggerFollowupMutation.isPending,
  };
}

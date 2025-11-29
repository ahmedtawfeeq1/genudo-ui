import { useState, useCallback, useEffect } from 'react';
 
import { useToast } from '@/hooks/use-toast';
import { type Opportunity, type Stage } from '@/components/kanban/types';

export function useKanbanData(
  pipelineId: string,
  startDate?: Date,
  endDate?: Date,
  aiStatus?: "all" | "paused" | "active",
  opportunityStatuses?: string[],
  priorities?: string[]
) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const user: any = { id: 'demo' };
  const { toast } = useToast();

  const fetchKanbanData = useCallback(async () => {
    if (!user?.id || !pipelineId) {
      console.log('Missing user or pipelineId, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching kanban data for pipeline:', pipelineId);

      // Fetch stages ordered by position index
      const stagesData = [
        { id: 's1', stage_name: 'New', stage_position_index: 0, follow_up_interval_unit: 'days' },
        { id: 's2', stage_name: 'Qualified', stage_position_index: 1, follow_up_interval_unit: 'days' },
        { id: 's3', stage_name: 'Won', stage_position_index: 2, follow_up_interval_unit: 'days' },
        { id: 's4', stage_name: 'Lost', stage_position_index: 3, follow_up_interval_unit: 'days' },
      ] as any[];

      // Helper to fetch all opportunities (static)
      const fetchAllOpportunities = async () => {
        const data = [
          { id: 'o-1', opportunity_name: 'First Deal', stage_id: 's1', created_at: new Date().toISOString(), conversations: { ai_paused: false, priority: 'normal' }, contacts: { id: 'c1', name: 'Alice', email: 'alice@example.com', phone_number: '+1555-0101' }, pipeline_id: pipelineId, user_id: user.id, tags: 'vip,new', status: 'active', client_name: 'Alice Doe', client_email: 'alice@example.com', client_phone_number: '+1555-0101' },
          { id: 'o-2', opportunity_name: 'Second Deal', stage_id: 's2', created_at: new Date().toISOString(), conversations: { ai_paused: true, priority: 'high' }, contacts: { id: 'c2', name: 'Bob', email: 'bob@example.com', phone_number: '+1555-0102' }, pipeline_id: pipelineId, user_id: user.id, tags: 'trial,priority', status: 'pending', client_name: 'Bob Roe', client_email: 'bob@example.com', client_phone_number: '+1555-0102' },
          { id: 'o-3', opportunity_name: 'Closed Won', stage_id: 's3', created_at: new Date().toISOString(), conversations: { ai_paused: false, priority: 'normal' }, contacts: { id: 'c3', name: 'Carol', email: 'carol@example.com', phone_number: '+1555-0103' }, pipeline_id: pipelineId, user_id: user.id, tags: 'vip', status: 'won', client_name: 'Carol Poe', client_email: 'carol@example.com', client_phone_number: '+1555-0103' },
        ];
        return data as any[];
      };

      // Fetch all opportunities
      const opportunitiesData = await fetchAllOpportunities();

      console.log('Fetched stages:', stagesData?.length || 0);
      console.log('Fetched opportunities:', opportunitiesData?.length || 0);

      // Type-cast the stages data to ensure follow_up_interval_unit is properly typed
      const typedStagesData: Stage[] = (stagesData || []).map(stage => ({
        ...stage,
        follow_up_interval_unit: stage.follow_up_interval_unit as "minutes" | "hours" | "days" | "months" | undefined
      }));

      setStages(typedStagesData);
      setOpportunities(opportunitiesData || []);
    } catch (error: any) {
      console.error('Error fetching kanban data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pipeline data. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pipelineId, user?.id, toast, startDate, endDate, aiStatus, opportunityStatuses, priorities]);

  // Track visibility for real-time subscription management only
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fetch data when dependencies change (filters, pipeline, etc)
  useEffect(() => {
    if (user?.id && pipelineId) {
      fetchKanbanData();
    }
  }, [fetchKanbanData, user?.id, pipelineId]);

  // Real-time subscription for opportunities changes
  useEffect(() => {}, [user?.id, pipelineId, isVisible, fetchKanbanData]);

  return {
    stages,
    opportunities,
    loading,
    setStages,
    setOpportunities,
    fetchKanbanData, // Use optimized version
    isVisible
  };
}

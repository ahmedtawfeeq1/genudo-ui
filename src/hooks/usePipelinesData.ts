
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface Pipeline {
  id: string;
  pipeline_name: string;
  pipeline_description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function usePipelines() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pipelines', user?.id],
    queryFn: async () => {
      await new Promise(res => setTimeout(res, 150));
      return [
        { id: 'pipe-1', pipeline_name: 'Sales Pipeline', pipeline_description: 'Primary outbound funnel', user_id: user?.id || 'demo-user', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'pipe-2', pipeline_name: 'Inbound Leads', pipeline_description: 'Messenger intake', user_id: user?.id || 'demo-user', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's an authentication error
      if (error.message.includes('not authenticated')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
}

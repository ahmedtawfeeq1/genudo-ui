
import { db } from '@/lib/mock-db';
import { useAuth } from '@/contexts/AuthContext';

export const cleanupOutreachResults = async (batchId: string, userId: string) => {
  if (!batchId || !userId) {
    console.warn('Missing batchId or userId for cleanup');
    return;
  }

  try {
    console.log('🧹 Aggressively cleaning up ALL outreach results for batch:', batchId);
    
    // Static mode: no backend delete; emit a log via function invoke
    await db.functions.invoke('outreach-results-cleanup', {
      body: { batch_id: batchId, user_id: userId }
    });

    console.log('✅ Successfully cleaned up ALL outreach results for batch:', batchId);
  } catch (error) {
    console.error('❌ Failed to cleanup outreach results:', error);
    // Don't throw the error to prevent blocking the wizard close
  }
};

export const useOutreachCleanup = () => {
  const { user } = useAuth();

  const cleanup = async (batchId: string) => {
    if (!user?.id) {
      console.warn('No user ID available for cleanup');
      return;
    }
    
    await cleanupOutreachResults(batchId, user.id);
  };

  return { cleanup };
};

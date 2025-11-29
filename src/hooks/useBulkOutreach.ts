import { useState } from 'react';
import { db } from "@/lib/mock-db";
import { useToast } from '@/hooks/use-toast';

interface BulkOutreachOptions {
  opportunity_ids: string[];
  pipeline_id: string;
  delay_ms?: number;
}

interface BulkOutreachResult {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  batch_id?: string;
  results?: any[];
  error?: string;
}

export const useBulkOutreach = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendBulkOutreach = async (options: BulkOutreachOptions): Promise<BulkOutreachResult> => {
    try {
      setLoading(true);
      
      console.log('Starting bulk outreach for:', options);

      const { data, error } = await db.functions.invoke('bulk-outreach-processor', {
        body: {
          opportunity_ids: options.opportunity_ids,
          pipeline_id: options.pipeline_id,
          delay_ms: options.delay_ms || 10000 // Default 10 seconds (6 per minute)
        }
      });

      if (error) {
        console.error('Bulk outreach error:', error);
        toast({
          title: "Outreach Failed",
          description: error.message || "Failed to process bulk outreach",
          variant: "destructive",
        });
        return { success: false, processed: 0, successful: 0, failed: 0, error: error.message };
      }

      if (data.success) {
        toast({
          title: "Bulk Outreach Completed",
          description: `Processed ${data.processed} opportunities: ${data.successful} successful, ${data.failed} failed`,
        });
        
        return {
          success: true,
          processed: data.processed,
          successful: data.successful,
          failed: data.failed,
          batch_id: data.batch_id,
          results: data.results
        };
      } else {
        toast({
          title: "Outreach Failed",
          description: data.message || "Unknown error occurred",
          variant: "destructive",
        });
        return { success: false, processed: 0, successful: 0, failed: 0, error: data.message };
      }
    } catch (error: any) {
      console.error('Unexpected error in bulk outreach:', error);
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, processed: 0, successful: 0, failed: 0, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendBulkOutreach,
    loading
  };
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Clock, CheckCircle, Info } from 'lucide-react';
import { useBulkOutreach } from '@/hooks/useBulkOutreach';

interface BulkOutreachSectionProps {
  importResults: {
    successful: number;
    failed: number;
    skipped: number;
    webhookTriggered: number;
    webhookFailed: number;
    opportunityIds: string[];
  };
  pipelineId: string;
  onComplete?: (batchId: string) => void;
}

const BulkOutreachSection: React.FC<BulkOutreachSectionProps> = ({
  importResults,
  pipelineId,
  onComplete
}) => {
  const { sendBulkOutreach, loading } = useBulkOutreach();

  const handleBulkOutreach = async () => {
    if (!importResults.opportunityIds.length) {
      return;
    }

    const result = await sendBulkOutreach({
      opportunity_ids: importResults.opportunityIds,
      pipeline_id: pipelineId,
      delay_ms: 10000 // 10 seconds between each (6 per minute)
    });

    if (result.success && result.batch_id && onComplete) {
      onComplete(result.batch_id);
    }
  };

  if (!importResults.opportunityIds.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Send className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Bulk Outreach</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
              <div className="text-sm text-green-700">Ready for Outreach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6/min</div>
              <div className="text-sm text-blue-700">Rate Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">10s</div>
              <div className="text-sm text-purple-700">Delay Between</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.ceil(importResults.successful * 10 / 60)}m
              </div>
              <div className="text-sm text-orange-700">Est. Duration</div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Start controlled bulk outreach with a 10-second delay between messages to comply with rate limits. 
              Real-time results will be displayed with webhook responses and success/failure tracking.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button
              onClick={handleBulkOutreach}
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Starting Outreach...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start Bulk Outreach ({importResults.successful} opportunities)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOutreachSection;

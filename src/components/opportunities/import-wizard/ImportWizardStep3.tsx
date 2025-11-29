
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info } from 'lucide-react';
import BulkOutreachSection from '../BulkOutreachSection';
import OutreachResultsDisplay from '../OutreachResultsDisplay';

interface ImportResults {
  successful: number;
  failed: number;
  skipped: number;
  total: number;
  webhookTriggered: number;
  webhookFailed: number;
  opportunityIds: string[];
}

interface ImportWizardStep3Props {
  isProcessing: boolean;
  importResults: ImportResults;
  pipelineId: string;
  showOutreachResults: boolean;
  outreachBatchId: string;
  onOutreachComplete: (batchId: string) => void;
  onCloseOutreachResults: () => void;
}

const ImportWizardStep3: React.FC<ImportWizardStep3Props> = ({
  isProcessing,
  importResults,
  pipelineId,
  showOutreachResults,
  outreachBatchId,
  onOutreachComplete,
  onCloseOutreachResults
}) => {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Importing Opportunities...</h3>
        <p className="text-gray-600">Please wait while we create your opportunities and trigger webhooks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
        <p className="text-gray-600 mb-6">Here's what happened:</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{importResults.successful}</div>
          <div className="text-sm text-green-600">Successful</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{importResults.failed}</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{importResults.skipped}</div>
          <div className="text-sm text-yellow-600">Skipped</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{importResults.total}</div>
          <div className="text-sm text-blue-600">Total</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{importResults.webhookTriggered}</div>
          <div className="text-sm text-purple-600">Webhooks Sent</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{importResults.webhookFailed}</div>
          <div className="text-sm text-orange-600">Webhook Failed</div>
        </div>
      </div>

      {importResults.webhookTriggered > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            🚀 {importResults.webhookTriggered} automated outreach messages have been triggered and sent to your external system.
          </AlertDescription>
        </Alert>
      )}

      <BulkOutreachSection 
        importResults={importResults}
        pipelineId={pipelineId}
        onComplete={onOutreachComplete}
      />

      {showOutreachResults && outreachBatchId && (
        <OutreachResultsDisplay
          batchId={outreachBatchId}
          pipelineId={pipelineId}
          onClose={onCloseOutreachResults}
        />
      )}
    </div>
  );
};

export default ImportWizardStep3;

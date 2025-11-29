import React from 'react';
import { CheckCircle } from 'lucide-react';
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

interface ImportWizardStep4ResultsProps {
  importResults: ImportResults;
  pipelineId: string;
  showOutreachResults: boolean;
  outreachBatchId: string;
  onOutreachComplete: (batchId: string) => void;
  onCloseOutreachResults: () => void;
}

const ImportWizardStep4Results: React.FC<ImportWizardStep4ResultsProps> = ({
  importResults,
  pipelineId,
  showOutreachResults,
  outreachBatchId,
  onOutreachComplete,
  onCloseOutreachResults
}) => {
  console.log('📊 Step 4 - Success + Results:', {
    outreachBatchId,
    hasResults: !!outreachBatchId
  });

  if (outreachBatchId) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        {/* Success Header - Fixed */}
        <div className="flex flex-col items-center text-center flex-shrink-0">
          <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Outreach Complete!</h3>
          <p className="text-gray-600 text-sm">All messages have been sent successfully.</p>
        </div>

        {/* Outreach Results - Scrollable within fixed container */}
        <div className="flex-1 min-h-0">
          <OutreachResultsDisplay
            batchId={outreachBatchId}
            pipelineId={pipelineId}
            onClose={onCloseOutreachResults}
          />
        </div>
      </div>
    );
  }

  // Simple loading state while waiting for outreach batch ID
  return (
    <div className="text-center py-12">
      <div className="max-w-sm mx-auto">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Results</h3>
        <p className="text-gray-600">
          Preparing outreach results for {importResults.successful} opportunities...
        </p>
      </div>
    </div>
  );
};

export default ImportWizardStep4Results;
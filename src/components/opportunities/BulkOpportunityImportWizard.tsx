
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ImportWizardStep1 from './import-wizard/ImportWizardStep1';
import ImportWizardStep2 from './import-wizard/ImportWizardStep2';
import ImportWizardStep3Simple from './import-wizard/ImportWizardStep3Simple';
import ImportWizardStep4Results from './import-wizard/ImportWizardStep4Results';
import ImportWizardHeader from './import-wizard/ImportWizardHeader';
import ImportWizardNavigation from './import-wizard/ImportWizardNavigation';
import { useImportWizard } from './import-wizard/useImportWizard';
import { useOutreachCleanup } from '@/utils/outreachCleanup';
import { Stage } from './import-wizard/types';

interface BulkOpportunityImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  pipelineId: string;
  stages?: Stage[];
}

const BulkOpportunityImportWizard: React.FC<BulkOpportunityImportWizardProps> = ({
  open,
  onOpenChange,
  onSuccess,
  pipelineId,
  stages = []
}) => {
  const {
    currentStep,
    setCurrentStep,
    uploadedData,
    selectedStage,
    setSelectedStage,
    fileError,
    outreachBatchId,
    pipelineData,
    processingStarted,
    hasImportedOpportunities,
    fileInputRef,
    importResults,
    resetWizard,
    handleFileUpload,
    handleStartProcessing,
    validOpportunities
  } = useImportWizard(pipelineId, stages, onSuccess);

  const { cleanup } = useOutreachCleanup();

  useEffect(() => {
    if (!open) {
      resetWizard();
    }
  }, [open, resetWizard]);

  const handleCloseWithRefresh = async (shouldRefresh = false) => {
    console.log('🔄 Closing wizard:', { shouldRefresh, hasImportedOpportunities, outreachBatchId });
    
    // Clean up outreach results if we have a batch ID
    if (outreachBatchId) {
      console.log('🧹 Triggering cleanup for outreach batch:', outreachBatchId);
      await cleanup(outreachBatchId);
    }
    
    onOpenChange(false);
    
    // Instead of forcing page reload, trigger data refresh via callback
    if (shouldRefresh || hasImportedOpportunities || currentStep >= 3) {
      console.log('🔄 Triggering data refresh through callback instead of page reload');
      onSuccess(); // This will refresh the kanban data
    }
  };

  const handleDialogOpenChange = async (open: boolean) => {
    if (!open) {
      await handleCloseWithRefresh();
    } else {
      onOpenChange(open);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 4) {
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handleStartProcessing();
    }
  };

  const handleClose = async () => {
    if (currentStep === 1) {
      await handleCloseWithRefresh(false);
    } else {
      await handleCloseWithRefresh(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden">
        <ImportWizardHeader currentStep={currentStep} />

        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          {currentStep === 1 && (
            <ImportWizardStep1
              fileError={fileError}
              pipelineData={pipelineData}
              stages={stages}
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
            />
          )}
          {currentStep === 2 && (
            <ImportWizardStep2
              uploadedData={uploadedData}
              stages={stages}
              selectedStage={selectedStage}
              onStageChange={setSelectedStage}
            />
          )}
          {currentStep === 3 && (
            <ImportWizardStep3Simple
              opportunityCount={validOpportunities.length}
            />
          )}
          {currentStep === 4 && (
            <ImportWizardStep4Results
              importResults={importResults}
              pipelineId={pipelineId}
              showOutreachResults={!!outreachBatchId}
              outreachBatchId={outreachBatchId}
              onOutreachComplete={() => {}}
              onCloseOutreachResults={() => {}}
            />
          )}
        </div>

        <ImportWizardNavigation
          currentStep={currentStep}
          validOpportunitiesCount={validOpportunities.length}
          selectedStage={selectedStage}
          processingStarted={processingStarted}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BulkOpportunityImportWizard;

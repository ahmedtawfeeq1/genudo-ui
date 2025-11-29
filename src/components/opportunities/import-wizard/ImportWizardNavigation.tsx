
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ImportWizardNavigationProps {
  currentStep: number;
  validOpportunitiesCount: number;
  selectedStage: string;
  processingStarted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

const ImportWizardNavigation: React.FC<ImportWizardNavigationProps> = ({
  currentStep,
  validOpportunitiesCount,
  selectedStage,
  processingStarted,
  onPrevious,
  onNext,
  onClose
}) => {
  const getLeftButton = () => {
    if (currentStep === 1) {
      return (
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      );
    }

    if (currentStep === 4) {
      return (
        <Button variant="outline" onClick={() => onPrevious()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
      );
    }

    if (currentStep === 3) {
      return (
        <Button variant="outline" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
      );
    }

    return (
      <Button variant="outline" onClick={onPrevious}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
    );
  };

  const getRightButton = () => {
    if (currentStep === 2) {
      return (
        <Button 
          onClick={onNext}
          disabled={validOpportunitiesCount === 0 || !selectedStage || processingStarted}
        >
          {processingStarted ? 'Processing...' : `Import ${validOpportunitiesCount} Opportunities`}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      );
    }

    if (currentStep === 4) {
      return (
        <Button onClick={onClose}>
          Close
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 flex justify-between">
      {getLeftButton()}
      {getRightButton()}
    </div>
  );
};

export default ImportWizardNavigation;

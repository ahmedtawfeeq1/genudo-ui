
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ImportWizardHeaderProps {
  currentStep: number;
}

const ImportWizardHeader: React.FC<ImportWizardHeaderProps> = ({ currentStep }) => {
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Upload File';
      case 2: return 'Review Data';
      case 3: return 'Processing';
      case 4: return 'Results';
      default: return 'Import';
    }
  };

  const getHeaderProgress = () => {
    return (currentStep / 4) * 100;
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Import Opportunities</h2>
          <p className="text-sm text-gray-600">{getStepTitle()} - Step {currentStep} of 4</p>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={getHeaderProgress()} className="w-32" />
          <div className="text-sm text-gray-500">{Math.round(getHeaderProgress())}%</div>
        </div>
      </div>
    </div>
  );
};

export default ImportWizardHeader;

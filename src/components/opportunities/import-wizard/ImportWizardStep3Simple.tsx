
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImportWizardStep3SimpleProps {
  opportunityCount: number;
}

const ImportWizardStep3Simple: React.FC<ImportWizardStep3SimpleProps> = ({
  opportunityCount
}) => {
  return (
    <div className="space-y-6 text-center py-12">
      <div className="max-w-sm mx-auto">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Processing Your Opportunities
        </h3>
        
        <div className="space-y-3 text-gray-600">
          <p>
            📥 Importing {opportunityCount} opportunities...
          </p>
          <p>
            📤 Sending outreach messages...
          </p>
          <p>
            ⏱️ This may take a few moments
          </p>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 Messages are sent with 5-second delays between each contact to ensure delivery
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportWizardStep3Simple;

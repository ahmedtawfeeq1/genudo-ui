import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send } from 'lucide-react';

interface OutreachProgress {
  current: number;
  total: number;
  currentClient: string;
  currentPhone: string;
  status: 'sending' | 'completed' | 'error';
}

interface ImportWizardStep3RealTimeProps {
  outreachProgress: OutreachProgress;
}

const ImportWizardStep3RealTime: React.FC<ImportWizardStep3RealTimeProps> = ({
  outreachProgress
}) => {
  const progressPercentage = outreachProgress.total > 0 
    ? (outreachProgress.current / outreachProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sending Outreach Messages</h3>
        <p className="text-gray-600 mb-6">
          Sending messages with 5-second delays between each contact...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{outreachProgress.current} of {outreachProgress.total} ({Math.round(progressPercentage)}%)</span>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>

      {/* Current Processing Item */}
      {outreachProgress.currentClient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    Sending to {outreachProgress.currentClient}
                  </p>
                  <p className="text-sm text-blue-700">
                    📱 {outreachProgress.currentPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-800">
                    {outreachProgress.current} of {outreachProgress.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiting indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-blue-600">
          <Send className="h-4 w-4" />
          <span className="text-sm">Waiting for outreach responses...</span>
        </div>
      </div>

      {/* Time estimate */}
      {outreachProgress.total > outreachProgress.current && (
        <div className="text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-sm mx-auto">
            <p className="text-gray-600 text-sm">
              ⏱️ Estimated time: {Math.ceil((outreachProgress.total - outreachProgress.current) * 5 / 60)} min remaining
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportWizardStep3RealTime;
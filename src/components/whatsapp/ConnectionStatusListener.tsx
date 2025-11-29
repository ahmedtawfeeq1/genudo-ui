import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';

interface ResultMetadata {
  status: 'success' | 'duplicate' | 'error';
  phoneNumber: string;
  message: string;
  existingAccount?: string;
  existingAccountId?: string;
  webhookProcessedAt?: string;
}

interface ConnectionStatusListenerProps {
  accountId: string;
  connectionName: string;
  onSuccess: (accountId: string) => void;
  onRetry: () => void;
  onClose: () => void;
}

const ConnectionStatusListener: React.FC<ConnectionStatusListenerProps> = ({
  accountId,
  connectionName,
  onSuccess,
  onRetry,
  onClose,
}) => {
  const [result, setResult] = useState<ResultMetadata | null>(null);
  const [isListening, setIsListening] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!accountId) return;

    let pollInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const checkConnectionResult = async () => {
      const mock: ResultMetadata = { status: 'success', phoneNumber: '15550101', message: 'Connected successfully' };
      setResult(mock);
      setIsListening(false);
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      onSuccess(accountId);
      setTimeout(onClose, 1500);
    };

    // Listen for cancellation messages from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WHATSAPP_CONNECTION_CANCELLED') {
        console.log('🚫 Connection cancelled by user');
        // Clean up and reset
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        setIsListening(false);
        // Call onRetry to reset the flow back to setup
        onRetry();
      }
    };

    window.addEventListener('message', handleMessage);

    // Start polling
    pollInterval = setInterval(checkConnectionResult, 2000);

    // Set timeout after 3 minutes
    timeoutTimer = setTimeout(() => {
      setTimeoutReached(true);
      setIsListening(false);
      if (pollInterval) clearInterval(pollInterval);
    }, 180000); // 3 minutes

    // Initial check
    checkConnectionResult();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      window.removeEventListener('message', handleMessage);
    };
  }, [accountId, onSuccess, onClose, onRetry]);

  const handleUseDuplicate = async () => {
    if (!result || result.status !== 'duplicate') return;

    toast({ title: "Duplicate Removed", description: "Please set a new connection name to proceed." });
    onRetry();
  };

  const renderContent = () => {
    if (timeoutReached) {
      return (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Connection Timeout</h3>
          <p className="text-gray-600 mb-4">
            The connection process took too long. Please try again.
          </p>
          <div className="space-y-2">
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (isListening) {
      return (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Processing Connection</h3>
          <p className="text-gray-600 mb-4">
            Waiting for WhatsApp authentication to complete...
          </p>
          <p className="text-sm text-gray-500">
            Connection Name: <strong>{connectionName}</strong>
          </p>
        </div>
      );
    }

    if (result) {
      switch (result.status) {
        case 'success':
          return (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Account Successfully Connected!</h3>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Phone:</strong> +{result.phoneNumber}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Connection:</strong> {connectionName}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                This dialog will close automatically...
              </p>
            </div>
          );

        case 'duplicate':
          return (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Duplicate Account Detected</h3>
              <p className="text-gray-600 mb-4">
                The WhatsApp number (+{result.phoneNumber}) is already connected to your account.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Existing Connection:</strong> {result.existingAccount}
                </p>
                <p className="text-sm text-orange-800">
                  <strong>Phone:</strong> +{result.phoneNumber}
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleUseDuplicate} className="w-full">
                  Use Different Connection Name
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          );

        case 'error':
          return (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connection Failed</h3>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <div className="space-y-2">
                <Button onClick={onRetry} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    return null;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusListener;

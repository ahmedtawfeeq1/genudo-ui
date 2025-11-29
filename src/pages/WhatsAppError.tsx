
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const WhatsAppError = () => {
  const [searchParams] = useSearchParams();
  const connectionId = searchParams.get('connectionId');

  const closeWindow = () => {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  const contactSupport = () => {
    // You can customize this to open your support system
    window.open('mailto:support@genudo.ai?subject=WhatsApp Connection Failed', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't connect your WhatsApp Business account. Please try again or contact support if the issue persists.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={closeWindow}
              className="w-full"
            >
              Close This Window
            </Button>
            <Button 
              variant="outline"
              onClick={contactSupport}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
          {connectionId && (
            <p className="text-xs text-gray-400 mt-4">
              Connection ID: {connectionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppError;

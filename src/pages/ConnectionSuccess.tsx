
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const ConnectionSuccess = () => {
  useEffect(() => {
    // Notify parent window if opened as popup
    if (window.opener) {
      window.opener.postMessage({ 
        type: 'WHATSAPP_CONNECTION_COMPLETED',
        status: 'success'
      }, '*');
    }

    // Auto-close window after 3 seconds if opened as popup
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeWindow = () => {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ✅ Connection Successful
          </h1>
          <p className="text-gray-600 mb-6">
            Your WhatsApp Business account has been successfully connected. You may now close this window.
          </p>
          <Button 
            onClick={closeWindow}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Close Window
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            This window will close automatically in a few seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionSuccess;

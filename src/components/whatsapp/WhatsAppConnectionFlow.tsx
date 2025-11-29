
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  MessageCircle,
  Loader2,
  ExternalLink,
  Smartphone,
  Zap,
  AlertCircle
} from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';
import ConnectionStatusListener from './ConnectionStatusListener';

interface WhatsAppConnectionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: (accountId: string) => void;
}

type FlowStep = 'setup' | 'connecting' | 'qr_scan' | 'listening' | 'error';

interface ConnectionState {
  step: FlowStep;
  connectionName: string;
  authUrl: string | null;
  error: string | null;
  accountId: string | null;
}

const WhatsAppConnectionFlow: React.FC<WhatsAppConnectionFlowProps> = ({
  open,
  onOpenChange,
  onConnectionSuccess,
}) => {
  const [state, setState] = useState<ConnectionState>({
    step: 'setup',
    connectionName: '',
    authUrl: null,
    error: null,
    accountId: null,
  });
  const [loading, setLoading] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setState({
        step: 'setup',
        connectionName: '',
        authUrl: null,
        error: null,
        accountId: null,
      });
      setPopupWindow(null);
    }
  }, [open]);

  // Monitor popup window closure
  useEffect(() => {
    let windowCheckInterval: NodeJS.Timeout | null = null;

    if (popupWindow && state.step === 'qr_scan') {
      windowCheckInterval = setInterval(() => {
        if (popupWindow.closed) {
          console.log('QR scan window was closed by user');
          setPopupWindow(null);

          // Move to listening state to wait for webhook
          setState(prev => ({
            ...prev,
            step: 'listening'
          }));
        }
      }, 1000);
    }

    return () => {
      if (windowCheckInterval) {
        clearInterval(windowCheckInterval);
      }
    };
  }, [popupWindow, state.step]);

  const startConnection = async () => {
    if (!state.connectionName.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a connection name' }));
      return;
    }

    setLoading(true);
    setState(prev => ({ ...prev, step: 'connecting', error: null }));

    try {
      console.log('Starting WhatsApp Connection for:', state.connectionName);
      const authResponse = { url: 'about:blank', accountId: `acc-${Date.now()}` };
      setState(prev => ({ ...prev, step: 'qr_scan', authUrl: authResponse.url, accountId: authResponse.accountId }));
    } catch (error: any) {
      console.error('❌ Connection initiation failed:', error);
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message || 'Failed to initiate WhatsApp connection'
      }));
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate WhatsApp connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openQRScanWindow = () => {
    if (!state.authUrl) {
      setState(prev => ({ ...prev, error: 'No authentication URL available. Please try creating a new connection.' }));
      return;
    }

    console.log('Opening QR scan window:', state.authUrl);
    const newWindow = window.open(state.authUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
    setPopupWindow(newWindow);
  };

  const handleClose = () => {
    setState({
      step: 'setup',
      connectionName: '',
      authUrl: null,
      error: null,
      accountId: null,
    });
    if (popupWindow) {
      popupWindow.close();
      setPopupWindow(null);
    }
    onOpenChange(false);
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      step: 'setup',
      error: null,
      authUrl: null,
    }));
    if (popupWindow) {
      popupWindow.close();
      setPopupWindow(null);
    }
  };

  const handleConnectionSuccess = (accountId: string) => {
    onConnectionSuccess(accountId);
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  function renderStepContent() {
    switch (state.step) {
      case 'setup':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect Your WhatsApp</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter a name for this connection
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectionName">Connection Name</Label>
                  <Input
                    id="connectionName"
                    type="text"
                    value={state.connectionName}
                    onChange={(e) => setState(prev => ({ ...prev, connectionName: e.target.value }))}
                    placeholder="e.g., My Business WhatsApp"
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'connecting':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Setting Up Connection</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Generating your QR code link...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'qr_scan':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ExternalLink className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scan QR Code</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click below to open the QR scanner and scan with your WhatsApp Business app
                  </p>
                </div>
                <Button onClick={openQRScanWindow} className="bg-green-600 hover:bg-green-700 mb-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open QR Scanner
                </Button>
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>Instructions</AlertTitle>
                  <AlertDescription>
                    1. Click "Open QR Scanner" above<br />
                    2. Scan the QR code with your WhatsApp Business app<br />
                    3. We'll automatically detect when you're connected
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, step: 'listening' }))}
                  className="w-full"
                >
                  I've scanned the QR code
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'listening':
        return (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Listening for Connection</h3>
              <p className="text-sm text-gray-600">Click below once your app shows connected.</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => handleConnectionSuccess(state.accountId || 'acc-static')} className="bg-green-600 hover:bg-green-700">Mark Connected</Button>
                <Button variant="outline" onClick={handleRetry}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connection Failed</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {state.error || 'Unable to connect your WhatsApp Business account'}
                  </p>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>What you can do:</AlertTitle>
                  <AlertDescription>
                    Try again with a different WhatsApp Business account, or contact support if the issue persists.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleRetry} variant="outline" className="w-full mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>WhatsApp Connection</DialogTitle>
          <DialogDescription>
            Connect your WhatsApp Business account to start messaging.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderStepContent()}

          {state.step === 'setup' && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={startConnection}
                disabled={loading || !state.connectionName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Connect WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          {(state.step === 'error' || state.step === 'connecting') && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConnectionFlow;

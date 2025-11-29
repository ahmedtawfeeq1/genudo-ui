
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
import { 
  MessageCircle, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  ArrowRight,
  Smartphone,
  Zap
} from 'lucide-react';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: (accountId: string) => void;
}

type WizardStep = 'intro' | 'connecting' | 'authenticating' | 'success';

const WhatsAppConnectionWizard: React.FC<WhatsAppConnectionWizardProps> = ({
  open,
  onOpenChange,
  onConnectionSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [connectionName, setConnectionName] = useState('');
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCurrentStep('intro');
      setError(null);
      setConnectionName('');
      setAuthUrl(null);
    }
  }, [open]);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    if (polling && connectionName) {
      pollInterval = setInterval(checkConnectionStatus, 3000);
    }
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [polling, connectionName]);

  const startConnection = async () => {
    if (!connectionName.trim()) {
      toast({
        title: "Connection Name Required",
        description: "Please enter a name for this WhatsApp connection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep('connecting');
    
    try {
      console.log('=== Starting WhatsApp Connection ===');
      console.log('User ID:', user?.id);
      console.log('Connection Name:', connectionName);

      const { data: authResponse, error: authError } = await db.functions.invoke('unipile-auth', {
        body: {
          userId: user?.id,
          connectionName: connectionName.trim(),
          provider: 'WHATSAPP'
        }
      });

      if (authError) {
        console.error('Edge function call failed:', authError);
        throw new Error(`Function call failed: ${authError.message}`);
      }

      if (!authResponse || authResponse.error) {
        console.error('Function returned error:', authResponse?.error);
        throw new Error(`Authentication failed: ${authResponse?.error || 'Unknown error'}`);
      }

      if (!authResponse.url) {
        console.error('No URL in function response:', authResponse);
        throw new Error('No authentication URL received from service');
      }

      console.log('✅ Received authentication URL:', authResponse.url);
      setAuthUrl(authResponse.url);
      setCurrentStep('authenticating');
      setPolling(true);

    } catch (error: any) {
      console.error('❌ Connection initiation failed:', error);
      setError(error.message || "Failed to initiate WhatsApp connection");
      setCurrentStep('intro');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!connectionName.trim()) return;
    try {
      const { data: checkData } = await db.functions.invoke('unipile-check-connection', {
        body: { connectionName: connectionName.trim() }
      });
      if (checkData?.status === 'active') {
        setPolling(false);
        setCurrentStep('success');
        setTimeout(() => {
          onConnectionSuccess(checkData.account?.id || 'acc-static');
          onOpenChange(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error checking connection status:', error);
      setPolling(false);
    }
  };

  const openAuthUrl = () => {
    if (!authUrl) {
      setError('No authentication URL available. Please try creating a new connection.');
      return;
    }
    
    console.log('Opening authentication URL:', authUrl);
    window.open(authUrl, '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
  };

  const handleClose = () => {
    setPolling(false);
    setAuthUrl(null);
    setError(null);
    setCurrentStep('intro');
    setConnectionName('');
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Connect WhatsApp Business</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect your WhatsApp Business account to start creating automated sales pipelines 
                and engaging with customers directly through WhatsApp.
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="e.g., My Business WhatsApp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">WhatsApp Business</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Genudo Platform</p>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button 
              onClick={startConnection} 
              disabled={loading || !connectionName.trim()}
              className="bg-green-600 hover:bg-green-700 px-8"
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
        );

      case 'connecting':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Setting up connection...</h3>
              <p className="text-gray-600">
                We're preparing your WhatsApp Business connection. This will just take a moment.
              </p>
            </div>
          </div>
        );

      case 'authenticating':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <ExternalLink className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Authenticate with WhatsApp</h3>
              <p className="text-gray-600 mb-4">
                Click the button below to open the WhatsApp authentication page and follow the instructions to connect your account.
              </p>
            </div>
            <Button onClick={openAuthUrl} className="bg-green-600 hover:bg-green-700 px-8">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open WhatsApp Authentication
            </Button>
            {polling && (
              <div className="flex items-center justify-center gap-2 text-blue-600 pt-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Waiting for authentication...</span>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Connection Successful!</h3>
              <p className="text-gray-600">
                Your WhatsApp Business account has been successfully connected. You can now create pipelines and start engaging with customers.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Setup Wizard
          </DialogTitle>
          <DialogDescription>
            Step {currentStep === 'intro' ? '1' : currentStep === 'connecting' ? '2' : currentStep === 'authenticating' ? '3' : '4'} of 4
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {currentStep !== 'success' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConnectionWizard;

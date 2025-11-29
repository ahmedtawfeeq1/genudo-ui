
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Smartphone, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: (accountId: string) => void;
}

const WhatsAppConnectionDialog: React.FC<WhatsAppConnectionDialogProps> = ({
  open,
  onOpenChange,
  onConnectionSuccess,
}) => {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (polling) {
      pollInterval = setInterval(checkConnectionStatus, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [polling, connectionName]);

  const initiateWhatsAppConnection = async () => {
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
    
    try {
      console.log('=== Starting WhatsApp Connection ===');
      console.log('User ID:', 'demo');
      console.log('Connection Name:', connectionName);

      const authResponse = { url: 'about:blank' };
      setAuthUrl(authResponse.url);
      setPolling(true);

      toast({
        title: "Authentication URL Ready",
        description: "Click the button below to connect your WhatsApp Business account",
      });

    } catch (error: any) {
      console.error('❌ Connection initiation failed:', error);
      setError(error.message || "Failed to initiate WhatsApp connection");
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate WhatsApp connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!connectionName.trim()) return;

    try {
      const latestAccount = { id: `acc-${Date.now()}`, connector_account_identifier: connectionName.trim() } as any;
      setPolling(false);
      toast({ title: "WhatsApp Connected!", description: "Your WhatsApp account has been successfully connected" });
      onConnectionSuccess(latestAccount.id);
      onOpenChange(false);
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
    setConnectionName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Connect WhatsApp Account
          </DialogTitle>
          <DialogDescription>
            Connect your WhatsApp Business account to create and manage pipelines
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {!authUrl ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Connect Your WhatsApp</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter a name for this connection and we'll generate a secure link
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
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <ExternalLink className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to open the WhatsApp authentication page
                  </p>
                  <Button onClick={openAuthUrl} className="bg-green-600 hover:bg-green-700 mb-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect WhatsApp Account
                  </Button>
                  <p className="text-xs text-gray-500">
                    A new window will open. Follow the instructions to connect your account.
                  </p>
                  
                  {polling && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 mt-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Waiting for connection...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!authUrl && (
            <Button 
              onClick={initiateWhatsAppConnection} 
              disabled={loading || !connectionName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                'Generate Connection Link'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConnectionDialog;

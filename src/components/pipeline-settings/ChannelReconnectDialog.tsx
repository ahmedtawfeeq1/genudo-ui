
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Loader2, MessageCircle } from "lucide-react";
import ConnectionStatusListener from "@/components/whatsapp/ConnectionStatusListener";
 
import { useToast } from "@/hooks/use-toast";
import { ConnectorAccount } from "@/types/pipeline";

interface ChannelReconnectDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  connectorAccount: ConnectorAccount | null;
  onSuccess: () => void;
}

const ChannelReconnectDialog: React.FC<ChannelReconnectDialogProps> = ({
  open,
  setOpen,
  connectorAccount,
  onSuccess,
}) => {
  const [reconnectStep, setReconnectStep] = useState<'init' | 'processing' | 'qr_scan' | 'listening'>('init');
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectUrl, setReconnectUrl] = useState<string | null>(null);
  const [reconnectError, setReconnectError] = useState<string | null>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  const { toast } = useToast();

  // Monitor popup window closure
  React.useEffect(() => {
    if (!popupWindow || reconnectStep !== 'listening') return;
    const checkWindowClosed = setInterval(() => {
      if (popupWindow.closed) {
        setReconnectStep('init');
        setPopupWindow(null);
      }
    }, 500);
    return () => { clearInterval(checkWindowClosed); };
  }, [popupWindow, reconnectStep]);

  const startReconnection = async () => {
    if (!connectorAccount) return;
    setReconnectStep('processing');
    setReconnecting(true);
    setReconnectError(null);

    try {
      await new Promise(res => setTimeout(res, 200));
      setReconnectUrl(`${window.location.origin}/connection/reconnect`);
      setReconnectStep('qr_scan');
    } catch (error: any) {
      setReconnectError(error.message || 'Failed to initiate reconnection');
      toast({
        title: "Reconnection Failed",
        description: error.message || "Failed to initiate reconnection",
        variant: "destructive",
      });
    } finally {
      setReconnecting(false);
    }
  };

  const openReconnectWindow = () => {
    if (!reconnectUrl) return;
    const popup = window.open(reconnectUrl, '_blank', 'width=600,height=800');
    setPopupWindow(popup);
    setReconnectStep('listening');
  };

  const handleReconnectionSuccess = () => {
    // Close the popup window if it's still open
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }

    toast({
      title: "Reconnection Successful",
      description: "The channel account has been reconnected successfully",
    });
    setReconnectStep('init');
    setReconnectUrl(null);
    setPopupWindow(null);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Reconnect Channel Account
          </DialogTitle>
          <DialogDescription>
            Reconnect your channel account to restore communication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {reconnectStep === 'init' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-600">
                Are you sure you want to reconnect this channel account? This will allow you to re-authenticate and restore your connection.
              </p>
              <div className="pt-2">
                <Button onClick={startReconnection} className="w-full">
                  Start Reconnection
                </Button>
              </div>
            </div>
          )}

          {reconnectStep === 'processing' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-600">
                Preparing reconnection process...
              </p>
            </div>
          )}

          {reconnectStep === 'qr_scan' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                Click the button below to open the reconnection page in a new window. You'll need to scan the QR code with your WhatsApp Business app.
              </p>
              <Button onClick={openReconnectWindow} className="w-full bg-green-600 hover:bg-green-700">
                Open QR Scanner
              </Button>
            </div>
          )}

          {reconnectStep === 'listening' && connectorAccount && (
            <ConnectionStatusListener
              accountId={connectorAccount.id}
              connectionName={connectorAccount.connector_account_identifier}
              onSuccess={handleReconnectionSuccess}
              onRetry={() => setReconnectStep('init')}
              onClose={() => { setOpen(false); setReconnectStep('init'); }}
            />
          )}

          {reconnectError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {reconnectError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelReconnectDialog;

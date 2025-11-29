
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Loader2, 
  Mail,
  Send
} from 'lucide-react';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChannelConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: (accountId: string) => void;
}

const channels = [
  {
    id: 'WHATSAPP',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Connect your WhatsApp Business account'
  },
  {
    id: 'GMAIL',
    name: 'Gmail',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Connect your Gmail account'
  },
  {
    id: 'MESSENGER',
    name: 'Messenger',
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Connect your Facebook Messenger'
  }
];

const ChannelConnectionDialog: React.FC<ChannelConnectionDialogProps> = ({
  open,
  onOpenChange,
  onConnectionSuccess,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('WHATSAPP');
  const [connectionName, setConnectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!selectedChannel || !connectionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a channel and enter a connection name",
        variant: "destructive",
      });
      return;
    }

    if (selectedChannel === 'WHATSAPP') {
      await handleWhatsAppConnection();
    } else {
      toast({
        title: "Coming Soon",
        description: `${selectedChannel} integration is coming soon!`,
        variant: "default",
      });
    }
  };

  const handleWhatsAppConnection = async () => {
    setLoading(true);
    
    try {
      console.log('Starting WhatsApp connection with name:', connectionName);

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

      // Open the authentication URL in a new window
      const authWindow = window.open(authResponse.url, '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
      
      if (!authWindow) {
        throw new Error('Failed to open authentication window. Please allow popups and try again.');
      }

      // Start polling for successful connection
      setPolling(true);
      const pollInterval = setInterval(async () => {
        try {
          const { data: checkData } = await db.functions.invoke('unipile-check-connection', {
            body: { accountId: connectionName.trim() }
          });
          if (checkData?.status === 'active') {
            clearInterval(pollInterval);
            setLoading(false);
            setPolling(false);
            if (!authWindow.closed) authWindow.close();
            toast({ title: "Connection Successful!", description: `${connectionName} has been connected successfully.` });
            onConnectionSuccess(checkData.account?.id || 'acc-static');
            onOpenChange(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          setPolling(false);
          if (!authWindow.closed) {
            authWindow.close();
          }
          toast({
            title: "Connection Timeout",
            description: "Connection process timed out. Please try again.",
            variant: "destructive",
          });
        }
      }, 300000);

    } catch (error: any) {
      console.error('WhatsApp connection failed:', error);
      setLoading(false);
      setPolling(false);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate WhatsApp connection",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!loading && !polling) {
      setSelectedChannel('WHATSAPP');
      setConnectionName('');
      setAuthUrl(null);
      onOpenChange(false);
    }
  };

  const selectedChannelData = channels.find(ch => ch.id === selectedChannel);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Channel</DialogTitle>
          <DialogDescription>
            Choose a communication channel and give it a name
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="e.g., My Business WhatsApp, Personal Account"
              disabled={loading || polling}
            />
          </div>

          <div className="space-y-3">
            <Label>Select Channel Type</Label>
            <div className="space-y-2">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Card 
                    key={channel.id}
                    className={`cursor-pointer transition-all ${
                      selectedChannel === channel.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !loading && !polling && setSelectedChannel(channel.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${channel.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${channel.color}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{channel.name}</h3>
                          <p className="text-sm text-gray-500">{channel.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {polling && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Waiting for connection...</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Please complete the authentication in the opened window
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading || polling}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={loading || polling || !selectedChannel || !connectionName.trim()}
            className="min-w-[100px]"
          >
            {loading || polling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {loading ? 'Connecting...' : 'Waiting...'}
              </>
            ) : (
              `Connect ${selectedChannelData?.name || 'Channel'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelConnectionDialog;

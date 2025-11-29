
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Plus, Loader2 } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';
import ChannelSelectionDialog from '@/components/pipelines/ChannelSelectionDialog';

interface SwitchChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAccountId: string | null;
  pipelineId: string;
  onAccountChanged: () => void;
}

interface ConnectorAccount {
  id: string;
  connector_account_identifier: string;
  channel_type: string;
  external_account_id: string;
  status: string;
  created_at: string;
}

const SwitchChannelDialog: React.FC<SwitchChannelDialogProps> = ({
  open,
  onOpenChange,
  currentAccountId,
  pipelineId,
  onAccountChanged,
}) => {
  const [accounts, setAccounts] = useState<ConnectorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const user: any = { id: 'demo' };
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchAccounts();
    }
  }, [open, user]);

  useEffect(() => {
    if (currentAccountId) {
      setSelectedAccountId(currentAccountId);
    }
  }, [currentAccountId]);

  const fetchAccounts = async () => {
    try {
      const accountsData: ConnectorAccount[] = [
        { id: 'acc-1', connector_account_identifier: 'WhatsApp Account', channel_type: 'WHATSAPP', external_account_id: '+1555-0101@s.whatsapp.net', status: 'active', created_at: new Date().toISOString() },
        { id: 'acc-2', connector_account_identifier: 'FB Messenger Page', channel_type: 'MESSENGER', external_account_id: 'pg-1', status: 'active', created_at: new Date().toISOString() },
      ];
      setAccounts(accountsData);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    if (!selectedAccountId || selectedAccountId === currentAccountId) return;

    setSwitching(true);

    await new Promise(res => setTimeout(res, 200));
    toast({ title: "Account Switched", description: "The channel account has been switched (static)" });
    onAccountChanged();
    onOpenChange(false);
    setSwitching(false);
  };

  const handleNewConnectionSuccess = (accountId: string) => {
    // Automatically switch to the new account
    // For Messenger, accountId might be 'messenger-new' or actual ID
    if (accountId && accountId !== 'messenger-new') {
      handleSwitchToNewAccount(accountId);
    } else {
      // If we don't have the ID immediately (e.g. Messenger reload), just refresh
      onAccountChanged();
      onOpenChange(false);
    }
    setShowChannelDialog(false);
  };

  const handleSwitchToNewAccount = async (accountId: string) => {
    await new Promise(res => setTimeout(res, 200));
    toast({ title: "New Account Connected", description: "Connected (static UI)" });
    onAccountChanged();
    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
      case 'disconnected':
        return 'text-red-600';
      case 'reconnecting':
        return 'text-blue-600';
      default:
        return 'text-orange-600';
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'WHATSAPP':
        return <img src="/channel-icons/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'GMAIL':
        return <img src="/channel-icons/gmail.svg" alt="Gmail" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'MESSENGER':
        return <img src="/channel-icons/messenger.svg" alt="Messenger" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'INSTAGRAM':
        return <img src="/channel-icons/instagram.svg" alt="Instagram" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'TELEGRAM':
        return <img src="/channel-icons/telegram.svg" alt="Telegram" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'LINKEDIN':
        return <img src="/channel-icons/linkedin.svg" alt="LinkedIn" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'OUTLOOK':
        return <img src="/channel-icons/outlook.svg" alt="Outlook" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'EMAIL':
        return <img src="/channel-icons/email.svg" alt="Email" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'WEBCHAT':
        return <img src="/channel-icons/webchat.svg" alt="Webchat" className="h-5 w-5 object-contain flex-shrink-0" />;
      case 'API':
        return <img src="/channel-icons/api.svg" alt="API" className="h-5 w-5 object-contain flex-shrink-0" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              Switch Channel Account
            </DialogTitle>
            <DialogDescription>
              Select a different account or connect a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading accounts...</span>
              </div>
            ) : (
              <>
                {accounts.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Available Accounts
                      </label>
                      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id} className="hover:bg-gray-50">
                              <div className="flex items-center justify-between w-full min-w-0">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  {getChannelIcon(account.channel_type)}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium truncate">{account.connector_account_identifier}</span>
                                      {account.id === currentAccountId && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <span className={`text-xs ${getStatusColor(account.status)} capitalize`}>
                                      {account.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedAccountId && (
                      <Button
                        onClick={handleSwitchAccount}
                        disabled={switching || selectedAccountId === currentAccountId}
                        className="w-full"
                      >
                        {switching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Switching...
                          </>
                        ) : selectedAccountId === currentAccountId ? (
                          'Currently Selected'
                        ) : (
                          'Switch to This Account'
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Accounts Found</h3>
                    <p className="text-sm text-gray-500">Connect your first communication channel</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Button
                    onClick={() => setShowChannelDialog(true)}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect New Account
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChannelSelectionDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        onSuccess={handleNewConnectionSuccess}
        pipelineId={pipelineId}
      />
    </>
  );
};

export default SwitchChannelDialog;

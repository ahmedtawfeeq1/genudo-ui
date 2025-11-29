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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Plus, AlertCircle } from 'lucide-react';
/**
 * CreatePipelineDialog
 * Static UI dialog that simulates pipeline creation.
 * - Preserves form, validations, and channel selection flow
 * - Replaces backend calls with local mock data and toasts
 * Integration points to replace later:
 * - fetchConnectorAccounts
 * - submit pipeline creation
 */
import { useToast } from '@/hooks/use-toast';
import ChannelSelectionDialog from '@/components/pipelines/ChannelSelectionDialog';
import WhatsAppConnectionFlow from '@/components/whatsapp/WhatsAppConnectionFlow';

// ... (existing imports)

interface CreatePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ConnectorAccount {
  id: string;
  connector_account_identifier: string;
  channel_type: string;
  created_at: string;
}

const CreatePipelineDialog: React.FC<CreatePipelineDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [selectedConnectorAccount, setSelectedConnectorAccount] = useState('');
  const [connectorAccounts, setConnectorAccounts] = useState<ConnectorAccount[]>([]);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const { toast } = useToast();

  const [usedAccountIds, setUsedAccountIds] = useState<Set<string>>(new Set());

  /**
   * loadConnectorAccounts
   * Seeds static channel accounts and marks some as used.
   */
  const loadConnectorAccounts = () => {
    const accounts: ConnectorAccount[] = [
      { id: 'acc-1', connector_account_identifier: 'WhatsApp Business', channel_type: 'WHATSAPP', created_at: new Date().toISOString() },
      { id: 'acc-2', connector_account_identifier: 'Facebook Page', channel_type: 'MESSENGER', created_at: new Date().toISOString() },
    ];
    setConnectorAccounts(accounts);
    setUsedAccountIds(new Set(['acc-2']));
  };

  useEffect(() => {
    if (open) {
      loadConnectorAccounts();
    }
  }, [open]);

  /**
   * handleSubmit
   * Validates and simulates pipeline creation.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pipelineName.trim()) {
      toast({
        title: "Validation Error",
        description: "Pipeline name is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedConnectorAccount) {
      toast({
        title: "Validation Error",
        description: "Please select a channel account",
        variant: "destructive",
      });
      return;
    }

    if (usedAccountIds.has(selectedConnectorAccount)) {
      toast({
        title: "Account Already Connected",
        description: "Try connecting new channel or disconnect the channel from pipeline.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 500));
      toast({ title: "Success", description: "Pipeline created successfully" });
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create pipeline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPipelineName('');
    setPipelineDescription('');
    setSelectedConnectorAccount('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  /**
   * handleChannelConnection
   * Receives connected account id and refreshes local list.
   */
  const handleChannelConnection = async (accountId: string) => {
    console.log('🔗 Channel connected with account ID:', accountId);
    // Append new account to list
    if (accountId && accountId !== 'messenger-new') {
      setConnectorAccounts(prev => ([
        ...prev,
        { id: accountId, connector_account_identifier: 'New Connected Account', channel_type: 'WHATSAPP', created_at: new Date().toISOString() }
      ]));
    }

    // Close the channel dialog
    setShowChannelDialog(false);

    // Auto-select the newly connected account if we have an ID
    if (accountId && accountId !== 'messenger-new') {
      setSelectedConnectorAccount(accountId);

      toast({
        title: "Channel Connected!",
        description: "Your channel has been successfully connected and auto-selected.",
      });
    } else if (accountId === 'messenger-new') {
      // For Messenger, we might need to reload or just show success
      toast({
        title: "Channel Connected!",
        description: "Your Messenger channel has been connected.",
      });
      loadConnectorAccounts();
    }
  };

  // ... (existing helper functions)

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Create a new automated pipeline for your communication channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline-name">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                placeholder="e.g. Sales Pipeline"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipeline-description">Description (Optional)</Label>
              <Textarea
                id="pipeline-description"
                placeholder="Describe the purpose of this pipeline..."
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connector-account">Channel Account</Label>
              <Select
                value={selectedConnectorAccount}
                onValueChange={(value) => {
                  if (value === 'connect-new') {
                    setShowChannelDialog(true);
                  } else {
                    if (usedAccountIds.has(value)) {
                      toast({
                        title: "Account Already Connected",
                        description: "Try connecting new channel or disconnect the channel from pipeline.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setSelectedConnectorAccount(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger id="connector-account">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {connectorAccounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      disabled={usedAccountIds.has(account.id)}
                      className={usedAccountIds.has(account.id) ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {account.connector_account_identifier} ({account.channel_type})
                      {usedAccountIds.has(account.id) && " (Connected)"}
                    </SelectItem>
                  ))}
                  <SelectItem value="connect-new" className="text-blue-600 font-medium border-t mt-1 pt-1">
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Connect New Channel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {connectorAccounts.length === 0 && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  You need to connect a channel first.
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Pipeline'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ChannelSelectionDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        onSuccess={handleChannelConnection}
      />
    </>
  );
};

export default CreatePipelineDialog;

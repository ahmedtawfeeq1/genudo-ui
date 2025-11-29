import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, MessageCircle } from 'lucide-react';
import ChannelSelectionDialog from '@/components/pipelines/ChannelSelectionDialog';

interface SelectExistingAccountProps {
    pipelineId: string;
    currentAccountId: string | null;
}

const SelectExistingAccount: React.FC<SelectExistingAccountProps> = ({ pipelineId, currentAccountId }) => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [showChannelDialog, setShowChannelDialog] = useState(false);
    const user: any = { id: 'demo' };
    const { toast } = useToast();

    useEffect(() => {
        fetchAvailableAccounts();
    }, [user]);

    const fetchAvailableAccounts = async () => {
        setAccounts([
            { id: 'acc-1', connector_account_identifier: 'WhatsApp Business', connector_sender_provider_id: '+1555-0101@s.whatsapp.net', channel_type: 'WHATSAPP' },
            { id: 'acc-2', connector_account_identifier: 'FB Messenger Page', connector_sender_provider_id: null, channel_type: 'MESSENGER' },
        ]);
        setLoading(false);
    };

    const [selectKey, setSelectKey] = useState(0);

    const handleSelectAccount = async (value: string) => {
        if (value === 'connect-new') {
            // Reset the selection so "Connect New" doesn't stay selected
            // This allows the user to click it again if they cancel the dialog
            // We do this by not updating the state or by forcing a re-render if needed,
            // but since the Select component is controlled by `value` prop if we passed it,
            // we should probably make it controlled.
            // However, the current implementation seems uncontrolled or partially controlled.
            // Let's open the dialog and NOT set 'selecting' to true.
            setShowChannelDialog(true);
            // Force reset the select component by changing its key
            setSelectKey(prev => prev + 1);
            return;
        }

        setSelecting(true);
        toast({ title: "Account Connected", description: "Connected (static UI)" });
        setSelecting(false);
    };

    const handleChannelConnection = async (accountId: string) => {
        await fetchAvailableAccounts();
        setShowChannelDialog(false);

        if (accountId) {
            // Automatically select the new account
            handleSelectAccount(accountId === 'messenger-new' ? accounts[0]?.id : accountId);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
        );
    }

    const formatPhoneNumber = (senderId: string | null) => {
        if (!senderId) return '';
        return senderId.replace('@s.whatsapp.net', '');
    };

    const getChannelIcon = (channelType: string) => {
        switch (channelType) {
            case 'WHATSAPP':
                return <MessageCircle className="h-4 w-4 text-green-600" />;
            case 'MESSENGER':
                return <MessageCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <MessageCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className="w-full">
            <Select key={selectKey} onValueChange={handleSelectAccount} disabled={selecting}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select existing account..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="connect-new" className="text-blue-600 font-medium border-b pb-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Connect New Account</span>
                        </div>
                    </SelectItem>
                    {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                                {getChannelIcon(account.channel_type)}
                                <span className="font-medium">{account.connector_account_identifier}</span>
                                {account.connector_sender_provider_id && (
                                    <span className="text-xs text-gray-500">
                                        ({formatPhoneNumber(account.connector_sender_provider_id)})
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <ChannelSelectionDialog
                open={showChannelDialog}
                onOpenChange={setShowChannelDialog}
                onSuccess={handleChannelConnection}
                pipelineId={pipelineId}
            />
        </div>
    );
};

export default SelectExistingAccount;

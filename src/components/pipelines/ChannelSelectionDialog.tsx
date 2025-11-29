import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import WhatsAppConnectionFlow from '@/components/whatsapp/WhatsAppConnectionFlow';
import MessengerConnectDialog from '@/components/messenger/MessengerConnectDialog';

interface ChannelSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (accountId: string) => void;
    pipelineId?: string;
}

const ChannelSelectionDialog: React.FC<ChannelSelectionDialogProps> = ({
    open,
    onOpenChange,
    onSuccess,
    pipelineId
}) => {
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [showMessenger, setShowMessenger] = useState(false);

    const handleWhatsAppClick = () => {
        onOpenChange(false);
        setShowWhatsApp(true);
    };

    const handleMessengerClick = () => {
        onOpenChange(false);
        setShowMessenger(true);
    };

    const handleWhatsAppSuccess = (accountId: string) => {
        setShowWhatsApp(false);
        onSuccess(accountId);
    };

    const handleMessengerSuccess = () => {
        setShowMessenger(false);
        // Messenger dialog reloads page on success usually, but if we want to handle it gracefully:
        // We might need to fetch the latest account or just reload.
        // For now, let's assume the parent handles the reload or refetch if needed.
        // Since MessengerConnectDialog calls window.location.reload() by default in some places,
        // we might want to override that behavior if possible, but for now let's stick to the existing flow.
        // If the dialog reloads, this callback won't matter much.
        // If we passed a custom onSuccess to MessengerConnectDialog that doesn't reload:
        onSuccess('messenger-new'); // ID might not be available immediately without fetch
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Connect a Channel</DialogTitle>
                        <DialogDescription>
                            Choose a communication channel to connect to your pipeline.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-green-500 hover:bg-green-50 transition-all"
                            onClick={handleWhatsAppClick}
                        >
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <img src="/channel-icons/whatsapp.svg" alt="WhatsApp" className="h-8 w-8 object-contain" />
                            </div>
                            <div className="text-center">
                                <div className="font-semibold">WhatsApp</div>
                                <div className="text-xs text-muted-foreground">Business API</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all"
                            onClick={handleMessengerClick}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <img src="/channel-icons/messenger.svg" alt="Messenger" className="h-8 w-8 object-contain" />
                            </div>
                            <div className="text-center">
                                <div className="font-semibold">Messenger</div>
                                <div className="text-xs text-muted-foreground">Facebook Page</div>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <WhatsAppConnectionFlow
                open={showWhatsApp}
                onOpenChange={setShowWhatsApp}
                onConnectionSuccess={handleWhatsAppSuccess}
            />

            <MessengerConnectDialog
                open={showMessenger}
                onOpenChange={setShowMessenger}
                onSuccess={handleMessengerSuccess}
                pipelineId={pipelineId}
            />
        </>
    );
};

export default ChannelSelectionDialog;

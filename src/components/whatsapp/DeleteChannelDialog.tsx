
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
  channelType?: string;
  pipelineId: string;
  onAccountDeleted: () => void;
}

const DeleteChannelDialog: React.FC<DeleteChannelDialogProps> = ({
  open,
  onOpenChange,
  accountId,
  accountName,
  channelType,
  pipelineId,
  onAccountDeleted,
}) => {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      console.log('🗑️ Starting account deletion process for:', accountId, 'Type:', channelType);

      // Static UI: simulate disconnect and removal
      console.log('📡 Simulating channel disconnect and removal');

      toast({
        title: "Account Deleted",
        description: "The channel account has been deleted (static)",
      });

      onAccountDeleted();
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Channel Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the account "{accountName}"? This action cannot be undone.
            The account will be disconnected from all services and removed from this pipeline.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChannelDialog;

import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface OpportunityDeleteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  loading: boolean;
  deleteContact: () => Promise<void>;
}

const OpportunityDeleteDialog: React.FC<OpportunityDeleteDialogProps> = ({
  open,
  setOpen,
  loading,
  deleteContact
}) => {
  const handleDeleteContact = async () => {
    await deleteContact(); // Delete contact and all opportunities
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Contact & All Data
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete this contact and all related opportunities, conversations, and messages? This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDeleteContact}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Contact & All Data
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OpportunityDeleteDialog;

import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeletePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineName: string;
  deleteConfirmation: string;
  setDeleteConfirmation: (v: string) => void;
  deleting: boolean;
  handleDeletePipeline: () => Promise<void>;
}

const DeletePipelineDialog: React.FC<DeletePipelineDialogProps> = ({
  open,
  onOpenChange,
  pipelineName,
  deleteConfirmation,
  setDeleteConfirmation,
  deleting,
  handleDeletePipeline,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Delete Pipeline Permanently
        </AlertDialogTitle>
        <AlertDialogDescription className="space-y-4">
          <p>
            You are about to permanently delete <strong>"{pipelineName}"</strong> and all associated data.
          </p>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-sm text-red-800 font-medium">This will delete:</p>
            <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
              <li>All opportunities</li>
              <li>All stages</li>
              <li>All conversations and messages</li>
              <li>All automation rules</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label>To confirm, type the pipeline name:</Label>
            <Input
              value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              placeholder={pipelineName}
            />
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
        <Button
          variant="destructive"
          onClick={handleDeletePipeline}
          disabled={deleting || deleteConfirmation !== pipelineName}
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Pipeline
            </>
          )}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeletePipelineDialog;

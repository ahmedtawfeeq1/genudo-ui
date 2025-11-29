
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import type { Stage, StageAction } from "./types";
import CreateActionDialog from "./CreateActionDialog";
import ActionEditDialog from "./ActionEditDialog";
import StageActionsList from "./StageActionsList";
import useStageActions from "./useStageActions";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StageAutomationsDialogProps {
  stage: Stage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const StageAutomationsDialog: React.FC<StageAutomationsDialogProps> = ({
  stage,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [showCreateAction, setShowCreateAction] = useState(false);
  const [editingAction, setEditingAction] = useState<StageAction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { user } = useAuth();

  // Use centralized hook for all action querying & manipulation
  const {
    actions,
    loading,
    handleEditSuccess,
    handleDelete,
    handleToggleActive,
    fetchActions,
  } = useStageActions({
    stageId: stage.id,
    userId: user?.id,
    onSuccess,
  });

  // Refresh actions list when dialog is opened
  React.useEffect(() => {
    if (open) {
      fetchActions();
      setEditingAction(null);
      setShowCreateAction(false);
    }
    // eslint-disable-next-line
  }, [open, stage.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stage Actions: {stage.stage_name}
          </DialogTitle>
          <DialogDescription>
            Configure actions that trigger based on stage events and conditions
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Actions</h3>
          <div className="flex items-center gap-2">
            <a href="/GenuDo_Actions_Template.json" download className="inline-flex items-center px-3 py-2 border rounded-md text-sm hover:bg-muted">
              Download n8n Template
            </a>
            <Button onClick={() => setShowCreateAction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
        </div>
        <StageActionsList
          actions={actions}
          loading={loading}
          onEdit={setEditingAction}
          onDelete={(id) => {
            setDeleteTargetId(id);
            setShowDeleteDialog(true);
          }}
          onToggleActive={handleToggleActive}
        />
        {showCreateAction && (
          <CreateActionDialog
            open={showCreateAction}
            onOpenChange={setShowCreateAction}
            onSuccess={fetchActions}
            stage={stage}
            userId={user?.id}
          />
        )}
        {editingAction && (
          <ActionEditDialog
            open={!!editingAction}
            onOpenChange={(open) => { if (!open) setEditingAction(null); }}
            onSuccess={handleEditSuccess}
            action={editingAction}
            stage={stage}
            userId={user?.id}
          />
        )}

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Action"
          description="Are you sure you want to delete this action? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => {
            if (deleteTargetId) {
              handleDelete(deleteTargetId);
            }
            setShowDeleteDialog(false);
            setDeleteTargetId(null);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDeleteTargetId(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StageAutomationsDialog;

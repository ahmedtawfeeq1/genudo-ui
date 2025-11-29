import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save } from "lucide-react";
import { useStageModalForm } from "./useStageModalForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import StageModalTabs from "./StageModalTabs";
import StageModalGeneralTab from "./StageModalGeneralTab";
import StageModalAIConfigTab from "./StageModalAIConfigTab";
import StageModalNavigationTab from "./StageModalNavigationTab";
import StageModalRoutingTab from "./StageModalRoutingTab";
import StageAutomationsDialog from "./StageAutomationsDialog";
import { StageFollowUpDialog } from "../stages/forms/StageFollowUpDialog";

interface StageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  stage?: any; // if editing an existing stage
  pipelineId?: string; // if creating a new stage
  mode: "create" | "edit";
}

const StageModal: React.FC<StageModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  stage,
  pipelineId,
  mode,
}) => {
  const [showAutomations, setShowAutomations] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [tab, setTab] = useState("general");

  const {
    formData,
    loading,
    agents,
    isDirty,
    handleInputChange,
    handleSubmit,
    handleClose,
    saveDraft,
    UnsavedChangesDialog,
    showRestoreDialog,
    handleRestoreConfirm,
    handleRestoreCancel,
  } = useStageModalForm({
    open,
    mode,
    stage,
    pipelineId,
    onSuccess,
    onOpenChange,
  });

  const handleAutomationsClick = () => setShowAutomations(true);
  const handleFollowUpClick = () => setShowFollowUpDialog(true);
  const handleFollowUpDialogSave = () => setShowFollowUpDialog(false);

  // Close handler that checks for unsaved changes
  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (isDirty) {
        // Use the enhanced close handler that shows 3-option confirmation
        handleClose();
      } else {
        // Close immediately if no unsaved changes
        onOpenChange(false);
      }
    } else {
      onOpenChange(open);
    }
  };

  // Manual save draft handler
  const handleSaveDraft = async () => {
    await saveDraft();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {mode === "edit" ? `Edit Stage: ${stage?.stage_name}` : "Create New Stage"}
              {isDirty && (
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  Unsaved Changes
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Configure stage settings, AI behavior, and automation rules."
                : "Add a new stage to your pipeline with optional AI, routing, and follow-up logic."}
            </DialogDescription>
          </DialogHeader>

          {/* Auto-save notification */}
          {isDirty && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Save className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Changes detected</span>
                    </div>
                    <span>•</span>
                    <span>Your changes will be preserved</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Draft
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <StageModalTabs value={tab} onValueChange={setTab}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div hidden={tab !== "general"}>
                <StageModalGeneralTab
                  formData={formData}
                  onInputChange={handleInputChange}
                  onAutomationsClick={handleAutomationsClick}
                  onFollowUpClick={handleFollowUpClick}
                  creating={mode === "create"}
                />
              </div>
              <div hidden={tab !== "ai-config"}>
                <StageModalAIConfigTab
                  formData={formData}
                  agents={agents}
                  onInputChange={handleInputChange}
                  hideStageAgentFields={true}
                />
              </div>
              <div hidden={tab !== "navigation"}>
                <StageModalNavigationTab
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end items-center pt-6 border-t">
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    className="relative"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="relative"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {mode === "edit" ? "Saving..." : "Creating..."}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>
                          {mode === "edit" ? "Save Changes" : "Create Stage"}
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </StageModalTabs>
        </DialogContent>
      </Dialog>
      
      {/* 3-Option Unsaved Changes Dialog */}
      <UnsavedChangesDialog />
      
      {/* Restore Dialog */}
      <ConfirmDialog
        open={showRestoreDialog}
        onOpenChange={() => {}} // Controlled by the hook
        title="Restore Draft"
        description="We found unsaved changes from a previous session. Would you like to restore them?"
        confirmText="Restore"
        cancelText="Discard"
        variant="default"
        onConfirm={handleRestoreConfirm}
        onCancel={handleRestoreCancel}
      />
      
      {/* Other Dialogs */}
      {stage && (
        <StageAutomationsDialog
          stage={stage}
          open={showAutomations}
          onOpenChange={setShowAutomations}
          onSuccess={onSuccess}
        />
      )}
      
      <StageFollowUpDialog
        open={showFollowUpDialog}
        onOpenChange={setShowFollowUpDialog}
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleFollowUpDialogSave}
        loading={loading}
      />
    </>
  );
};

export default StageModal;

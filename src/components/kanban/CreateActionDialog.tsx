import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useTriggerConditions } from "@/hooks/useEnumValues";
import { CreateActionForm } from "./CreateActionForm";
import { useCreateActionForm } from "./useCreateActionForm";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  stage: any;
  userId: string;
}

const CreateActionDialog: React.FC<CreateActionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  stage,
  userId,
}) => {
  const { options: triggerConditionOptions } = useTriggerConditions();
  const {
    formData,
    loading,
    resetForm,
    handleInputChange,
    handleSubmit,
  } = useCreateActionForm({
    stage,
    userId,
    onSuccess,
    onOpenChange,
  });

  const handleDialogOpenChange = (o: boolean) => {
    if (!o) resetForm();
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Create New Action
          </DialogTitle>
          <DialogDescription>
            Define a new automation/action for this stage.
          </DialogDescription>
        </DialogHeader>
        <CreateActionForm
          loading={loading}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            onOpenChange(false);
          }}
          triggerConditionOptions={triggerConditionOptions}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateActionDialog;

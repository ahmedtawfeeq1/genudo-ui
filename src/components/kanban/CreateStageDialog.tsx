
import React from "react";
import UniversalStageDialog from "../stages/UniversalStageDialog";

interface CreateStageDialogProps {
  pipelineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Create Stage Dialog - Uses the Universal Stage Dialog in create mode
 * This maintains backward compatibility while using the unified system
 */
const CreateStageDialog: React.FC<CreateStageDialogProps> = ({
  pipelineId,
  open,
  onOpenChange,
  onSuccess
}) => {
  return (
    <UniversalStageDialog
      mode="create"
      pipelineId={pipelineId}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
};

export default CreateStageDialog;

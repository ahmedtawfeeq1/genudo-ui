
import React from 'react';
import UniversalStageDialog from '../stages/UniversalStageDialog';

interface StageEditDialogProps {
  stage: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Stage Edit Dialog - Uses the Universal Stage Dialog in edit mode
 * This maintains backward compatibility while using the unified system
 */
const StageEditDialog: React.FC<StageEditDialogProps> = ({
  stage,
  open,
  onOpenChange,
  onSuccess,
}) => {
  return (
    <UniversalStageDialog
      mode="edit"
      stage={stage}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
};

export default StageEditDialog;

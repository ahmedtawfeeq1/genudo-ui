
import React from 'react';
import StageModal from '../kanban/StageModal';

interface UniversalStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  stage?: any; // for edit mode
  pipelineId?: string; // for create mode
}

/**
 * Universal Stage Dialog - A unified interface for creating and editing stages
 * This component uses the existing StageModal and consolidates all stage operations
 */
const UniversalStageDialog: React.FC<UniversalStageDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  mode,
  stage,
  pipelineId,
}) => {
  return (
    <StageModal
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      mode={mode}
      stage={stage}
      pipelineId={pipelineId}
    />
  );
};

export default UniversalStageDialog;

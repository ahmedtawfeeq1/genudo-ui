
import React from 'react';
import UnifiedOpportunityModal from './UnifiedOpportunityModal';

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

const CreateOpportunityDialog: React.FC<CreateOpportunityDialogProps> = (props) => {
  return (
    <UnifiedOpportunityModal
      {...props}
      mode="create"
    />
  );
};

export default CreateOpportunityDialog;

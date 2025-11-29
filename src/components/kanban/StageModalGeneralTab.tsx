
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { StageForm } from "./useStageModalForm";
import StageBasicInfoCard from "./StageBasicInfoCard";
import StageBehaviorCard from "./StageBehaviorCard";

interface StageModalGeneralTabProps {
  formData: StageForm;
  onInputChange: (field: string, value: any) => void;
  onAutomationsClick: () => void;
  onFollowUpClick: () => void;
  creating?: boolean;
}

const StageModalGeneralTab: React.FC<StageModalGeneralTabProps> = ({
  formData,
  onInputChange,
  onAutomationsClick,
  onFollowUpClick,
  creating = false,
}) => {
  return (
    <div className="space-y-6">
      <StageBasicInfoCard
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <StageBehaviorCard
        formData={formData}
        onInputChange={onInputChange}
        onAutomationsClick={onAutomationsClick}
        onFollowUpClick={onFollowUpClick}
        creating={creating}
      />
    </div>
  );
};

export default StageModalGeneralTab;

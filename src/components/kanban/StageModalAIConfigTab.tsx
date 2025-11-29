
import React from "react";
import AIConfigCard from "./AIConfigCard";
import type { Agent } from "./useStageModalForm";

interface Props {
  formData: any;
  agents: Agent[];
  onInputChange: (field: string, value: any) => void;
  hideStageAgentFields?: boolean;
}

const StageModalAIConfigTab: React.FC<Props> = ({ formData, agents, onInputChange, hideStageAgentFields = false }) => (
  <div className="space-y-4">
    <AIConfigCard formData={formData} agents={agents} onInputChange={onInputChange} hideStageAgentFields={hideStageAgentFields} />
  </div>
);

export default StageModalAIConfigTab;

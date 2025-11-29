
import React from 'react';

interface ChatContextInfoProps {
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
}

const ChatContextInfo: React.FC<ChatContextInfoProps> = ({
  pipelineId,
  stageId,
  agentId,
  opportunityId
}) => {
  if (!pipelineId && !stageId && !agentId && !opportunityId) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-xs font-medium text-blue-800 mb-1">Current Context:</div>
      <div className="text-xs text-blue-600 space-y-1">
        {pipelineId && <div>Pipeline: {pipelineId}</div>}
        {stageId && <div>Stage: {stageId}</div>}
        {agentId && <div>Agent: {agentId}</div>}
        {opportunityId && <div>Opportunity: {opportunityId}</div>}
      </div>
    </div>
  );
};

export default ChatContextInfo;

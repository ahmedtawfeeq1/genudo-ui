
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles } from 'lucide-react';
import ChatConnectionStatus from './ChatConnectionStatus';
import ChatContextInfo from './ChatContextInfo';

interface ChatHeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'testing';
  flowStatus?: string | null;
  onTestConnection: () => void;
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  connectionStatus,
  flowStatus,
  onTestConnection,
  pipelineId,
  stageId,
  agentId,
  opportunityId
}) => {
  return (
    <CardHeader className="pb-4 border-b border-gray-200/50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center relative">
          <Bot className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-bold">Nase7 AI Assistant</CardTitle>
          <ChatConnectionStatus 
            connectionStatus={connectionStatus}
            flowStatus={flowStatus}
            onTestConnection={onTestConnection}
          />
        </div>
      </div>
      
      <ChatContextInfo 
        pipelineId={pipelineId}
        stageId={stageId}
        agentId={agentId}
        opportunityId={opportunityId}
      />
    </CardHeader>
  );
};

export default ChatHeader;

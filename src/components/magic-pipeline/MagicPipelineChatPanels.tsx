import React from 'react';
import ModernChatPanel from '@/components/magic-pipeline/ModernChatPanel';
import SessionSidebar from '@/components/magic-pipeline/SessionSidebar';
import { SessionData } from '@/hooks/useSessionManager';

interface MagicPipelineChatPanelsProps {
  showConversations: boolean;
  showChat: boolean;
  conversationsCollapsed: boolean;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onToggleConversationsCollapse: () => void;
  onMessageReceived: (action: any) => void;
  onSessionMessagesLoaded: (messages: any[]) => void;
  pipelineId: string | null;
  // NEW PROPS: Pass session data from parent
  sessions: SessionData[];
  isLoadingSessions: boolean;
  onDeleteSession: (sessionId: string) => Promise<boolean>;
}

const MagicPipelineChatPanels: React.FC<MagicPipelineChatPanelsProps> = ({
  showConversations,
  showChat,
  conversationsCollapsed,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onToggleConversationsCollapse,
  onMessageReceived,
  onSessionMessagesLoaded,
  pipelineId,
  // NEW PROPS
  sessions,
  isLoadingSessions,
  onDeleteSession
}) => {
  if (!showConversations && !showChat) {
    return null;
  }

  return (
    <div className="flex flex-shrink-0 h-full">
      {/* Conversations Sidebar */}
      {showConversations && (
        <div className="flex-shrink-0">
          <SessionSidebar
            sessions={sessions}
            isLoading={isLoadingSessions}
            onSessionSelect={onSessionSelect} 
            onNewSession={onNewSession} 
            onDeleteSession={onDeleteSession}
            currentSessionId={currentSessionId} 
            collapsed={conversationsCollapsed} 
            onToggleCollapse={onToggleConversationsCollapse} 
          />
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="w-[500px] border-r border-gray-200 bg-white shadow-lg h-full">
          <ModernChatPanel 
            onMessageReceived={onMessageReceived} 
            pipelineId={pipelineId} 
            stageId={null} 
            agentId={null} 
            opportunityId={null} 
            sessionId={currentSessionId} 
            onSessionMessagesLoaded={onSessionMessagesLoaded} 
          />
        </div>
      )}
    </div>
  );
};

export default MagicPipelineChatPanels;
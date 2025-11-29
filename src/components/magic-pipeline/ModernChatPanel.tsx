
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useModernChat } from '@/hooks/useModernChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatQuickActions from './chat/ChatQuickActions';
import ChatInput from './chat/ChatInput';

interface ModernChatPanelProps {
  onMessageReceived?: (message: any) => void;
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
  onChatTriggerReady?: (triggerFunction: (message: string) => void) => void;
  sessionId?: string | null;
  onSessionMessagesLoaded?: (messages: any[]) => void;
}

const ModernChatPanel: React.FC<ModernChatPanelProps> = ({ 
  onMessageReceived,
  pipelineId = null,
  stageId = null,
  agentId = null,
  opportunityId = null,
  onChatTriggerReady,
  sessionId = null,
  onSessionMessagesLoaded
}) => {
  // NEW: Track whether the current session has user messages
  const [hasUserMessages, setHasUserMessages] = useState(false);
  
  const {
    messages,
    inputValue,
    setInputValue,
    isProcessing,
    flowStatus,
    connectionStatus,
    messagesEndRef,
    triggerSendMessage,
    testWebhookConnection,
    user
  } = useModernChat({
    onMessageReceived,
    pipelineId,
    stageId,
    agentId,
    opportunityId,
    onChatTriggerReady,
    sessionId
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    triggerSendMessage(inputValue.trim());
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessagesLoaded = (loadedMessages: any[]) => {
    console.log('Session messages loaded:', loadedMessages.length);
    if (onSessionMessagesLoaded) {
      onSessionMessagesLoaded(loadedMessages);
    }
  };

  // NEW: Handle user message detection
  const handleUserMessagesDetected = (hasMessages: boolean) => {
    setHasUserMessages(hasMessages);
  };

  // Log session ID for debugging
  useEffect(() => {
    console.log('📍 ModernChatPanel received session ID:', sessionId);
  }, [sessionId]);

  return (
    <div className="relative w-full h-full bg-white/90 backdrop-blur-md flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <ChatHeader 
          connectionStatus={connectionStatus}
          flowStatus={flowStatus}
          onTestConnection={testWebhookConnection}
          pipelineId={pipelineId}
          stageId={stageId}
          agentId={agentId}
          opportunityId={opportunityId}
        />
      </div>

      {/* Messages Area - Flexible middle section that takes remaining space */}
      <div className="flex-1 min-h-0">
        <ChatMessages 
          messages={messages}
          isProcessing={isProcessing}
          messagesEndRef={messagesEndRef}
          sessionId={sessionId}
          onMessagesLoaded={handleMessagesLoaded}
          onUserMessagesDetected={handleUserMessagesDetected} // NEW: Pass the callback
        />
      </div>

      {/* Footer - Fixed at bottom with no extra spacing */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        {/* Only show quick actions when there are no user messages */}
        <ChatQuickActions 
          messages={messages}
          isProcessing={isProcessing}
          connectionStatus={connectionStatus}
          onQuickAction={handleQuickAction}
          sessionId={sessionId}
          hasUserMessages={hasUserMessages} // NEW: Pass the user message state
        />

        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          isProcessing={isProcessing}
          connectionStatus={connectionStatus}
          user={user}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default ModernChatPanel;

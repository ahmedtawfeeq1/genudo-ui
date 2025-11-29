
import React, { useState, useEffect } from "react";
import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { type InboxConversation, type InboxMessage } from "@/hooks/useInboxData";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { toast } from "sonner";

interface ContactDetails {
  name: string;
  email: string;
  phone: string;
}

interface MessageThreadProps {
  selectedConversation: InboxConversation;
  messageHistory: InboxMessage[];
  contactDetails: ContactDetails;
  aiEnabled: boolean;
  toggleAI: () => void;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  selectedConversation,
  messageHistory,
  contactDetails,
  aiEnabled,
  toggleAI,
  onSendMessage,
  isLoading = false,
}) => {
  const [displayedMessages, setDisplayedMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);

  // Set up real-time messaging for this conversation
  const { invalidateMessageQueries, playNotificationSound } = useRealtimeMessages(selectedConversation?.id);

  useEffect(() => {
    if (messageHistory.length > 0) {
      const initialCount = Math.min(10, messageHistory.length);
      setDisplayedMessages(messageHistory.slice(messageHistory.length - initialCount));
    } else {
      setDisplayedMessages([]);
    }
  }, [messageHistory]);

  const loadMoreMessages = () => {
    setLoading(true);
    setTimeout(() => {
      const currentCount = displayedMessages.length;
      const additionalCount = Math.min(10, messageHistory.length - currentCount);
      if (additionalCount > 0) {
        const startIndex = messageHistory.length - currentCount - additionalCount;
        const newMessages = messageHistory.slice(
          Math.max(0, startIndex),
          messageHistory.length - currentCount
        );
        setDisplayedMessages([...newMessages, ...displayedMessages]);
      }
      setLoading(false);
    }, 500);
  };

  const handleSendMessage = (message: string, attachments?: File[]) => {
    console.log('📤 Sending message from MessageThread:', {
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      attachmentCount: attachments?.length || 0,
      conversationId: selectedConversation?.id
    });

    // Show immediate optimistic feedback
    const messageType = attachments && attachments.length > 0 
      ? `message with ${attachments.length} attachment(s)`
      : 'message';
    
    toast.info(`Sending ${messageType}...`, {
      duration: 1000,
    });

    // Call the parent handler if provided
    if (onSendMessage) {
      onSendMessage(message, attachments);
    }
    
    // Trigger immediate refresh of queries after sending
    setTimeout(() => {
      invalidateMessageQueries();
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        selectedConversation={selectedConversation}
        contactDetails={contactDetails}
        aiEnabled={aiEnabled}
        toggleAI={toggleAI}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      <MessageList
        displayedMessages={displayedMessages}
        messageHistory={messageHistory}
        loading={loading}
        loadMoreMessages={loadMoreMessages}
        fontSize={fontSize}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        chatId={selectedConversation?.connectorChatId}
      />
    </div>
  );
};

export default MessageThread;

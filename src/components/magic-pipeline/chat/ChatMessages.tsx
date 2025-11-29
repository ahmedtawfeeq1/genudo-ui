
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from "@/lib/mock-db";
import MarkdownMessage from './MarkdownMessage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  status?: string;
  error?: boolean;
}

interface ChatMessagesProps {
  messages: ChatMessage[]; // These are optimistic messages from parent
  isProcessing: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sessionId?: string | null;
  onMessagesLoaded?: (messages: ChatMessage[]) => void;
  onUserMessagesDetected?: (hasUserMessages: boolean) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages: optimisticMessages,
  isProcessing,
  messagesEndRef,
  sessionId,
  onMessagesLoaded,
  onUserMessagesDetected
}) => {
  const { user } = useAuth();
  const [databaseMessages, setDatabaseMessages] = useState<ChatMessage[]>([]);

  // Welcome message - shown when no session OR when session has no user messages
  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm **Nase7**, your AI pipeline architect. I can help you create and modify sales pipelines using natural language.

Try saying things like the **quick actions below** to get started.

**What would you like to build today?**`,
    timestamp: new Date(),
  };

  // Class: ChatMessageLoader
  // Purpose: Provide static message loading for UI-only mode.
  // TODO: Integrate with backend chat history endpoint.
  const loadDatabaseMessages = useCallback(async (currentSessionId: string) => {
    if (!user || !currentSessionId) return;
    try {
      console.log('📥 [Static] Loading messages for session:', currentSessionId);
      await new Promise(res => setTimeout(res, 150));
      const formattedMessages: ChatMessage[] = [];
      setDatabaseMessages(formattedMessages);
      const hasUserMessages = formattedMessages.some(msg => msg.role === 'user');
      if (onUserMessagesDetected) onUserMessagesDetected(hasUserMessages);
      if (onMessagesLoaded) onMessagesLoaded(formattedMessages);
    } catch (error) {
      console.error('Error loading static messages:', error);
      setDatabaseMessages([]);
      if (onUserMessagesDetected) onUserMessagesDetected(false);
    }
  }, [user, onMessagesLoaded, onUserMessagesDetected]);

  // Load messages when session changes and clear when no session
  useEffect(() => {
    if (sessionId) {
      loadDatabaseMessages(sessionId);
    } else {
      console.log('📥 No session ID, clearing database messages');
      setDatabaseMessages([]);
      if (onUserMessagesDetected) {
        onUserMessagesDetected(false);
      }
    }
  }, [sessionId, loadDatabaseMessages, onUserMessagesDetected]);

  // Class: ChatRealtimeSimulator
  // Purpose: Simulate realtime assistant updates for UI-only mode.
  // TODO: Replace with backend realtime service.
  useEffect(() => {
    if (!user || !sessionId) return;
    console.log('🔄 [Static] Starting realtime simulation for session:', sessionId);
    const interval = setInterval(() => {
      const formattedMessage: ChatMessage = {
        id: `rt-${Date.now()}`,
        role: 'assistant',
        content: 'Assistant update (static simulation)',
        timestamp: new Date(),
        status: 'info',
      };
      setDatabaseMessages(prev => [...prev, formattedMessage]);
      const hasUserMessages = [...databaseMessages, formattedMessage].some(m => m.role === 'user');
      if (onUserMessagesDetected) onUserMessagesDetected(hasUserMessages);
    }, 12000);
    return () => {
      console.log('🔌 [Static] Stopping realtime simulation for session:', sessionId);
      clearInterval(interval);
    };
  }, [user, sessionId, onUserMessagesDetected, databaseMessages]);

  // FIXED: Improved display logic - prioritize database messages and only show relevant optimistic messages
  const displayMessages = useMemo(() => {
    // If no session is selected, show welcome message only
    if (!sessionId) {
      return [welcomeMessage];
    }

    // Start with database messages as the foundation
    let allMessages = [...databaseMessages];

    // Only add optimistic messages that aren't already in database
    const uniqueOptimisticMessages = optimisticMessages.filter(optMsg => 
      optMsg.id.startsWith('temp-') && 
      !databaseMessages.some(dbMsg => 
        dbMsg.role === optMsg.role && 
        dbMsg.content === optMsg.content &&
        Math.abs(dbMsg.timestamp.getTime() - optMsg.timestamp.getTime()) < 10000 // 10 second window
      )
    );

    allMessages = [...allMessages, ...uniqueOptimisticMessages];

    // If we have no messages at all (database + optimistic), show welcome
    if (allMessages.length === 0) {
      return [welcomeMessage];
    }

    // Sort all messages by timestamp
    const sortedMessages = allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    console.log('📝 Final display messages:', {
      database: databaseMessages.length,
      optimistic: uniqueOptimisticMessages.length,
      total: sortedMessages.length
    });
    
    return sortedMessages;
  }, [sessionId, databaseMessages, optimisticMessages, welcomeMessage]);

  // Auto-scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [displayMessages, messagesEndRef]);

  // Check for user messages when messages list changes
  useEffect(() => {
    if (sessionId && onUserMessagesDetected) {
      const hasUserMessages = databaseMessages.some(msg => msg.role === 'user') || 
                             optimisticMessages.some(msg => msg.role === 'user');
      onUserMessagesDetected(hasUserMessages);
    }
  }, [databaseMessages, optimisticMessages, sessionId, onUserMessagesDetected]);

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : message.error
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                
                <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
                  <span>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.id.startsWith('temp-') && (
                    <span className="text-xs opacity-50">•</span>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* FIXED: Only show one processing message - the dynamic one */}
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Nase7 is processing your request...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;

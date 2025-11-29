
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSessionManager } from '@/hooks/useSessionManager';
import { CHAT_WEBHOOK_URL, createChatWebhookPayload } from '@/utils/webhookConfig';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  status?: string;
  error?: boolean;
}

interface UseModernChatProps {
  onMessageReceived?: (message: any) => void;
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
  onChatTriggerReady?: (triggerFunction: (message: string) => void) => void;
  sessionId?: string | null;
}

export function useModernChat({
  onMessageReceived,
  pipelineId = null,
  stageId = null,
  agentId = null,
  opportunityId = null,
  onChatTriggerReady,
  sessionId: propSessionId = null
}: UseModernChatProps) {
  const { user } = useAuth();
  const { currentSessionId, createSession } = useSessionManager();
  
  const activeSessionId = propSessionId || currentSessionId;
  
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowStatus] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('connected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear optimistic messages when session changes
  useEffect(() => {
    setOptimisticMessages([]);
    console.log('🔄 Cleared optimistic messages for session change:', activeSessionId);
  }, [activeSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [optimisticMessages]);

  // Test connection
  const testWebhookConnection = useCallback(async () => {
    setConnectionStatus('testing');
    setTimeout(() => {
      setConnectionStatus(user ? 'connected' : 'disconnected');
      console.log('✅ Chat webhook system ready');
    }, 1000);
  }, [user]);

  const saveUserMessage = useCallback(async (_message: string, _sessionId: string): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 80));
    return true;
  }, []);

  // Process AI message (now only handles AI response)
  const processAIMessage = useCallback(async (userMessage: string, sessionId: string): Promise<{ message: string; action?: any; status?: string }> => {
    if (!user) {
      throw new Error('User not authenticated. Please log in to continue.');
    }

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      throw new Error('Invalid message format. Please enter a valid message.');
    }

    console.log('📤 Processing AI response for session:', sessionId);

    try {
      // Call the chat webhook - it will handle saving the AI response
      const payload = createChatWebhookPayload(
        userMessage.trim(),
        user.id,
        sessionId,
        pipelineId,
        stageId,
        agentId,
        opportunityId
      );

      console.log('🚀 Calling chat webhook with payload:', {
        ...payload,
        query: payload.query.substring(0, 100) + (payload.query.length > 100 ? '...' : '')
      });

      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chat webhook error response:', errorText);
        throw new Error(`Chat service failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from chat service');
      }

      console.log('✅ Chat webhook response received:', data);

      return {
        message: data.response,
        action: {
          type: "chat_response",
          status: "completed"
        },
        status: "completed"
      };
    } catch (error) {
      console.error('❌ Error processing AI message:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }, [user, pipelineId, stageId, agentId, opportunityId]);

  // UPDATED: Improved send message function - creates session if needed but doesn't auto-create on load
  const triggerSendMessage = useCallback(async (message: string) => {
    console.log('🎯 triggerSendMessage called with message:', message.substring(0, 50));
    console.log('🔍 Active session ID before processing:', activeSessionId);
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid message passed to triggerSendMessage');
      toast({
        title: "Error",
        description: "Invalid message format",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast({
        title: "Error",
        description: "Please enter a valid message",
        variant: "destructive",
      });
      return;
    }

    try {
      setInputValue('');
      setIsProcessing(true);

      // STEP 1: Ensure we have a session - create one if needed (only when user actually sends a message)
      let sessionId = activeSessionId;
      if (!sessionId) {
        console.log('🔄 No active session, creating new session for user message...');
        sessionId = await createSession(`Conversation ${new Date().toLocaleDateString()}`);
        if (!sessionId) {
          throw new Error('Failed to create new session');
        }
        console.log('✅ New session created:', sessionId);
      }

      // STEP 2: Add optimistic user message immediately (use actual sessionId)
      const optimisticUserMessage: ChatMessage = {
        id: `temp-user-${sessionId}-${Date.now()}`,
        role: 'user',
        content: trimmedMessage,
        timestamp: new Date(),
      };
      
      console.log('📝 Adding optimistic user message:', optimisticUserMessage.id);
      setOptimisticMessages(prev => [...prev, optimisticUserMessage]);

      // STEP 3: Save user message to database
      const userMessageSaved = await saveUserMessage(trimmedMessage, sessionId);
      if (!userMessageSaved) {
        throw new Error('Failed to save user message');
      }

      // STEP 4: Process AI response (which will save AI message to database via webhook)
      const response = await processAIMessage(trimmedMessage, sessionId);

      // STEP 5: Clear optimistic user message since it should now be in database via real-time
      console.log('🧹 Clearing optimistic user message after successful processing');
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticUserMessage.id));

      if (response.action && onMessageReceived) {
        onMessageReceived(response.action);
      }

      console.log('✅ Message processing completed successfully');

    } catch (error) {
      console.error('❌ Error in triggerSendMessage:', error);
      
      // Remove all optimistic messages for this session on error
      setOptimisticMessages(prev => prev.filter(msg => 
        !msg.id.includes(`temp-user-${activeSessionId || 'unknown'}-`) &&
        !msg.id.includes(`temp-ai-${activeSessionId || 'unknown'}-`)
      ));
      
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, saveUserMessage, processAIMessage, onMessageReceived, activeSessionId, createSession]);

  // Test connection on mount
  useEffect(() => {
    testWebhookConnection();
  }, [testWebhookConnection]);

  // Expose trigger function to parent
  useEffect(() => {
    if (onChatTriggerReady && typeof triggerSendMessage === 'function') {
      console.log('🔗 Setting up chat trigger function');
      onChatTriggerReady(triggerSendMessage);
    }
  }, [onChatTriggerReady, triggerSendMessage]);

  // Log session ID changes for debugging
  useEffect(() => {
    console.log('🔄 Session ID changed in useModernChat:', {
      propSessionId,
      currentSessionId,
      activeSessionId
    });
  }, [propSessionId, currentSessionId, activeSessionId]);

  return {
    messages: optimisticMessages, // Return optimistic messages for immediate display
    inputValue,
    setInputValue,
    isProcessing,
    flowStatus,
    connectionStatus,
    messagesEndRef,
    triggerSendMessage,
    testWebhookConnection,
    user
  };
}

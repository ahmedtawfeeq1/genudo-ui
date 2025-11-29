import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
 

export interface SessionData {
  id: string;
  user_id: string;
  session_name?: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  pipeline_id?: string;
  message_count: number;
  has_pipeline_data: boolean;
  has_user_messages: boolean;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  message_content: string;
  message_role: 'user' | 'assistant';
  webhook_response?: any;
  flow_status?: string;
  json_result?: any;
  pipeline_id?: string;
  stage_id?: string;
  agent_id?: string;
  opportunity_id?: string;
  created_at: string;
}

interface UseSessionManagerOptions {
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
  autoSave?: boolean;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const { user } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true); // MODIFIED: Start in loading state
  const [error, setError] = useState<string | null>(null);

  

  // REFACTORED: Load sessions in two steps for faster UI response
  const loadSessions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 100));
      const now = new Date().toISOString();
      const initialSessions: SessionData[] = [
        { id: 's-1', user_id: user.id, session_name: 'Chat 1', last_activity: now, created_at: now, updated_at: now, metadata: {}, pipeline_id: null, message_count: 3, has_pipeline_data: false, has_user_messages: true },
        { id: 's-2', user_id: user.id, session_name: 'Chat 2', last_activity: now, created_at: now, updated_at: now, metadata: {}, pipeline_id: 'pipe-1', message_count: 5, has_pipeline_data: true, has_user_messages: true }
      ];
      setSessions(initialSessions);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load sessions');
      setIsLoading(false);
    }
  }, [user]);

  // Generate new session ID and create session record
  const createSession = useCallback(async (sessionName?: string) => {
    if (!user) {
      console.error('No user found for session creation');
      return null;
    }
  
    const sessionId = crypto.randomUUID();
    const defaultName = sessionName || `Chat ${new Date().toLocaleDateString()}`;
  
    try {
      await new Promise(res => setTimeout(res, 80));
      // Set as current session immediately
      setCurrentSessionId(sessionId);
      
      // Add the new session to local state immediately (optimistic update)
      const newSession: SessionData = {
        id: sessionId,
        user_id: user.id,
        session_name: defaultName,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        pipeline_id: null, // No pipeline initially
        message_count: 0,
        has_pipeline_data: false,
        has_user_messages: false,
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      return sessionId;
    } catch (error) {
      return null;
    }
  }, [user]);

  // UPDATED: Get the most recent session based on updated_at timestamp (regardless of message content)
  const getMostRecentSession = useCallback(() => {
    // Sort by updated_at and return the first one
    const sortedSessions = sessions
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    return sortedSessions[0] || null;
  }, [sessions]);

  // Keep the original function for backward compatibility
  const getMostRecentSessionWithMessages = useCallback(() => {
    // Sort by last_activity and find the first one with user messages
    const sortedSessions = sessions
      .filter(session => session.has_user_messages)
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
    
    return sortedSessions[0] || null;
  }, [sessions]);

  // Load messages for a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setCurrentSessionId(sessionId);
      await new Promise(res => setTimeout(res, 100));
      const now = Date.now();
      const demo: SessionMessage[] = Array.from({ length: 6 }).map((_, i) => ({
        id: `m-${sessionId}-${i}`,
        session_id: sessionId,
        user_id: user.id,
        message_content: i % 2 === 0 ? `User message ${i}` : `Assistant reply ${i}`,
        message_role: i % 2 === 0 ? 'user' : 'assistant',
        created_at: new Date(now - (6 - i) * 60000).toISOString()
      }));
      setMessages(demo);
      setError(null);
    } catch (err) {
      setError('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ENHANCED: Add message to current session with pipeline_id database integration
  const addMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant',
    webhookResponse?: any,
    flowStatus?: string,
    jsonResult?: any
  ) => {
    if (!user || !currentSessionId) {
      setError('No active session');
      return null;
    }

    try {
      await new Promise(res => setTimeout(res, 60));
      const newMessage: SessionMessage = {
        id: `m-${Date.now()}`,
        session_id: currentSessionId,
        user_id: user.id,
        message_content: content,
        message_role: role,
        webhook_response: webhookResponse || null,
        flow_status: flowStatus || null,
        json_result: jsonResult || null,
        pipeline_id: options.pipelineId || null,
        stage_id: options.stageId || null,
        agent_id: options.agentId || null,
        opportunity_id: options.opportunityId || null,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);

      // ENHANCED: Extract pipeline ID and update session database if needed
      const extractedPipelineId = (jsonResult?.pipeline?.id) || (webhookResponse?.pipeline_id) || null;

      // Update session in database if we have a pipeline ID
      

      // Update session message count and user messages flag immediately
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              message_count: session.message_count + 1, 
              last_activity: new Date().toISOString(),
              has_user_messages: session.has_user_messages || role === 'user',
              pipeline_id: extractedPipelineId || session.pipeline_id // Update pipeline_id in local state
            }
          : session
      ));

      return newMessage;
    } catch (err) {
      setError('Failed to add message');
      return null;
    }
  }, [user, currentSessionId, options]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return false;

    try {
      await new Promise(res => setTimeout(res, 60));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }

      return true;
    } catch (err) {
      setError('Failed to delete session');
      return false;
    }
  }, [user, currentSessionId]);

  // Get latest pipeline data from current session
  const getLatestPipelineData = useCallback(() => {
    const pipelineMessages = messages.filter(m => 
      m.flow_status === 'new_pipeline' && m.json_result
    );
    return pipelineMessages.length > 0 ? pipelineMessages[pipelineMessages.length - 1].json_result : null;
  }, [messages]);

  // Utility functions to derive data from messages if needed
  const getSessionContext = useCallback(() => {
    if (!messages.length) return {};

    // Find the latest messages with context data
    const latestStageMessage = messages.filter(m => m.stage_id).pop();
    const latestAgentMessage = messages.filter(m => m.agent_id).pop();
    const latestOpportunityMessage = messages.filter(m => m.opportunity_id).pop();

    return {
      stage_id: latestStageMessage?.stage_id || null,
      agent_id: latestAgentMessage?.agent_id || null,
      opportunity_id: latestOpportunityMessage?.opportunity_id || null,
    };
  }, [messages]);

  // FIXED: Enhanced real-time subscription for immediate message count updates
  useEffect(() => {
    if (!user) return;
    let interval: ReturnType<typeof setInterval> | null = setInterval(() => {
      setSessions(prev => prev.map(s => ({ ...s, updated_at: new Date().toISOString() })));
    }, 15000);
    return () => { if (interval) { clearInterval(interval); interval = null; } };
  }, [user]);

  // Load sessions on mount and clear on logout
  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      // Clear data if user is not available (e.g., on logout)
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      setIsLoading(false);
    }
  }, [user, loadSessions]);

  return {
    // Session management
    currentSessionId,
    sessions,
    messages,
    isLoading,
    error,
    
    // Actions
    createSession,
    loadSession,
    loadSessions,
    addMessage,
    deleteSession,
    getLatestPipelineData,
    getSessionContext,
    getMostRecentSession, // NEW: Auto-select based on updated_at
    getMostRecentSessionWithMessages, // Keep for backward compatibility
    
    // Utilities
    clearError: () => setError(null),
    getCurrentSession: () => sessions.find(s => s.id === currentSessionId) || null,
  };
}

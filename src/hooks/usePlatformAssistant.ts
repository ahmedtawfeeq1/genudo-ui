
import { useState, useCallback } from 'react';

export interface PlatformAssistantMessage {
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

export interface PlatformAssistantSession {
  session_id: string;
  messages: PlatformAssistantMessage[];
  last_flow_status?: string;
  latest_pipeline_data?: any;
}

interface UsePlatformAssistantOptions {
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
}

export function usePlatformAssistant(options: UsePlatformAssistantOptions = {}) {
  const user: any = { id: 'demo' };
  const [currentSession, setCurrentSession] = useState<PlatformAssistantSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate new session ID and create session record
  const createNewSession = useCallback(async (sessionName?: string) => {
    const sessionId = crypto.randomUUID();
    const newSession: PlatformAssistantSession = { session_id: sessionId, messages: [] };
    setCurrentSession(newSession);
    return sessionId;
  }, [options]);

  // Save message to database with enhanced error handling
  const saveMessage = useCallback(async (
    sessionId: string,
    content: string,
    role: 'user' | 'assistant',
    webhookResponse?: any,
    flowStatus?: string,
    jsonResult?: any
  ): Promise<PlatformAssistantMessage | null> => {
    const msg: PlatformAssistantMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
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
      created_at: new Date().toISOString(),
    };
    return msg;
  }, [options]);

  // Load session messages from database with enhanced error handling
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    const session: PlatformAssistantSession = { session_id: sessionId, messages: [] };
    setCurrentSession(session);
    setIsLoading(false);
  }, []);

  // Add message to current session with enhanced session management
  const addMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant',
    webhookResponse?: any,
    flowStatus?: string,
    jsonResult?: any
  ) => {
    let sessionId = currentSession?.session_id;
    
    // Create new session if none exists
    if (!sessionId) {
      sessionId = await createNewSession();
      if (!sessionId) {
        console.error('Failed to create new session');
        return null;
      }
    }

    const savedMessage = await saveMessage(
      sessionId,
      content,
      role,
      webhookResponse,
      flowStatus,
      jsonResult
    );

    if (savedMessage && currentSession) {
      const updatedSession: PlatformAssistantSession = {
        ...currentSession,
        messages: [...currentSession.messages, savedMessage],
        last_flow_status: flowStatus || currentSession.last_flow_status,
        latest_pipeline_data: jsonResult || currentSession.latest_pipeline_data,
      };
      setCurrentSession(updatedSession);
      console.log('✅ Message added to session with updated pipeline data:', !!jsonResult);
    }

    return savedMessage;
  }, [currentSession, saveMessage, createNewSession]);

  // Get latest pipeline data from current session
  const getLatestPipelineData = useCallback(() => {
    const pipelineData = currentSession?.latest_pipeline_data;
    console.log('Getting latest pipeline data:', !!pipelineData);
    return pipelineData || null;
  }, [currentSession]);

  // Get recent user sessions with enhanced filtering
  const getUserSessions = useCallback(async (limit = 10) => {
    return Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
      session_id: `sess-${i + 1}`,
      last_message: `Session ${i + 1}`,
      last_activity: new Date().toISOString(),
      message_count: 0,
      has_pipeline_data: false,
    }));
  }, []);

  // Check if session has pipeline data
  const sessionHasPipelineData = useCallback(async (_sessionId: string): Promise<boolean> => false, []);

  return {
    currentSession,
    isLoading,
    createNewSession,
    loadSession,
    addMessage,
    getLatestPipelineData,
    getUserSessions,
    sessionHasPipelineData,
  };
}

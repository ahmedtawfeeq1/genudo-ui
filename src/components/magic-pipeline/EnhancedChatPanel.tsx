import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Lightbulb, Loader2, Sparkles, MessageSquare, Zap, CheckCircle, AlertCircle, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EnhancedChatPanelProps {
  onPipelineDataReceived?: (data: any) => void;
  pipelineId?: string | null;
  stageId?: string | null;
  agentId?: string | null;
  opportunityId?: string | null;
}

const EnhancedChatPanel: React.FC<EnhancedChatPanelProps> = ({
  onPipelineDataReceived,
  pipelineId = null,
  stageId = null,
  agentId = null,
  opportunityId = null
}) => {
  const { user } = useAuth();
  const {
    currentSessionId,
    sessions,
    messages,
    isLoading: sessionLoading,
    createSession,
    loadSession,
    addMessage,
    getLatestPipelineData
  } = useSessionManager({
    pipelineId,
    stageId,
    agentId,
    opportunityId
  });

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to webhook API
  const sendToWebhook = async (query: string, metadata: any, sessionId: string) => {
    const webhookUrl = 'https://automation.loop-x.co/webhook-test/8bd03155-34da-4d38-904f-76d9606645b5';

    const payload = {
      query,
      metadata: {
        ...metadata,
        session_id: sessionId
      },
      session_id: sessionId
    };

    console.log('🚀 Sending webhook with session ID:', sessionId);
    console.log('📤 Webhook payload:', payload);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let processedData;

      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        processedData = data[0].output;
      } else {
        processedData = data;
      }

      if (!processedData.response) {
        throw new Error('Invalid response structure from webhook - missing response field');
      }

      return processedData;
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  };

  // Process message and save to database
  const processMessage = useCallback(async (userMessage: string) => {
    if (!user || !userMessage.trim()) return;

    setIsProcessing(true);
    
    try {
      // Ensure we have a session before processing
      let sessionId = currentSessionId;
      if (!sessionId) {
        console.log('🔄 Creating new session...');
        sessionId = await createSession('Magic Pipeline Session');
        if (!sessionId) {
          throw new Error('Failed to create session');
        }
        console.log('✅ Session created:', sessionId);
      }

      // Save user message
      await addMessage(userMessage.trim(), 'user');

      // Prepare metadata
      const metadata = {
        user_id: user.id,
        pipeline_id: pipelineId || null,
        stage_id: stageId || null,
        agent_id: agentId || null,
        opportunity_id: opportunityId || null
      };

      // Send to webhook with the confirmed session ID
      const webhookResponse = await sendToWebhook(userMessage.trim(), metadata, sessionId);

      // Save assistant response with webhook data
      await addMessage(
        webhookResponse.response || 'Response received', 
        'assistant', 
        webhookResponse, 
        webhookResponse.flow_status || null, 
        webhookResponse.json_result || null
      );

      // Handle pipeline data if received
      if (webhookResponse.flow_status === 'new_pipeline' && webhookResponse.json_result) {
        if (onPipelineDataReceived) {
          onPipelineDataReceived(webhookResponse.json_result);
        }
        toast({
          title: "Pipeline Created!",
          description: "New pipeline has been generated successfully."
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await addMessage(
        `I apologize, but I encountered an issue: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`, 
        'assistant'
      );
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, currentSessionId, createSession, addMessage, pipelineId, stageId, agentId, opportunityId, onPipelineDataReceived]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    const message = inputValue.trim();
    setInputValue('');
    await processMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewSession = async () => {
    await createSession('Magic Pipeline Session');
    setShowSessions(false);
  };

  const handleLoadSession = async (sessionId: string) => {
    await loadSession(sessionId);
    setShowSessions(false);

    // Check if this session has pipeline data and notify parent
    const pipelineData = getLatestPipelineData();
    if (pipelineData && onPipelineDataReceived) {
      onPipelineDataReceived(pipelineData);
    }
  };

  const quickActions = [
    "Create a modern SaaS sales pipeline",
    "Build a e-commerce customer journey", 
    "Design a B2B lead nurturing pipeline",
    "Generate a service business pipeline"
  ];

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-white/90 backdrop-blur-md">
      {/* Header */}
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center relative">
              <Bot className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">Nase7 AI Assistant</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online & Ready</span>
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Session History */}
        {showSessions && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-medium text-gray-700 mb-2">Recent Sessions</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sessions.slice(0, 5).map(session => (
                <button
                  key={session.id}
                  onClick={() => handleLoadSession(session.id)}
                  className="w-full text-left p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs text-gray-600 truncate">
                    {session.session_name || `Session ${session.id.slice(0, 8)}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(session.last_activity).toLocaleDateString()}
                    {session.has_pipeline_data && (
                      <Badge variant="secondary" className="ml-2 text-xs">Pipeline</Badge>
                    )}
                  </div>
                </button>
              ))}
              {sessions.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  No previous sessions
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {(!currentSessionId || messages.length === 0) && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-xl px-4 py-3 max-w-[85%]">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    Hello! I'm Nase7, your AI pipeline architect. I can help you create and modify sales pipelines using natural language.

Try saying things like:
• "Create a SaaS sales pipeline"
• "Add a qualification stage after lead generation"
• "Show me pipeline templates"
• "Optimize my current pipeline"

What would you like to build today?
                  </div>
                </div>
              </div>
            )}

            {messages.map(message => (
              <div key={message.id} className={`flex gap-3 ${message.message_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.message_role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  message.message_role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.message_content}
                  </div>
                  
                  {message.flow_status && (
                    <div className="mt-3 pt-3 border-t border-gray-200/50">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-gray-600">
                          Status: {message.flow_status}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.message_role === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
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
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {(!currentSessionId || messages.length === 0) && (
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
            </div>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(action)}
                  className="w-full text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors border border-gray-200"
                  disabled={isProcessing}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to do with your pipeline..."
              className="flex-1 text-sm"
              disabled={isProcessing || !user}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing || !user}
              size="sm"
              className="px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>AI-powered pipeline builder</span>
            </div>
            <span>Press Enter to send</span>
          </div>
          
          {!user && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>Please log in to use the AI assistant</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatPanel;

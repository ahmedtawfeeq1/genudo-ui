import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Eye, 
  Rocket, 
  ArrowRight, 
  ExternalLink,
  CheckCircle,
  Star,
  Zap,
  X,
  Wand
} from 'lucide-react';
import PipelineFlowRenderer from '@/components/magic-pipeline/PipelineFlowRenderer';
import EmptyPipelineState from '@/components/magic-pipeline/EmptyPipelineState';
import StageDetailsModal from '@/components/magic-pipeline/StageDetailsModal';
import AgentDetailsModal from '@/components/magic-pipeline/AgentDetailsModal';
import MagicPipelineChatPanels from '@/components/magic-pipeline/MagicPipelineChatPanels';
import MagicBuildButton from '@/components/magic-pipeline/MagicBuildButton';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGeneratedPipelines } from '@/hooks/useGeneratedPipelines';
import { toast } from '@/hooks/use-toast';
import { WebhookAgentData, WebhookStageData } from '@/utils/pipelineSchemaConverter';

const MagicPipelineContent = () => {
  const navigate = useNavigate();
  
  // Success overlay state
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successPipelineId, setSuccessPipelineId] = useState<string | null>(null);
  const [builtPipelineId, setBuiltPipelineId] = useState<string | null>(null);
  const [overlayParticles, setOverlayParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isBuildingInProgress, setIsBuildingInProgress] = useState(false);

  // Modal states
  const [selectedAgent, setSelectedAgent] = useState<WebhookAgentData | null>(null);
  const [selectedAgentColor, setSelectedAgentColor] = useState<string>('from-blue-400 to-blue-500');
  const [selectedStage, setSelectedStage] = useState<WebhookStageData | null>(null);
  
  // UI states
  const [showChat, setShowChat] = useState(true);
  const [showConversations, setShowConversations] = useState(false);
  const [conversationsCollapsed, setConversationsCollapsed] = useState(true);

  // REMOVED: The complex state variables for initialization tracking.
  // const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  // const [isInitializing, setIsInitializing] = useState(false);
  // const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  const {
    currentSessionId,
    sessions,
    isLoading: isLoadingSessions,
    createSession,
    loadSession,
    deleteSession,
    getMostRecentSession,
    loadSessions
  } = useSessionManager({
    autoSave: true
  });

  const {
    getLatestPipelineData,
    getLatestPipeline
  } = useGeneratedPipelines({
    sessionId: currentSessionId,
    autoRefresh: true,
    onPipelineUpdate: pipeline => {
      console.log('🔄 Pipeline updated in UI:', pipeline);
    }
  });

  const currentPipelineData = getLatestPipelineData();
  const currentPipeline = getLatestPipeline();

  // ENHANCED: Better debug logs with more context
  console.log('🔍 Debug State Summary:', {
    currentSessionId,
    sessionsCount: sessions.length,
    sessionsLoaded: sessions.map(s => ({ id: s.id.slice(0, 8), hasMessages: s.has_user_messages, pipelineId: s.pipeline_id })),
    builtPipelineId: builtPipelineId?.slice(0, 8),
    isLoadingSessions,
    currentPipelineDataExists: !!currentPipelineData,
    currentPipelineExists: !!currentPipeline
  });

  // Create celebration particles for overlay
  const createOverlayParticles = useCallback(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setOverlayParticles(newParticles);
  }, []);

  // Handle building state changes
  const handleBuildStateChange = useCallback((isBuilding: boolean) => {
    setIsBuildingInProgress(isBuilding);
  }, []);

  // Handle successful pipeline creation
  const handlePipelineSuccess = useCallback((pipelineId: string) => {
    console.log('🎉 Pipeline created successfully with ID:', pipelineId);
    setSuccessPipelineId(pipelineId);
    setBuiltPipelineId(pipelineId);
    setIsBuildingInProgress(false);
    setShowSuccessOverlay(true);
    createOverlayParticles();
  }, [createOverlayParticles]);

  // Handle navigation to built pipeline
  const handleViewExistingPipeline = useCallback(() => {
    if (builtPipelineId) {
      navigate(`/pipelines/${builtPipelineId}/stages`);
      toast({
        title: "Opening Your Pipeline",
        description: "Navigating to your sales pipeline...",
      });
    }
  }, [builtPipelineId, navigate]);

  // Navigate to pipeline stages
  const handleNavigateToPipeline = useCallback(() => {
    if (successPipelineId) {
      setShowSuccessOverlay(false);
      setOverlayParticles([]);
      navigate(`/pipelines/${successPipelineId}/stages`);
      
      toast({
        title: "Opening Your New Pipeline",
        description: "Navigating to your new sales pipeline...",
      });
    }
  }, [successPipelineId, navigate]);

  // Refresh conversation to load pipeline_id from database
  const refreshConversation = useCallback(async () => {
    console.log('🔄 Refreshing conversation to load pipeline_id from database...');
    try {
      await loadSessions();
      console.log('✅ Conversation refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh conversation:', error);
    }
  }, [loadSessions]);

  // Close success overlay with refresh and reset
  const handleCloseSuccessOverlay = useCallback(async () => {
    setShowSuccessOverlay(false);
    setOverlayParticles([]);
    setIsBuildingInProgress(false);
    
    if (successPipelineId) {
      setBuiltPipelineId(successPipelineId);
    }

    await refreshConversation();
    
    if (currentSessionId) {
      console.log('🔄 Reloading current session to refresh view:', currentSessionId);
      await loadSession(currentSessionId);
    }
  }, [successPipelineId, refreshConversation, currentSessionId, loadSession]);

  // Handle "Continue Building"
  const handleContinueBuilding = useCallback(async () => {
    setShowSuccessOverlay(false);
    setOverlayParticles([]);
    setIsBuildingInProgress(false);
    
    if (successPipelineId) {
      setBuiltPipelineId(successPipelineId);
    }
    
    await refreshConversation();
    
    if (currentSessionId) {
      console.log('🔄 Reloading current session after continue building:', currentSessionId);
      await loadSession(currentSessionId);
    }
    
    toast({
      title: "Continue Building",
      description: "You can continue chatting with AI to refine your pipeline.",
    });
  }, [successPipelineId, refreshConversation, currentSessionId, loadSession]);

  // Chat and session handlers
  const handleMessageReceived = useCallback((action: any) => {
    console.log('📥 Received action from chat (legacy):', action);
    if (action.type === 'update_pipeline' && action.json_result) {
      console.log('🔄 Legacy pipeline update received');
    }
  }, []);

  const handleNodeClick = useCallback((nodeId: string, nodeType: string, nodeData: any) => {
    console.log('🎯 Node clicked:', { nodeId, nodeType, nodeData });

    if (nodeType === 'agent' && nodeData) {
      setSelectedAgent(nodeData as WebhookAgentData);
      const agentColor = nodeData.color || 'from-blue-400 to-blue-500';
      setSelectedAgentColor(agentColor);
      setSelectedStage(null);
    } else if (nodeType === 'stage' && nodeData) {
      setSelectedStage(nodeData as WebhookStageData);
      setSelectedAgent(null);
    }
  }, []);

  const handleCloseAgentModal = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleCloseStageModal = useCallback(() => {
    setSelectedStage(null);
  }, []);

  const handleSessionSelect = useCallback(async (sessionId: string) => {
    console.log('🔄 Loading conversation:', sessionId);
    await loadSession(sessionId);
    toast({
      title: "Conversation Loaded",
      description: "Conversation messages have been loaded successfully."
    });
  }, [loadSession]);

  const handleNewSession = useCallback(async () => {
    console.log('🆕 Creating new session...');
    const sessionName = `Conversation ${new Date().toLocaleDateString()}`;
    const sessionId = await createSession(sessionName);
    console.log('🆕 New conversation created:', sessionId);
    if (sessionId) {
      toast({
        title: "New Conversation Created",
        description: "A new AI conversation has been created successfully."
      });
    }
  }, [createSession]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    console.log('🗑️ Deleting session:', sessionId);
    const success = await deleteSession(sessionId);
    if (success) {
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been deleted successfully."
      });
    }
    return success;
  }, [deleteSession]);

  const handleSessionMessagesLoaded = useCallback((messages: any[]) => {
    console.log('📨 Conversation messages loaded in main:', messages.length);
  }, []);

  const handleToggleConversationsCollapse = useCallback(() => {
    setConversationsCollapsed(prev => !prev);
  }, []);

  const handleToggleChat = useCallback(() => {
    if (showChat) {
      setShowChat(false);
      setShowConversations(false);
    } else {
      setShowChat(true);
    }
  }, [showChat]);

  const handleToggleConversations = useCallback(() => {
    setShowConversations(prev => !prev);
  }, []);

  // REFACTORED: Consolidated and simplified session initialization logic.
  useEffect(() => {
    // Wait until sessions have finished loading from the database.
    // Also, do nothing if a session is already selected (e.g., by user action).
    if (isLoadingSessions || currentSessionId) {
      console.log('🔄 Session initialization deferred.', { isLoading: isLoadingSessions, hasSession: !!currentSessionId });
      return;
    }

    // This logic runs once, after the initial session load is complete.
    const mostRecentSession = getMostRecentSession();
    if (mostRecentSession) {
      // If sessions exist, load the most recently updated one.
      console.log(`✅ Sessions loaded. Auto-selecting most recent: ${mostRecentSession.id.slice(0, 8)}`);
      loadSession(mostRecentSession.id);
    } else if (sessions.length === 0) {
      // If no sessions exist, create a new one to start.
      console.log('🆕 No sessions found. Auto-creating a new conversation.');
      handleNewSession();
    }
  }, [isLoadingSessions, sessions, currentSessionId, getMostRecentSession, loadSession, handleNewSession]);

  // FIXED: Load pipeline ID from session database when session changes
  useEffect(() => {
    const loadSessionPipelineId = async () => {
      if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session?.pipeline_id) {
          setBuiltPipelineId(session.pipeline_id);
          console.log('✅ Restored pipeline ID from session:', session.pipeline_id.slice(0, 8));
        } else {
          setBuiltPipelineId(null);
          console.log('📝 No pipeline ID found for session:', currentSessionId.slice(0, 8));
        }
      }
      setIsBuildingInProgress(false);
    };
    
    loadSessionPipelineId();
  }, [currentSessionId, sessions]);

  // REMOVED: The old complex initialization and retry logic useEffect hooks have been deleted.

  return (
    <>
      <div className="flex h-screen max-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {/* Left Side Chat Panels */}
        <MagicPipelineChatPanels
          showConversations={showConversations}
          showChat={showChat}
          conversationsCollapsed={conversationsCollapsed}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          onToggleConversationsCollapse={handleToggleConversationsCollapse}
          onMessageReceived={handleMessageReceived}
          onSessionMessagesLoaded={handleSessionMessagesLoaded}
          pipelineId={currentPipelineData?.pipeline?.id || null}
          sessions={sessions}
          isLoadingSessions={isLoadingSessions}
          onDeleteSession={handleDeleteSession}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 shadow-sm flex-shrink-0 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-4 flex-1">
                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                  <div className="min-w-0">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">GenuDo Magic Pipeline</h1>
                    <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Event-driven AI pipeline architecture</p>
                  </div>
                </div>
                
                {currentPipelineData && (
                  <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      <Sparkles className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                      <span className="hidden sm:inline">AI Generated</span>
                      <span className="sm:hidden">AI</span>
                    </Badge>
                    {currentPipeline && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                        {currentPipeline.flow_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {currentPipelineData.stages?.length || 0} Stages
                    </Badge>
                    <Badge variant="outline" className="text-xs hidden lg:inline-flex">
                      {currentPipelineData.agents?.length || 0} Agents
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleConversations}
                  className="hidden md:flex"
                >
                  <MessageSquare className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">
                    {showConversations ? 'Hide Conversations' : 'Show Conversations'}
                  </span>
                  <span className="lg:hidden">Conv</span>
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleToggleChat}>
                  <MessageSquare className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">
                    {showChat ? 'Hide AI Chat' : 'Show AI Chat'}
                  </span>
                  <span className="lg:hidden">Chat</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Flow Visualization Area */}
          <div className="flex-1 relative w-full min-h-0 overflow-hidden">
            {currentPipelineData ? (
              <PipelineFlowRenderer 
                pipelineData={currentPipelineData} 
                onNodeClick={handleNodeClick} 
              />
            ) : (
              <EmptyPipelineState />
            )}
          </div>

          {/* Pipeline Info Panel with Enhanced Magic Build */}
          <div className="bg-white border-t border-gray-200 p-3 lg:p-4 flex-shrink-0">
            {currentPipelineData && currentPipeline ? (
              <Card>
                <CardHeader className="pb-2 lg:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="truncate">
                        {currentPipelineData.pipeline?.pipeline_name || 'AI-Generated Pipeline'}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                        <span className="hidden sm:inline">Live Preview</span>
                        <span className="sm:hidden">Live</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs hidden lg:inline-flex">
                        Event-Driven
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-3 line-clamp-2">
                    {currentPipelineData.pipeline?.pipeline_description || currentPipeline.business_needs}
                  </p>
                  
                  <div className="flex items-center gap-2 lg:gap-4 text-xs text-gray-500 overflow-x-auto mb-3">
                    <span>Stages: {currentPipelineData.stages?.length || 0}</span>
                    <Separator orientation="vertical" className="h-3 lg:h-4" />
                    <span>Agents: {currentPipelineData.agents?.length || 0}</span>
                    <Separator orientation="vertical" className="h-3 lg:h-4" />
                    <span className="hidden sm:inline">Conversation: {currentSessionId?.slice(0, 8) || 'None'}</span>
                    <Separator orientation="vertical" className="h-3 lg:h-4 hidden sm:block" />
                    <span className="hidden md:inline">Status: {currentPipeline.flow_status}</span>
                    <Separator orientation="vertical" className="h-3 lg:h-4 hidden md:block" />
                    <span className="hidden lg:inline">Updated: {new Date(currentPipeline.updated_at).toLocaleDateString()}</span>
                  </div>

                  {/* Enhanced Magic Build Button */}
                  <div className="w-full flex justify-center">
                    <MagicBuildButton 
                      pipelineData={currentPipelineData}
                      currentSessionId={currentSessionId}
                      businessNeeds={currentPipeline.business_needs}
                      onSuccess={builtPipelineId ? handleViewExistingPipeline : handlePipelineSuccess}
                      hasBuiltPipeline={!!builtPipelineId}
                      onBuildStateChange={handleBuildStateChange}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2 lg:pb-3">
                  <CardTitle className="text-sm lg:text-base flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>Ready to Build Your Sales Pipeline?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs lg:text-sm text-gray-600 mb-3">
                    Chat with our AI assistant to create your custom sales pipeline, then use Magic Build to deploy it instantly.
                  </p>
                  
                  {/* Placeholder Magic Build Button for empty state */}
                  <div className="w-full flex justify-center">
                    <Button
                      disabled={true}
                      className="bg-gray-300 text-gray-500 cursor-not-allowed max-w-xs"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span className="text-sm">Chat First, Then Magic Build!</span>
                      <Wand className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Start chatting with the AI to create pipeline data, then this button will become active.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <StageDetailsModal 
          stageData={selectedStage} 
          onClose={handleCloseStageModal} 
        />

        <AgentDetailsModal 
          agentData={selectedAgent}
          agentColor={selectedAgentColor}
          onClose={handleCloseAgentModal} 
        />
      </div>

      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {overlayParticles.slice(0, 12).map((particle) => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full animate-particle-float-custom"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDelay: `${particle.id * 0.05}s`,
                  animationDuration: `${3 + (particle.id % 3)}s`
                }}
              />
            ))}
          </div>

          {/* Main success card */}
          <div className="relative mx-4 max-w-lg w-full">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseSuccessOverlay}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-0 shadow-2xl">
              {/* Animated background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shimmer-custom"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-pulse"></div>
              
              <CardContent className="relative z-10 p-8 text-center text-white space-y-6">
                {/* Celebration header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Rocket className="w-20 h-20 text-white animate-bounce" />
                      <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
                      </div>
                      <div className="absolute -bottom-2 -left-2">
                        <Star className="w-6 h-6 text-pink-300 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold animate-pulse">
                      🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-xl font-semibold text-green-100">
                      Your Sales Pipeline is Ready!
                    </p>
                  </div>
                </div>

                {/* Success details */}
                <div className="space-y-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-200" />
                      <span>AI Agents Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-200" />
                      <span>Automation Live</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-200" />
                      <span>Ready for Leads</span>
                    </div>
                  </div>
                  
                  <p className="text-green-100 text-sm">
                    Your intelligent sales pipeline is now deployed and ready to convert leads into customers automatically!
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleNavigateToPipeline}
                    className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    View Your Pipeline
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleContinueBuilding}
                    className="w-full text-white hover:bg-white/20 border border-white/30"
                  >
                    Continue Building
                  </Button>
                </div>

                {/* Pipeline ID display */}
                {successPipelineId && (
                  <div className="text-xs text-green-200 font-mono bg-black/20 rounded px-2 py-1">
                    Pipeline ID: {successPipelineId.slice(0, 8)}...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <style>{`
            @keyframes particle-float-custom {
              0%, 100% { 
                transform: translateY(0px) rotate(0deg) scale(1); 
                opacity: 0.7; 
              }
              25% { 
                transform: translateY(-20px) rotate(90deg) scale(1.2); 
                opacity: 1; 
              }
              50% { 
                transform: translateY(-40px) rotate(180deg) scale(0.8); 
                opacity: 0.5; 
              }
              75% { 
                transform: translateY(-20px) rotate(270deg) scale(1.1); 
                opacity: 0.8; 
              }
            }
            
            @keyframes shimmer-custom {
              0% { transform: translateX(-100%) skewX(-12deg); }
              100% { transform: translateX(200%) skewX(-12deg); }
            }
            
            .animate-particle-float-custom {
              animation: particle-float-custom ease-in-out infinite;
            }
            
            .animate-shimmer-custom {
              animation: shimmer-custom 3s infinite;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default MagicPipelineContent;

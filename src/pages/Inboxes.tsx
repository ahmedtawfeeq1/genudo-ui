import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ChevronLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import ModernLayout from "@/components/layout/ModernLayout";
import SEOHead from "@/components/common/SEOHead";
import { pageConfigs } from "@/utils/pageConfig";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import InboxFiltersDialog from "@/components/inbox/InboxFiltersDialog";
import ConversationList from "@/components/inbox/ConversationList";
import MessageThread from "@/components/inbox/MessageThread";
import ContactDetailsPanel from "@/components/inbox/ContactDetailsPanel";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import { Channel, SortOption, OpportunityStatus, Priority } from "@/components/inbox/InboxFilters";
import {
  useInboxConversations,
  useConversationMessages,
  useConversationNotes,
  useToggleAI,
  type InboxConversation
} from "@/hooks/useInboxData";
import { usePipelines } from "@/hooks/usePipelinesData";
import { formatInboxTimestamp } from "@/utils/date";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { db } from "@/lib/mock-db";
import { useAuth } from "@/contexts/AuthContext";

const buildStubConversation = (id: string): InboxConversation => ({
  id,
  connectorChatId: id,
  opportunityId: undefined,
  stageId: 's1',
  stageName: 'New',
  opportunityStatus: 'active',
  contact: { name: 'Unknown Contact', avatar: '', initials: 'U', type: 'messenger', contactInfo: '', email: '', phone: '' },
  lastMessage: 'No messages yet',
  time: formatInboxTimestamp(new Date().toISOString()),
  timestamp: new Date().toISOString(),
  messageCount: 0,
  unread: false,
  aiPaused: false,
  channelType: 'WHATSAPP',
  channelDisplayName: 'WhatsApp',
  pipelineId: 'pipe-1',
  pipelineName: 'Sales Pipeline',
  agentId: 'agent-001',
  cost: 0,
  status: 'open',
  priority: 'normal',
  lastActivity: new Date().toISOString(),
  avgResponseTime: '--',
  tags: []
});

const Inboxes = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const { pipelineId } = useParams<{ pipelineId?: string }>();
  const conversationIdFromQuery = searchParams.get("conversation");
  const [selectedConversation, setSelectedConversation] = useState<InboxConversation | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(pipelineId || null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(["all"]);
  const [aiStatus, setAiStatus] = useState<"all" | "paused" | "active">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsLogic, setTagsLogic] = useState<'AND' | 'OR'>('OR');
  const [selectedOpportunityStatuses, setSelectedOpportunityStatuses] = useState<OpportunityStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const conversationsPerPage = 8;

  // NEW: State for fetched conversation from query parameter
  const [fetchedConversation, setFetchedConversation] = useState<InboxConversation | null>(null);

  // State for available filter options from database
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [availableStages, setAvailableStages] = useState<Array<{ id: string, name: string }>>([]);

  const { user } = useAuth();

  // Set up real-time messaging for the selected conversation
  useRealtimeMessages(selectedConversation?.id);

  // Fetch pipelines with error handling
  const {
    data: pipelines = [],
    isLoading: pipelinesLoading,
    error: pipelinesError
  } = usePipelines();

  // Fetch conversations with filters and enhanced error handling
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
    isRefetching: conversationsRefetching
  } = useInboxConversations(selectedPipelineId || undefined, {
    searchText,
    dateRange,
    channels: selectedChannels,
    aiStatus,
    sortBy,
    tags: selectedTags,
    tagsLogic,
    opportunityStatuses: selectedOpportunityStatuses,
    priorities: selectedPriorities,
    stages: selectedStages
  }, {
    page: currentPage,
    limit: conversationsPerPage
  });

  const conversations = conversationsData?.conversations || [];
  const totalConversations = conversationsData?.totalCount || 0;

  // Fetch messages for selected conversation with error handling
  const {
    data: messageHistory = [],
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useConversationMessages(selectedConversation?.id || '');

  // Fetch and manage notes for selected conversation with error handling
  const {
    data: notes = [],
    addNote,
    isLoading: notesLoading,
    isAddingNote,
    updateNote,
    isUpdatingNote,
    deleteNote,
    isDeletingNote,
    error: notesError
  } = useConversationNotes(selectedConversation?.id || '');

  // AI toggle mutation
  const toggleAIMutation = useToggleAI();

  // Set pipeline from URL params on mount
  useEffect(() => {
    if (pipelineId && pipelineId !== selectedPipelineId) {
      setSelectedPipelineId(pipelineId);
    }
  }, [pipelineId, selectedPipelineId]);

  // Handle conversation routing from query parameter - IMPROVED VERSION
  useEffect(() => {
    if (conversationIdFromQuery) {
      // First check if conversation exists in current loaded conversations
      const targetConversation = conversations.find(conv => conv.id === conversationIdFromQuery);

      if (targetConversation) {
        // Found in current page
        setSelectedConversation(targetConversation);
        setFetchedConversation(null); // Clear any fetched conversation
        toast.success(`Opened conversation with ${targetConversation.contact.name}`);
      } else if (conversations.length > 0) {
        const stub = buildStubConversation(conversationIdFromQuery);
        setSelectedConversation(stub);
        setFetchedConversation(stub);
        toast.success(`Opened conversation with ${stub.contact.name}`);
      }
      // If conversations.length === 0, wait for conversations to load first
    } else {
      // Clear fetched conversation when no conversation ID in query
      setFetchedConversation(null);
    }
  }, [conversationIdFromQuery, conversations, selectedPipelineId]);

  // Load filter options from database (tags and channels)
  useEffect(() => {
    const tags = ['lead', 'faq', 'vip'];
    setAvailableTags(tags);
    const channelTypes: Channel[] = ['WHATSAPP', 'GMAIL', 'MESSENGER'];
    setAvailableChannels(channelTypes);
  }, []);

  // Load stages when pipeline changes
  useEffect(() => {
    if (!selectedPipelineId) {
      setAvailableStages([]);
      setSelectedStages([]);
      return;
    }
    setAvailableStages([
      { id: 's1', name: 'New' },
      { id: 's2', name: 'Qualified' }
    ]);
  }, [selectedPipelineId]);

  // Update URL to maintain conversation query param when pipeline changes
  useEffect(() => {
    const currentConversationParam = searchParams.get("conversation");
    if (currentConversationParam && selectedConversation?.id === currentConversationParam) {
      // Keep the conversation parameter when it matches current selection
      setSearchParams({ conversation: currentConversationParam });
    } else if (!currentConversationParam) {
      // Clear search params when no conversation is selected
      setSearchParams({});
    }
  }, [selectedConversation, searchParams, setSearchParams]);

  // Use conversations directly - don't manipulate sort order
  // If a conversation is accessed via URL but not in current page, it will be selected
  // but NOT added to the sidebar list (this maintains correct sort order)
  const displayConversations = useMemo(() => {
    return conversations;
  }, [conversations]);

  const resetFilters = () => {
    // Reset only filter dialog options, NOT pipeline, stages, or sort
    setDateRange(undefined);
    setSelectedChannels(["all"]);
    setAiStatus("all");
    setSelectedTags([]);
    setTagsLogic('OR');
    setSelectedOpportunityStatuses([]);
    setSelectedPriorities([]);
    // Do NOT reset: pipeline (separate selector), stages (separate selector), sort (separate button)
    setSearchText("");
    setCurrentPage(1);
    toast.success("Filters have been reset");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange) count++;
    if (!selectedChannels.includes("all")) count++;
    if (aiStatus !== "all") count++;
    // Sort and stages are separate controls, not counted in filters badge
    if (selectedTags.length > 0) count++;
    if (selectedOpportunityStatuses.length > 0) count++;
    if (selectedPriorities.length > 0) count++;
    // Do NOT count stages (separate selector in header)
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Pagination - now using server-side pagination
  const totalPages = Math.max(1, Math.ceil(totalConversations / conversationsPerPage));

  // No need for client-side pagination since we're doing server-side
  const paginatedConversations = conversations;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPipelineId, searchText, dateRange, selectedChannels, aiStatus, sortBy, selectedTags, tagsLogic, selectedOpportunityStatuses, selectedPriorities, selectedStages]);

  const getPipelineName = () => {
    return selectedPipelineId ?
      pipelines.find(pipeline => pipeline.id === selectedPipelineId)?.pipeline_name || "Pipeline"
      : "All Pipelines";
  };

  const toggleAI = async () => {
    if (!selectedConversation) return;

    const newAiPausedState = !selectedConversation.aiPaused;

    try {
      await toggleAIMutation.mutateAsync({
        conversationId: selectedConversation.id,
        aiPaused: newAiPausedState,
        connectorChatId: selectedConversation.connectorChatId
      });

      // Update local state
      setSelectedConversation({
        ...selectedConversation,
        aiPaused: newAiPausedState
      });

      toast.success(`AI ${newAiPausedState ? "paused" : "enabled"} for this conversation`);
    } catch (error) {
      console.error('Error toggling AI:', error);
      toast.error('Failed to update AI status. Please try again.');
    }
  };

  const handleSelectConversation = (conversation: InboxConversation) => {
    setSelectedConversation(conversation);
    // Update URL to reflect selected conversation using new format
    if (conversationIdFromQuery !== conversation.id) {
      const newUrl = pipelineId
        ? `/inboxes/${pipelineId}?conversation=${conversation.id}`
        : `/inboxes?conversation=${conversation.id}`;
      navigate(newUrl, { replace: true });
    }
    toast.info(`Switched to conversation with ${conversation.contact.name}`);
  };

  // Auto-select first conversation when list changes, but only if no conversation is specified in URL
  useEffect(() => {
    if (conversationsLoading) return;

    // If list is empty, clear selection
    if (displayConversations.length === 0) {
      if (selectedConversation) {
        setSelectedConversation(null);
      }
      return;
    }

    // Only auto-select if there's no conversation query parameter and no conversation already selected
    if (!conversationIdFromQuery && !selectedConversation) {
      setSelectedConversation(displayConversations[0]);
    }
    // Only change selection if current conversation is no longer in the list and no URL conversation
    else if (!conversationIdFromQuery && selectedConversation &&
      !displayConversations.some(c => c.id === selectedConversation.id)) {
      setSelectedConversation(displayConversations[0]);
    }
  }, [displayConversations, selectedConversation, conversationIdFromQuery, conversationsLoading]);

  const openFiltersDialog = () => {
    setFiltersDialogOpen(true);
  };

  // Contact details for selected conversation with enhanced data
  const contactDetails = selectedConversation ? {
    name: selectedConversation.contact.name,
    email: selectedConversation.contact.email || '',
    phone: selectedConversation.contact.phone || ''
  } : {
    name: '',
    email: '',
    phone: ''
  };

  const handleSendMessage = (message: string, attachments?: File[]) => {
    // The actual success/error feedback is now handled in MessageInput
    // This just logs for debugging
    console.log("Message sent through inbox:", {
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      attachmentCount: attachments?.length || 0,
      conversationId: selectedConversation?.id
    });
  };

  // Wrapper function to handle the addNote return type mismatch
  const handleAddNote = async (content: string): Promise<void> => {
    try {
      await addNote(content);
      toast.success("Note added successfully!");
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error("Failed to add note. Please try again.");
      throw error;
    }
  };

  const handleUpdateNote = async (noteId: string, content: string): Promise<void> => {
    try {
      await updateNote({ noteId, content });
      toast.success("Note updated successfully!");
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error("Failed to update note. Please try again.");
      throw error;
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    try {
      await deleteNote(noteId);
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error("Failed to delete note. Please try again.");
      throw error;
    }
  };

  // Error handling for different types of errors
  const renderError = (error: any, type: string, refetch?: () => void) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Unable to load {type}</h2>
        <p className="text-gray-600 mb-4 text-sm">
          {error?.message || `There was an error loading your ${type}. Please check your connection and try again.`}
        </p>
        {refetch && (
          <Button onClick={() => refetch()} className="mb-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );

  // Main error check
  if (conversationsError) {
    console.error('Conversations error:', conversationsError);
    return (
      <ModernLayout title="Inbox">
        <SEOHead
          title="Inbox"
          description="Manage customer conversations and communications across all channels in one unified inbox."
          keywords={['inbox', 'conversations', 'customer communication', 'CRM messaging']}
        />
        {renderError(conversationsError, "conversations", refetchConversations)}
      </ModernLayout>
    );
  }

  if (pipelinesError) {
    console.error('Pipelines error:', pipelinesError);
    return (
      <ModernLayout title="Inbox">
        <SEOHead
          title="Inbox"
          description="Manage customer conversations and communications across all channels in one unified inbox."
          keywords={['inbox', 'conversations', 'customer communication', 'CRM messaging']}
        />
        {renderError(pipelinesError, "pipelines")}
      </ModernLayout>
    );
  }

  return (
    <>
      <SEOHead
        title={pageConfigs.inbox.title}
        description={pageConfigs.inbox.description}
        keywords={pageConfigs.inbox.keywords}
      />
      <ModernLayout
        title="Inbox"
        showPipelineSelector={true}
        selectedPipelineId={selectedPipelineId}
        onSelectPipeline={(pipelineId) => {
          setSelectedPipelineId(pipelineId);
          // Navigate to new pipeline route when pipeline changes
          if (pipelineId) {
            navigate(`/inboxes/${pipelineId}`, { replace: true });
          } else {
            navigate('/inboxes', { replace: true });
          }
        }}
        pipelines={pipelines}
        showStageSelector={!!selectedPipelineId}
        availableStages={availableStages}
        selectedStages={selectedStages}
        onStagesChange={setSelectedStages}
        showSort={true}
        sortBy={sortBy}
        onSortChange={(newSort) => setSortBy(newSort as SortOption)}
        openFiltersDialog={openFiltersDialog}
        activeFiltersCount={activeFiltersCount}
        showSearch={false}
      >
        {/* Show error alerts if there are issues with messages or notes */}
        {(messagesError || notesError) && (
          <div className="p-4 space-y-2">
            {messagesError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load messages. Please check your connection.
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => refetchMessages()}
                    className="ml-2 h-auto p-0"
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {notesError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load notes. Please refresh the page if the problem persists.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex h-full w-full overflow-hidden">
          <Collapsible
            open={leftPanelOpen}
            onOpenChange={setLeftPanelOpen}
            className={`${leftPanelOpen ? 'w-96' : 'w-12'} border-r border-gray-200 flex flex-col bg-white transition-all duration-300`}
          >
            <ConversationList
              conversations={displayConversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={handleSelectConversation}
              setAiEnabled={() => { }} // Not used anymore, handled by toggleAI
              leftPanelOpen={leftPanelOpen}
              setLeftPanelOpen={setLeftPanelOpen}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              searchText={searchText}
              onSearchChange={setSearchText}
            />
          </Collapsible>

          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            {conversationsLoading || conversationsRefetching ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {conversationsRefetching ? 'Refreshing conversations...' : 'Loading conversations...'}
                  </p>
                </div>
              </div>
            ) : displayConversations.length > 0 && selectedConversation ? (
              <MessageThread
                selectedConversation={selectedConversation}
                messageHistory={messageHistory}
                contactDetails={contactDetails}
                aiEnabled={!selectedConversation.aiPaused}
                toggleAI={toggleAI}
                onSendMessage={handleSendMessage}
                isLoading={messagesLoading}
              />
            ) : (
              <EmptyInbox resetFilters={resetFilters} />
            )}
          </div>

          <Collapsible
            open={rightPanelOpen}
            onOpenChange={setRightPanelOpen}
            className={`${rightPanelOpen ? 'w-80' : 'w-12'} border-l border-gray-200 bg-white flex flex-col transition-all duration-300`}
          >
            {!rightPanelOpen && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="mt-4 mx-auto">
                  <ChevronLeft size={20} />
                </Button>
              </CollapsibleTrigger>
            )}

            {rightPanelOpen && selectedConversation && (
              <ContactDetailsPanel
                selectedConversation={selectedConversation}
                contactDetails={contactDetails}
                notes={notes}
                setNotes={() => { }} // Handled by useConversationNotes
                isLoadingNotes={notesLoading}
                rightPanelOpen={rightPanelOpen}
                onAddNote={handleAddNote}
                isAddingNote={isAddingNote}
                onUpdateNote={handleUpdateNote}
                isUpdatingNote={isUpdatingNote}
                onDeleteNote={handleDeleteNote}
                isDeletingNote={isDeletingNote}
              />
            )}
          </Collapsible>
        </div>
      </ModernLayout>

      <InboxFiltersDialog
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedChannels={selectedChannels}
        setSelectedChannels={setSelectedChannels}
        availableChannels={availableChannels}
        aiStatus={aiStatus}
        setAiStatus={setAiStatus}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
        tagsLogic={tagsLogic}
        setTagsLogic={setTagsLogic}
        selectedOpportunityStatuses={selectedOpportunityStatuses}
        setSelectedOpportunityStatuses={setSelectedOpportunityStatuses}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        onResetFilters={resetFilters}
        activeFiltersCount={activeFiltersCount}
        open={filtersDialogOpen}
        setOpen={setFiltersDialogOpen}
      />
    </>
  );
};

export default Inboxes;

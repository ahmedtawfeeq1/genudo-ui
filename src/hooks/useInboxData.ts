import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 
import { formatInboxTimestamp } from '@/utils/date';

export interface InboxConversation {
  id: string;
  connectorChatId: string;
  opportunityId?: string;
  stageId?: string;
  stageName?: string;
  opportunityStatus?: string; // Status from opportunities table (Active, Pending, Won, Lost, Archived)
  contact: {
    name: string;
    avatar: string;
    thumbnail?: string;
    initials: string;
    type: string;
    contactInfo?: string;
    phone?: string;
    email?: string;
  };
  lastMessage: string;
  time: string;
  timestamp: string;
  messageCount: number;
  unread: boolean;
  aiPaused: boolean;
  channelType: string;
  channelDisplayName: string;
  pipelineId: string;
  pipelineName: string;
  agentId: string;
  cost?: number;
  status?: string; // Legacy conversation status
  priority?: string;
  lastActivity: string;
  avgResponseTime?: string;
  tags?: string[];
}

export interface InboxMessage {
  id: number;
  sender: {
    name: string;
    avatar: string;
    thumbnail?: string;
    initials: string;
    type: string;
  };
  message: string;
  time: string;
  responseLanguage?: string | null;
  senderType?: string;
  role?: string;
  senderTypeLabel?: string;
  contentType?: string;
  mediaUrl?: string | null;
  media_url?: string | null;
  mediaType?: string | null;
  media_type?: string | null;
}

export interface InboxNote {
  id: string;
  author: {
    name: string;
    initials: string;
  };
  content: string;
  createdAt: string;
}

// Define valid channel types
type ChannelType = 'WHATSAPP' | 'GMAIL' | 'OUTLOOK' | 'IMAP' | 'INSTAGRAM' | 'MESSENGER' | 'TELEGRAM' | 'WEBCHAT' | 'API' | 'LINKEDIN';

// Helper function to get friendly channel display names
function getChannelDisplayName(channel: string): string {
  const channelMap: Record<string, string> = {
    'WHATSAPP': 'WhatsApp',
    'GMAIL': 'Gmail',
    'OUTLOOK': 'Outlook',
    'IMAP': 'Email',
    'INSTAGRAM': 'Instagram',
    'MESSENGER': 'Messenger',
    'TELEGRAM': 'Telegram',
    'WEBCHAT': 'Web Chat',
    'API': 'API',
    'LINKEDIN': 'LinkedIn'
  };
  return channelMap[channel] || channel;
}

// Helper function to get avatar with thumbnail support
function getContactAvatar(contact: any): { avatar: string; thumbnail?: string; initials: string } {
  const name = contact?.name || 'Unknown Contact';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 1);

  return {
    avatar: contact?.thumbnail || '',
    thumbnail: contact?.thumbnail,
    initials: initials || 'U'
  };
}

// Helper function to calculate average response time for conversations
// This analyzes message sequences to find user->AI response pairs and calculates timing
async function calculateAverageResponseTimes(conversationIds: string[]): Promise<Record<string, string>> {
  const responseTimeMap: Record<string, string> = {};
  conversationIds.forEach(id => { responseTimeMap[id] = '2m'; });
  return responseTimeMap;
}

// Helper function to format response time in seconds
function formatResponseTime(milliseconds: number): string {
  const seconds = milliseconds / 1000;

  if (seconds < 1) {
    return `${seconds.toFixed(2)}s`;
  } else if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  } else {
    return `${Math.round(seconds)}s`;
  }
}

export function useInboxConversations(
  pipelineId?: string,
  filters?: {
    searchText?: string;
    dateRange?: { from?: Date; to?: Date };
    channels?: string[];
    aiStatus?: 'all' | 'paused' | 'active';
    sortBy?: string;
    tags?: string[];
    tagsLogic?: 'AND' | 'OR';
    opportunityStatuses?: string[];
    priorities?: string[];
    stages?: string[];
  },
  pagination?: {
    page: number;
    limit: number;
  }
) {
  const user: any = { id: 'demo' };

  return useQuery({
    queryKey: ['inbox-conversations', user?.id, pipelineId, filters, pagination],
    queryFn: async (): Promise<{ conversations: InboxConversation[]; totalCount: number }> => {
      if (!user?.id) return { conversations: [], totalCount: 0 };

      try {
        console.log('[Inbox] Fetching conversations', {
          userId: user.id,
          pipelineId,
          filters,
          pagination
        });
        // Build mock conversations

        // Apply stage filter at DATABASE level (before fetching all conversations)
        // This prevents hitting the 10k limit when filtering by stage
        // Stage filtering will be applied after transformation using stage names

        const sortOption = filters?.sortBy || 'newest';

        // DO NOT apply pagination here - we need to filter first, then paginate
        // Fetch ALL conversations matching database-level filters
          const conversations: any[] = [
            { id: 'conv-1', contact_id: 'c1', pipeline_id: pipelineId || 'pipe-1', opportunity_id: 'o1', channel: 'WHATSAPP', last_message_content: 'Hello', last_message_time: new Date().toISOString(), unread_count: 0, ai_paused: false, updated_at: new Date().toISOString(), status: 'open', priority: 'normal', connector_chat_id: 'chat-1', agent_id: 'agent-001', total_cost_usd: '0.024' },
            { id: 'conv-2', contact_id: 'c2', pipeline_id: pipelineId || 'pipe-1', opportunity_id: 'o2', channel: 'GMAIL', last_message_content: 'Pricing?', last_message_time: new Date().toISOString(), unread_count: 0, ai_paused: true, updated_at: new Date().toISOString(), status: 'open', priority: 'high', connector_chat_id: 'chat-2', agent_id: 'agent-001', total_cost_usd: '0.012' },
          ];

        

        if (!conversations?.length) {
          return { conversations: [], totalCount: 0 };
        }

        // Step 3: Get related data
        const conversationIds = conversations.map((c: any) => c.id);
        const contactIds = conversations.map((c: any) => c.contact_id).filter(Boolean);
        const pipelineIds = conversations.map((c: any) => c.pipeline_id).filter(Boolean);
        const opportunityIds = conversations.map((c: any) => c.opportunity_id).filter(Boolean);

        // Helper function to batch array into chunks
        const batchArray = <T>(array: T[], batchSize: number): T[][] => {
          const batches: T[][] = [];
          for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
          }
          return batches;
        };

        // Get contacts
        let contacts: any[] = [];
        if (contactIds.length > 0) {
          const BATCH_SIZE = 50; // Safe batch size to avoid URL length limits
          const contactBatches = batchArray(contactIds, BATCH_SIZE);
          contacts = [ { id: 'c1', name: 'Alice Johnson', identifier: '+1555-0101', thumbnail: '' }, { id: 'c2', name: 'Bob Smith', identifier: 'bob@example.com', thumbnail: '' } ];
        }

        const pipelines: any[] = [{ id: 'pipe-1', pipeline_name: 'Sales' }, { id: 'pipe-2', pipeline_name: 'Support' }];

        // Get opportunities to fetch tags, stage_id, and status - batched to avoid URL length issues
        let opportunities: any[] = [];
        if (opportunityIds.length > 0) {
          const BATCH_SIZE = 50; // Safe batch size to avoid URL length limits
          const opportunityBatches = batchArray(opportunityIds, BATCH_SIZE);
          opportunities = [
            { id: 'o1', tags: 'lead,faq', stage_id: 's1', status: 'active' },
            { id: 'o2', tags: 'lead', stage_id: 's2', status: 'pending' },
          ];
        }

        // Get unique stage IDs from opportunities
        const stageIds = opportunities
          ? [...new Set(opportunities.map((opp: any) => opp.stage_id).filter(Boolean))]
          : [];

        // Get stages
        let stages: any[] = [];
        if (stageIds.length > 0) {
          const BATCH_SIZE = 50; // Safe batch size to avoid URL length limits
          stages = [ { id: 's1', stage_name: 'New' }, { id: 's2', stage_name: 'Qualified' } ];
        }

        // Message counts and response times will be calculated AFTER pagination
        // to prevent browser resource exhaustion (only for visible conversations)

        // Create lookup maps
        const contactsMap: Record<string, any> = {};
        (contacts || []).forEach((contact: any) => {
          if (contact?.id) contactsMap[contact.id] = contact;
        });

        const pipelinesMap: Record<string, any> = {};
        (pipelines || []).forEach((pipeline: any) => {
          if (pipeline?.id) pipelinesMap[pipeline.id] = pipeline;
        });

        const opportunitiesMap: Record<string, any> = {};
        (opportunities || []).forEach((opportunity: any) => {
          if (opportunity?.id) opportunitiesMap[opportunity.id] = opportunity;
        });

        const stagesMap: Record<string, any> = {};
        (stages || []).forEach((stage: any) => {
          if (stage?.id) stagesMap[stage.id] = stage;
        });

        // Transform the data
        let transformedConversations: InboxConversation[] = conversations.map((conv: any) => {
          const contact = conv.contact_id ? contactsMap[conv.contact_id] : null;
          const pipeline = conv.pipeline_id ? pipelinesMap[conv.pipeline_id] : null;
          const opportunity = conv.opportunity_id ? opportunitiesMap[conv.opportunity_id] : null;
          const stage = opportunity?.stage_id ? stagesMap[opportunity.stage_id] : null;
          // Message count and response time will be populated after pagination
          const messageCount = 0;
          const avgResponseTime = '--';
          const avatarData = getContactAvatar(contact);

          // Parse tags from comma-separated string
          const tags = opportunity?.tags
            ? opportunity.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [];

          return {
            id: conv.id,
            connectorChatId: conv.connector_chat_id || conv.id,
            opportunityId: conv.opportunity_id || undefined,
            stageId: opportunity?.stage_id || undefined,
            stageName: stage?.stage_name || undefined,
            opportunityStatus: opportunity?.status || undefined,
            contact: {
              name: contact?.name || 'Unknown Contact',
              avatar: avatarData.avatar,
              thumbnail: avatarData.thumbnail,
              initials: avatarData.initials,
              type: contact?.email ? 'customer' : 'messenger',
              contactInfo: contact?.email || contact?.phone_number || contact?.identifier || '',
              email: contact?.email || '',
              phone: contact?.phone_number || contact?.identifier || ''
            },
            lastMessage: conv.last_message_content || 'No messages yet',
            time: conv.last_message_time ? formatTime(conv.last_message_time) : formatTime(conv.updated_at),
            timestamp: conv.last_message_time || conv.updated_at,
            messageCount: messageCount,
            unread: (conv.unread_count || 0) > 0,
            aiPaused: conv.ai_paused || false,
            channelType: conv.channel || 'UNKNOWN',
            channelDisplayName: getChannelDisplayName(conv.channel || 'UNKNOWN'),
            pipelineId: conv.pipeline_id || '',
            pipelineName: pipeline?.pipeline_name || 'Unknown Pipeline',
            agentId: conv.agent_id || '',
            cost: conv.total_cost_usd ? Number(conv.total_cost_usd) : undefined,
            status: conv.status || 'Unknown',
            priority: conv.priority || 'normal',
            lastActivity: conv.updated_at,
            avgResponseTime: avgResponseTime,
            tags: tags
          };
        });

        // Apply pipeline filter
        if (pipelineId) {
          transformedConversations = transformedConversations.filter(c => c.pipelineId === pipelineId);
        }

        // Apply AI status filter
        if (filters?.aiStatus === 'paused') {
          transformedConversations = transformedConversations.filter(c => c.aiPaused);
        } else if (filters?.aiStatus === 'active') {
          transformedConversations = transformedConversations.filter(c => !c.aiPaused);
        }

        // Apply channel filter
        if (filters?.channels && filters.channels.length > 0 && !filters.channels.includes('all')) {
          transformedConversations = transformedConversations.filter(c => filters.channels!.includes(c.channelType as any));
        }

        // Apply date range filter
        if (filters?.dateRange?.from) {
          transformedConversations = transformedConversations.filter(c => new Date(c.timestamp) >= filters.dateRange!.from!);
        }
        if (filters?.dateRange?.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          transformedConversations = transformedConversations.filter(c => new Date(c.timestamp) <= endDate);
        }

        // Apply enhanced search filter
        if (filters?.searchText?.trim()) {
          const searchLower = filters.searchText.toLowerCase();

          transformedConversations = transformedConversations.filter(c => {
            return c.contact.name.toLowerCase().includes(searchLower) ||
              c.lastMessage.toLowerCase().includes(searchLower) ||
              c.contact.contactInfo.toLowerCase().includes(searchLower);
          });
        }

        // Apply tag filtering
        if (filters?.tags && filters.tags.length > 0) {
          const tagsLogic = filters.tagsLogic || 'OR';

          transformedConversations = transformedConversations.filter(c => {
            if (!c.tags || c.tags.length === 0) return false;

            if (tagsLogic === 'AND') {
              // Check if conversation has ALL of the selected tags
              return filters.tags!.every(filterTag =>
                c.tags!.some(convTag =>
                  convTag.toLowerCase().includes(filterTag.toLowerCase())
                )
              );
            } else {
              // Check if conversation has ANY of the selected tags
              return filters.tags!.some(filterTag =>
                c.tags!.some(convTag =>
                  convTag.toLowerCase().includes(filterTag.toLowerCase())
                )
              );
            }
          });
        }

        // Apply opportunity status filtering
        if (filters?.opportunityStatuses && filters.opportunityStatuses.length > 0) {
          transformedConversations = transformedConversations.filter(c => {
            // Only include conversations that have an opportunity with a matching status
            return c.opportunityStatus && filters.opportunityStatuses.includes(c.opportunityStatus);
          });
        }

        // Apply priority filtering
        if (filters?.priorities && filters.priorities.length > 0) {
          transformedConversations = transformedConversations.filter(c => {
            // Only include conversations that have a matching priority
            return c.priority && filters.priorities.includes(c.priority);
          });
        }

        // Note: Stage filtering is now done at DATABASE level (lines 262-293)
        // to avoid hitting row limits when sorting

        // Apply message count sorting ONLY if needed (calculate counts for all filtered conversations)
        if (filters?.sortBy === 'most-messages' || filters?.sortBy === 'least-messages') {
          // OPTIMIZED: Single query with GROUP BY instead of N individual queries
          const allConvIds = transformedConversations.map(c => c.id);

          // Fetch all messages for these conversations in ONE query
          const messages: any[] = allConvIds.flatMap(id => [{ conversation_id: id }, { conversation_id: id }]);

          // Count messages per conversation in JavaScript
          const messageCountMap: Record<string, number> = {};
          allConvIds.forEach(id => messageCountMap[id] = 0); // Initialize all to 0

          if (messages) {
            messages.forEach((msg: any) => {
              messageCountMap[msg.conversation_id] = (messageCountMap[msg.conversation_id] || 0) + 1;
            });
          }

          // Update all conversations with message counts
          transformedConversations = transformedConversations.map(conv => ({
            ...conv,
            messageCount: messageCountMap[conv.id] || 0
          }));

          // Now sort by message count
          if (filters.sortBy === 'most-messages') {
            transformedConversations.sort((a, b) => b.messageCount - a.messageCount);
          } else {
            transformedConversations.sort((a, b) => a.messageCount - b.messageCount);
          }
        }

        // NOW apply pagination AFTER all filters and sorting
        const totalFilteredCount = transformedConversations.length;

        let paginatedConversations = transformedConversations;
        if (pagination) {
          const startIndex = (pagination.page - 1) * pagination.limit;
          const endIndex = startIndex + pagination.limit;
          paginatedConversations = transformedConversations.slice(startIndex, endIndex);
        }

        // Calculate message counts and response times for paginated conversations
        // If we already calculated message counts for sorting, skip recalculating them
        const paginatedConvIds = paginatedConversations.map(c => c.id);
        const needsMessageCounts = filters?.sortBy !== 'most-messages' && filters?.sortBy !== 'least-messages';

        if (paginatedConvIds.length > 0) {
          let messageCountMap: Record<string, number> = {};

          // Only calculate message counts if we didn't already do it for sorting
          if (needsMessageCounts) {
            // OPTIMIZED: Single query instead of N individual queries
            const messages: any[] = paginatedConvIds.flatMap(id => [{ conversation_id: id }]);

            // Initialize all to 0
            paginatedConvIds.forEach(id => messageCountMap[id] = 0);

            // Count messages per conversation
            if (messages) {
              messages.forEach((msg: any) => {
                messageCountMap[msg.conversation_id] = (messageCountMap[msg.conversation_id] || 0) + 1;
              });
            }
          } else {
            // We already have message counts from sorting, just create a map
            paginatedConversations.forEach(conv => {
              messageCountMap[conv.id] = conv.messageCount;
            });
          }

          // Get average response times for visible conversations
          const responseTimesForPaginated = await calculateAverageResponseTimes(paginatedConvIds);

          // Update paginated conversations with counts (if needed) and response times
          paginatedConversations = paginatedConversations.map(conv => ({
            ...conv,
            messageCount: messageCountMap[conv.id] || conv.messageCount || 0,
            avgResponseTime: responseTimesForPaginated[conv.id] || '--'
          }));
        }

        console.log('[Inbox] Conversations result', {
          totalFilteredCount,
          page: pagination?.page,
          pageSize: pagination?.limit,
          returned: paginatedConversations.length
        });
        return { conversations: paginatedConversations, totalCount: totalFilteredCount };

      } catch (error) {
        console.error('Error in useInboxConversations:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useConversationMessages(conversationId: string) {
  const user: any = { id: 'demo' };

  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async (): Promise<InboxMessage[]> => {
      if (!conversationId || !user?.id) return [];

      try {
        console.log('[Inbox] Fetching messages', { conversationId, userId: user.id });
        const now = Date.now();
        const messages: any[] = Array.from({ length: 12 }).map((_, i) => {
          const t = new Date(now - (12 - i) * 60000).toISOString();
          if (i % 3 === 0) return { contact_id: 'c1', sender_type: 'human', role: 'user', created_at: t, processed_message_content: `User message ${i}` };
          if (i % 3 === 1) return { agent_id: 'agent-001', sender_type: 'ai_agent', role: 'assistant', created_at: t, processed_message_content: `AI reply ${i}` };
          return { agent_id: null, sender_type: 'human', role: 'assistant', created_at: t, processed_message_content: `Admin note ${i}` };
        });

        

        if (!messages?.length) return [];

        // Related data
        const contactIds = messages.map((m: any) => m.contact_id).filter(Boolean);
        const agentIds = messages.map((m: any) => m.agent_id).filter(Boolean);

        // Helper function to batch array into chunks
        const batchArray = <T>(array: T[], batchSize: number): T[][] => {
          const batches: T[][] = [];
          for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
          }
          return batches;
        };

        // Contacts
        let contacts: any[] = [];
        if (contactIds.length > 0) {
          const BATCH_SIZE = 50;
          const contactBatches = batchArray(contactIds, BATCH_SIZE);
          contacts = [ { id: 'c1', name: 'Alice Johnson', identifier: '+1555-0101', thumbnail: '' }, { id: 'c2', name: 'Bob Smith', identifier: 'bob@example.com', thumbnail: '' } ];
        }

        // Agents
        let agents: any[] = [];
        if (agentIds.length > 0) {
          const BATCH_SIZE = 50;
          const agentBatches = batchArray(agentIds, BATCH_SIZE);
          agents = [ { id: 'agent-001', name: 'Sales Pro Alpha' } ];
        }

        const contactsMap: Record<string, any> = {};
        (contacts || []).forEach((contact: any) => {
          if (contact?.id) contactsMap[contact.id] = contact;
        });

        const agentsMap: Record<string, any> = {};
        (agents || []).forEach((agent: any) => {
          if (agent?.id) agentsMap[agent.id] = agent;
        });

        // Transform messages with enhanced data
        const result = messages.map((msg: any, index: number): InboxMessage => {
          const isAgent = msg.sender_type === 'ai_agent' && msg.role === 'assistant';
          const isHumanAdmin = msg.sender_type === 'human' && msg.role === 'assistant';
          const contact = msg.contact_id ? contactsMap[msg.contact_id] : null;
          const agent = msg.agent_id ? agentsMap[msg.agent_id] : null;

          const senderName = isAgent
            ? (agent?.name || 'AI Assistant')
            : isHumanAdmin
              ? 'Admin'
              : (contact?.name || 'Contact');

          const initials = senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 1);

          // Determine sender type for label
          let senderTypeLabel = 'User';
          if (isAgent) {
            senderTypeLabel = 'AI';
          } else if (isHumanAdmin) {
            senderTypeLabel = 'Admin';
          }

          return {
            id: index + 1,
            sender: {
              name: senderName,
              avatar: !isAgent && !isHumanAdmin && contact?.thumbnail ? contact.thumbnail : '',
              thumbnail: !isAgent && !isHumanAdmin ? contact?.thumbnail : undefined,
              initials: initials || (isAgent ? 'AI' : isHumanAdmin ? 'AD' : 'U'),
              type: isAgent ? 'ai' : isHumanAdmin ? 'admin' : 'user'
            },
            message: msg.processed_message_content || msg.content || '',
            time: formatTime(msg.created_at),
            responseLanguage: msg.response_language || null,
            senderType: msg.sender_type,
            role: msg.role,
            senderTypeLabel: senderTypeLabel,
            contentType: msg.content_type,
            mediaUrl: msg.media_url,
            media_url: msg.media_url,
            mediaType: msg.media_type,
            media_type: msg.media_type
          };
        });
        console.log('[Inbox] Messages result', { count: result.length });
        return result;

      } catch (error) {
        console.error('Error in useConversationMessages:', error);
        throw error;
      }
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 10 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useConversationNotes(conversationId: string) {
  const user: any = { id: 'demo' };
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversation-notes', conversationId],
    queryFn: async (): Promise<InboxNote[]> => {
      if (!conversationId || !user?.id) return [];

      try {
        console.log('[Inbox] Fetching notes', { conversationId, userId: user.id });
      const data: any[] = [ { id: 'n1', content: 'Follow up next week.', created_at: new Date().toISOString() } ];

        

        const result = (data || []).map((note: any): InboxNote => ({
          id: note.id,
          author: {
            name: 'You',
            initials: 'YO'
          },
          content: note.content,
          createdAt: formatTime(note.created_at)
        }));
        console.log('[Inbox] Notes result', { count: result.length });
        return result;

      } catch (error) {
        console.error('Error in useConversationNotes:', error);
        throw error;
      }
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 30 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !conversationId) throw new Error('User not authenticated');

      const data = { id: `n-${Date.now()}`, content: content.trim(), created_at: new Date().toISOString() } as any;

      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const data = { id: noteId, content: content.trim(), updated_at: new Date().toISOString() } as any;

      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] });
    }
  });

  return {
    ...query,
    addNote: addNoteMutation.mutateAsync,
    isAddingNote: addNoteMutation.isPending,
    updateNote: updateNoteMutation.mutateAsync,
    isUpdatingNote: updateNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutateAsync,
    isDeletingNote: deleteNoteMutation.isPending
  };
}

export function useToggleAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      aiPaused,
      connectorChatId
    }: {
      conversationId: string;
      aiPaused: boolean;
      connectorChatId: string;
    }) => {
      // Update database
      const error = null;

      if (error) throw error;

      // Call external API to pause/unpause conversation in the engine via Edge Function proxy (avoids CORS)
      try {
        console.log('Toggling AI via proxy for connectorChatId:', connectorChatId);
        console.log('Simulate pause/unpause via proxy');
      } catch (apiError) {
        console.error('Error calling pause conversation proxy:', apiError);
        // Don't throw - database update succeeded
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
    }
  });
}

/**
 * Formats inbox timestamps consistently using timezone-aware rules.
 */
function formatTime(timestamp: string): string {
  return formatInboxTimestamp(timestamp);
}

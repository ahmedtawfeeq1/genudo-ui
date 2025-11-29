import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  DollarSign,
  Clock,
  MessageSquare,
  ExternalLink,
  Mail,
  Hash,
  Calendar,
  Flag,
  Activity,
  Edit,
  MoreVertical,
  Layers,
  Workflow,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import NotesSection from "./NotesSection";
import OpportunityTagsSection from "./OpportunityTagsSection";
import UnifiedOpportunityModal from "@/components/opportunities/UnifiedOpportunityModal";
import { db } from "@/lib/mock-db";
import { type InboxConversation, type InboxNote } from "@/hooks/useInboxData";
import { formatAbsoluteTimestamp } from "@/utils/date";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface ContactDetails {
  name: string;
  email: string;
  phone: string;
}

interface ContactDetailsPanelProps {
  selectedConversation: InboxConversation;
  contactDetails: ContactDetails;
  notes: InboxNote[];
  setNotes: React.Dispatch<React.SetStateAction<InboxNote[]>>; // Legacy prop, not used
  isLoadingNotes: boolean;
  rightPanelOpen: boolean;
  onAddNote?: (content: string) => Promise<void>;
  isAddingNote?: boolean;
  onUpdateNote?: (noteId: string, content: string) => Promise<void>;
  isUpdatingNote?: boolean;
  onDeleteNote?: (noteId: string) => Promise<void>;
  isDeletingNote?: boolean;
}

const ContactDetailsPanel: React.FC<ContactDetailsPanelProps> = ({
  selectedConversation,
  contactDetails,
  notes,
  setNotes, // Not used, kept for compatibility
  isLoadingNotes,
  rightPanelOpen,
  onAddNote,
  isAddingNote = false,
  onUpdateNote,
  isUpdatingNote = false,
  onDeleteNote,
  isDeletingNote = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);
  const [opportunityData, setOpportunityData] = useState<any>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);
  const [availableStages, setAvailableStages] = useState<Array<{ id: string; stage_name: string; stage_position_index: number }>>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [advancedDetailsOpen, setAdvancedDetailsOpen] = useState(false);

  // Fetch available stages for the pipeline - filtered by user_id and pipeline_id
  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedConversation?.pipelineId || !user?.id) return;

      setLoadingStages(true);
      try {
        // Query stages filtered by both pipeline_id and user_id
        await new Promise(res => setTimeout(res, 150));
        setAvailableStages([
          { id: 's1', stage_name: 'New', stage_position_index: 0 },
          { id: 's2', stage_name: 'Qualified', stage_position_index: 1 },
          { id: 's3', stage_name: 'Won', stage_position_index: 2 },
        ]);
      } catch (error) {
        console.error('Error fetching stages:', error);
      } finally {
        setLoadingStages(false);
      }
    };

    fetchStages();
  }, [selectedConversation?.pipelineId, user?.id]);

  const handleCopyConnectorChatId = () => {
    navigator.clipboard.writeText(selectedConversation.connectorChatId);
    toast.success("Connector Chat ID copied to clipboard");
  };

  const handlePipelineClick = () => {
    if (selectedConversation.pipelineId) {
      navigate(`/pipelines/${selectedConversation.pipelineId}`);
    }
  };

  const handleEditContactDetails = async () => {
    if (!selectedConversation.opportunityId) {
      toast.error("No opportunity associated with this conversation");
      return;
    }

    setLoadingOpportunity(true);
    try {
      // Fetch the full opportunity data
      await new Promise(res => setTimeout(res, 150));
      setOpportunityData({
        id: selectedConversation.opportunityId,
        opportunity_name: 'Static Opportunity',
        client_name: contactDetails.name,
        client_email: contactDetails.email || null,
        client_phone_number: contactDetails.phone || null,
        status: selectedConversation.opportunityStatus || 'active',
        pipeline_id: selectedConversation.pipelineId,
        stage_id: selectedConversation.stageId || 's1',
        contact_id: 'c1',
        opportunity_notes: null,
        source: 'inbox',
        tags: (selectedConversation.tags || []).join(','),
        created_at: selectedConversation.timestamp,
        pipeline_name: selectedConversation.pipelineName,
        stage_name: availableStages.find(s => s.id === (selectedConversation.stageId || 's1'))?.stage_name || 'New',
      });
      setOpportunityModalOpen(true);
    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast.error("Failed to load contact details");
    } finally {
      setLoadingOpportunity(false);
    }
  };

  const handleOpportunitySuccess = () => {
    // Invalidate inbox conversations to refresh the data
    queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
    toast.success("Contact details updated successfully");
  };

  // Mutation for updating opportunity status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'pending' | 'won' | 'lost') => {
      if (!selectedConversation.opportunityId) {
        throw new Error('No opportunity ID');
      }
      await new Promise(res => setTimeout(res, 150));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  });

  // Mutation for updating opportunity stage
  const updateStageMutation = useMutation({
    mutationFn: async (newStageId: string) => {
      if (!selectedConversation.opportunityId) {
        throw new Error('No opportunity ID');
      }
      await new Promise(res => setTimeout(res, 150));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      toast.success("Stage updated successfully");
    },
    onError: (error) => {
      console.error('Error updating stage:', error);
      toast.error("Failed to update stage");
    }
  });

  // Mutation for updating conversation priority
  const updatePriorityMutation = useMutation({
    mutationFn: async (newPriority: 'low' | 'normal' | 'high') => {
      await new Promise(res => setTimeout(res, 150));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      toast.success("Priority updated successfully");
    },
    onError: (error) => {
      console.error('Error updating priority:', error);
      toast.error("Failed to update priority");
    }
  });

  const usageData = {
    messageCount: selectedConversation?.messageCount || 0,
    cost: selectedConversation?.cost?.toFixed(3) || ((selectedConversation?.messageCount || 0) * 0.002).toFixed(3),
    avgResponseTime: selectedConversation?.avgResponseTime || '--',
  };

  const handleAddNote = async (content: string) => {
    if (onAddNote) {
      try {
        await onAddNote(content);
        toast.success("Note added successfully");
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error("Failed to add note");
      }
    }
  };

  const formatDate = (dateString: string) => formatAbsoluteTimestamp(dateString);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'normal':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'won':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'lost':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      default:
        return status || 'Unknown';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'High';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Low';
      default:
        return priority || 'Normal';
    }
  };

  return (
    <TooltipProvider>
      <div className="relative group h-full flex flex-col">
        {/* Collapse button on hover at the edge - positioned at top */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-4 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </Button>
        </CollapsibleTrigger>

        <div className="p-6 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center flex-1">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={selectedConversation?.contact.thumbnail || selectedConversation?.contact.avatar} />
              <AvatarFallback className="bg-primary-100 text-primary text-sm font-semibold">
                {selectedConversation?.contact.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{contactDetails.name}</h2>
              {selectedConversation?.contact.phone && (
                <div className="flex items-center gap-1">
                  <p className="text-sm font-mono text-gray-700">{selectedConversation.contact.phone}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedConversation.contact.phone);
                          const isWhatsApp = selectedConversation.channelType?.toUpperCase() === 'WHATSAPP';
                          toast.success(isWhatsApp ? "Phone number copied to clipboard" : "Contact identifier copied to clipboard");
                        }}
                      >
                        <Copy size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{selectedConversation.channelType?.toUpperCase() === 'WHATSAPP' ? 'Copy phone number' : 'Copy identifier'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              <p className="text-xs text-gray-500">{selectedConversation?.channelDisplayName}</p>
            </div>
            {selectedConversation?.opportunityId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditContactDetails} disabled={loadingOpportunity}>
                    <Edit size={16} className="mr-2" />
                    Edit Contact Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {/* Status Section - Inline */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <Select
              value={selectedConversation?.opportunityStatus || 'active'}
              onValueChange={(value) => updateStatusMutation.mutate(value as 'active' | 'pending' | 'won' | 'lost')}
              disabled={updateStatusMutation.isPending || !selectedConversation?.opportunityId}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="won">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Won
                  </div>
                </SelectItem>
                <SelectItem value="lost">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Lost
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Section - Inline */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Flag size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Priority</span>
            </div>
            <Select
              value={selectedConversation?.priority || 'normal'}
              onValueChange={(value) => updatePriorityMutation.mutate(value as 'low' | 'normal' | 'high')}
              disabled={updatePriorityMutation.isPending}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Flag size={12} className="text-green-500" />
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <Flag size={12} className="text-blue-500" />
                    Normal
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Flag size={12} className="text-red-500" />
                    High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stage Section - Label Above */}
          {selectedConversation?.pipelineId && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Layers size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Stage</span>
              </div>
              <Select
                value={selectedConversation?.stageId || ''}
                onValueChange={(value) => updateStageMutation.mutate(value)}
                disabled={updateStageMutation.isPending || loadingStages || !selectedConversation?.opportunityId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No stage" />
                </SelectTrigger>
                <SelectContent>
                  {availableStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.stage_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pipeline Section - Label Above */}
          {selectedConversation?.pipelineId && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Workflow size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Pipeline</span>
              </div>
              <Button
                variant="outline"
                onClick={handlePipelineClick}
                className="w-full justify-between text-primary border-primary hover:bg-primary hover:text-white transition-colors"
              >
                <span className="text-sm">{selectedConversation.pipelineName}</span>
                <ExternalLink size={14} />
              </Button>
            </div>
          )}

          {/* Last Activity */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">Last Activity</span>
            </div>
            <span className="text-sm">{formatDate(selectedConversation?.lastActivity || selectedConversation?.timestamp)}</span>
          </div>

          {/* Advanced Details - Collapsible */}
          <Collapsible
            open={advancedDetailsOpen}
            onOpenChange={setAdvancedDetailsOpen}
            className="border border-gray-200 rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <FileText size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Advanced Details</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${advancedDetailsOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {/* Chat ID */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Hash size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Chat ID</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-md p-2 w-full">
                  <span className="text-xs mr-auto font-mono text-gray-700">{selectedConversation?.connectorChatId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={handleCopyConnectorChatId}
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Conversation Metrics - Compact */}
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare size={14} className="text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">Conversation Metrics</h3>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mb-0.5">
                      <MessageSquare size={12} className="text-blue-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{usageData.messageCount}</div>
                    <div className="text-[10px] text-gray-500">Messages</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0">
                <CardContent className="p-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 mb-0.5">
                      <DollarSign size={12} className="text-green-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">${usageData.cost}</div>
                    <div className="text-[10px] text-gray-500">Cost</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0">
                <CardContent className="p-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 mb-0.5">
                      <Clock size={12} className="text-amber-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{usageData.avgResponseTime}</div>
                    <div className="text-[10px] text-gray-500">Avg. Response</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>

        <OpportunityTagsSection
          opportunityId={selectedConversation?.opportunityId || null}
          initialTags={selectedConversation?.tags || []}
          conversationId={selectedConversation.id}
        />

        <NotesSection
          notes={notes}
          setNotes={setNotes} // Legacy prop, not used
          isLoadingNotes={isLoadingNotes}
          onAddNote={handleAddNote}
          isAddingNote={isAddingNote}
          onUpdateNote={onUpdateNote}
          isUpdatingNote={isUpdatingNote}
          onDeleteNote={onDeleteNote}
          isDeletingNote={isDeletingNote}
        />
        </div>
      </div>

      {opportunityData && (
        <UnifiedOpportunityModal
          open={opportunityModalOpen}
          onOpenChange={setOpportunityModalOpen}
          onSuccess={handleOpportunitySuccess}
          mode="update"
          opportunity={opportunityData}
        />
      )}
    </TooltipProvider>
  );
};

export default ContactDetailsPanel;

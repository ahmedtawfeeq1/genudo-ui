import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, DollarSign, Zap, ZapOff, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { type InboxConversation } from "@/hooks/useInboxData";

export interface Contact {
  name: string;
  avatar: string;
  thumbnail?: string;
  initials: string;
  type: string;
  contactInfo?: string;
}

export interface Conversation {
  id: string;
  connectorChatId: string;
  contact: Contact;
  lastMessage: string;
  time: string;
  timestamp: string;
  messageCount: number;
  unread: boolean;
  aiPaused: boolean;
  channelType: string;
  channelDisplayName: string;
  agentId: string;
  cost?: number;
  tags?: string[];
}

interface ConversationListProps {
  conversations: InboxConversation[];
  selectedConversation: InboxConversation | null;
  setSelectedConversation: (conversation: InboxConversation) => void;
  setAiEnabled: (enabled: boolean) => void; // Legacy prop, not used
  leftPanelOpen: boolean;
  setLeftPanelOpen: (open: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchText?: string;
  onSearchChange?: (value: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  setAiEnabled, // Legacy prop, not used
  leftPanelOpen,
  setLeftPanelOpen,
  currentPage,
  totalPages,
  onPageChange,
  searchText = "",
  onSearchChange = () => {},
}) => {
  const handleSelectConversation = (conversation: InboxConversation) => {
    setSelectedConversation(conversation);
    // setAiEnabled(!conversation.aiPaused); // Legacy behavior, handled in parent
  };

  const getChannelBadgeColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'messenger':
        return 'bg-blue-100 text-blue-800';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'telegram':
        return 'bg-sky-100 text-sky-800';
      case 'email':
      case 'gmail':
      case 'outlook':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!leftPanelOpen) {
    return (
      <div className="py-4 flex justify-center">
        <button 
          className="text-gray-500 hover:text-gray-800"
          onClick={() => setLeftPanelOpen(true)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group h-full flex flex-col">
      {/* Collapse button on hover at the edge - positioned at top */}
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-4 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </Button>
      </CollapsibleTrigger>

      <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative w-full flex items-center bg-gray-50 rounded-full px-3 py-2">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations match your filters
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={`p-4 hover:bg-primary-50 cursor-pointer transition-colors duration-150 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-primary-50 border-r-2 border-primary"
                    : ""
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="flex items-start">
                  <div className="relative mr-3">
                    <Avatar className="h-12 w-12 rounded-full bg-gray-100">
                      <AvatarImage 
                        src={conversation.contact.thumbnail || conversation.contact.avatar} 
                        alt={conversation.contact.name}
                      />
                      <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold text-sm">
                        {conversation.contact.initials}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 text-base truncate">
                          {conversation.contact.name}
                        </span>
                        {conversation.tags && conversation.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conversation.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {conversation.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                +{conversation.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <MessageSquare size={14} className="mr-1" />
                          <span className="text-xs">{conversation.messageCount}</span>
                        </div>
                        <Badge 
                          className={`text-xs px-2 py-0.5 ${getChannelBadgeColor(conversation.channelDisplayName)} hover:${getChannelBadgeColor(conversation.channelDisplayName)}`}
                        >
                          {conversation.channelDisplayName}
                        </Badge>
                        {conversation.cost !== undefined && (
                          <div className="flex items-center">
                            <DollarSign size={14} className="mr-1" />
                            <span className="text-xs">${conversation.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {conversation.aiPaused ? (
                          <ZapOff size={16} className="text-amber-500" />
                        ) : (
                          <Zap size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)}
                  className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const pageNumber = currentPage <= 3 
                  ? index + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + index 
                    : currentPage - 2 + index;
                
                if (pageNumber < 1 || pageNumber > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
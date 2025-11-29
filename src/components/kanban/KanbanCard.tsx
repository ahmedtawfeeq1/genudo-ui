import React, { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Mail, Phone, DollarSign, MoreHorizontal, Eye, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
 
import { useToast } from '@/hooks/use-toast';
import { findConversationByOpportunityId } from '@/utils/conversationLookup';
import { type Opportunity } from './types';

interface KanbanCardProps {
  opportunity: Opportunity;
  index: number;
  onOpportunityUpdated: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  opportunity,
  index,
  onOpportunityUpdated
}) => {
  const [totalCost, setTotalCost] = useState<number>(0);
  const [inboxLoading, setInboxLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setTotalCost(0.02);
  }, [opportunity.id]);

  const fetchTotalCost = async () => setTotalCost(0.02);


  const handleOpenOpportunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/opportunity-detail/${opportunity.id}`);
  };


  // NEW: Handle inbox button click
  const handleOpenInbox = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setInboxLoading(true);
    
    try {
      navigate(`/inboxes/${opportunity.pipeline_id}`);
      toast({ title: "Success", description: "Opening inbox (static)" });
    } catch (error) {
      console.error('Error opening inbox:', error);
      toast({
        title: "Error",
        description: "Failed to open inbox. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInboxLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'won':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Draggable draggableId={opportunity.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`cursor-grab hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 relative ${
              snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : ''
            }`}
          >
            <CardContent className="p-4 space-y-4">
              {/* Header with status, cost, and three-dot menu */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge className={`text-xs px-2 py-1 flex-shrink-0 ${getStatusColor(opportunity.status)}`}>
                    {getStatusDisplay(opportunity.status)}
                  </Badge>
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200 flex-shrink-0">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Three-dot menu in top-right corner */}
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleOpenOpportunity}>
                        <Eye className="h-4 w-4 mr-2" />
                        Open opportunity
                      </DropdownMenuItem>
                      {/* NEW: Inbox button in dropdown */}
                      <DropdownMenuItem onClick={handleOpenInbox} disabled={inboxLoading}>
                        {inboxLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="h-4 w-4 mr-2" />
                        )}
                        Open inbox
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Title */}
              <h4 className="font-semibold text-sm leading-tight">
                {opportunity.opportunity_name}
              </h4>

              {/* Client info */}
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getInitials(opportunity.client_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {opportunity.client_name}
                </span>
              </div>

              {/* Contact details */}
              <div className="space-y-1">
                {opportunity.client_email && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{opportunity.client_email}</span>
                  </div>
                )}
                {opportunity.client_phone_number && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{opportunity.client_phone_number}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {opportunity.tags && (
                <div className="flex flex-wrap gap-1">
                  {opportunity.tags.split(',').slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {tag.trim()}
                    </Badge>
                  ))}
                  {opportunity.tags.split(',').length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-0 text-gray-500">
                      +{opportunity.tags.split(',').length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer with date */}
              <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>


    </>
  );
};

export default KanbanCard;

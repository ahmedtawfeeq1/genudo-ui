
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KanbanCard from './KanbanCard';
import { type Opportunity } from './types';

interface KanbanColumnProps {
  stageId: string;
  opportunities: Opportunity[];
  onAddOpportunity: (stageId: string) => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onOpportunityUpdate: () => void;
  searchQuery?: string;
  selectedTags?: string[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stageId,
  opportunities,
  onAddOpportunity,
  onOpportunityClick,
  onOpportunityUpdate,
  searchQuery = '',
  selectedTags = []
}) => {
  // Filter opportunities based on search query and tags
  const filteredOpportunities = opportunities.filter(opportunity => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        opportunity.opportunity_name.toLowerCase().includes(query) ||
        opportunity.client_name.toLowerCase().includes(query) ||
        (opportunity.client_email && opportunity.client_email.toLowerCase().includes(query)) ||
        (opportunity.client_phone_number && opportunity.client_phone_number.toLowerCase().includes(query)) ||
        (opportunity.opportunity_notes && opportunity.opportunity_notes.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      if (!opportunity.tags) return false;
      const opportunityTags = opportunity.tags.split(',').map((tag: string) => tag.trim());
      const hasMatchingTag = selectedTags.some(selectedTag => 
        opportunityTags.includes(selectedTag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Droppable droppableId={stageId} type="opportunity">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3 min-h-[500px] ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {filteredOpportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                onClick={() => onOpportunityClick(opportunity)}
              >
                <KanbanCard
                  opportunity={opportunity}
                  index={index}
                  onOpportunityUpdated={onOpportunityUpdate}
                />
              </div>
            ))}
            {provided.placeholder}
            
            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  {searchQuery ? 'No deals match your search' : 'No deals in this stage'}
                </p>
                {!searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onAddOpportunity(stageId)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Deal
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;

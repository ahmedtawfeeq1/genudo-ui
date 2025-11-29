import React from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import KanbanColumnHeader from './KanbanColumnHeader';
import KanbanColumn from './KanbanColumn';
import AddStageCard from './AddStageCard';
import { type Opportunity, type Stage } from './types';
interface KanbanLayoutProps {
  stages: Stage[];
  opportunities: Opportunity[];
  searchQuery: string;
  selectedTags?: string[];
  onDragEnd: (result: DropResult) => void;
  onAddOpportunity: (stageId: string) => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onOpportunityUpdate: () => void;
  onEditStage: (stage: Stage) => void;
  onStageAutomations: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
  onAddStage: () => void;
}
const KanbanLayout: React.FC<KanbanLayoutProps> = ({
  stages,
  opportunities,
  searchQuery,
  selectedTags = [],
  onDragEnd,
  onAddOpportunity,
  onOpportunityClick,
  onOpportunityUpdate,
  onEditStage,
  onStageAutomations,
  onDeleteStage,
  onAddStage
}) => {
  const getOpportunitiesForStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage_id === stageId);
  };
  return <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full flex flex-col">
        {/* UNIFIED SCROLLABLE CONTAINER - Single container for both headers and content */}
        <div className="flex-1 overflow-hidden">
          {/* Outer container that matches the pipeline actions container width */}
          <div className="h-full overflow-x-auto">
            {/* Inner container with minimum width to enable horizontal scrolling */}
            <div className="min-w-max h-full flex flex-col">
              
              {/* STICKY HEADERS - Position sticky at top of Kanban area */}
              <div className="sticky top-0 z-20 bg-background border-b border-border flex-shrink-0 shadow-sm">
                <Droppable droppableId="stages" type="stage" direction="horizontal">
                  {provided => <div ref={provided.innerRef} className="flex gap-4 py-4 mx-[20px]">
                      {stages.map((stage, index) => <KanbanColumnHeader key={stage.id} stage={stage} index={index} opportunityCount={getOpportunitiesForStage(stage.id).length} onAddOpportunity={onAddOpportunity} onEditStage={onEditStage} onStageAutomations={onStageAutomations} onDeleteStage={onDeleteStage} />)}
                      {provided.placeholder}
                      
                      {/* Add Stage Card Header */}
                      <div className="flex-shrink-0 w-80">
                        <AddStageCard onAddStage={onAddStage} />
                      </div>
                      
                      {stages.length === 0 && <div className="flex items-center justify-center w-full h-full min-h-[80px]">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">No stages found</h3>
                            <p className="text-muted-foreground">Create stages for this pipeline to start organizing opportunities.</p>
                          </div>
                        </div>}
                    </div>}
                </Droppable>
              </div>

              {/* CONTENT AREA - Takes remaining space, aligned with headers */}
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-4 py-4 h-full mx-[20px]">
                  {stages.map(stage => <KanbanColumn key={stage.id} stageId={stage.id} opportunities={getOpportunitiesForStage(stage.id)} onAddOpportunity={onAddOpportunity} onOpportunityClick={onOpportunityClick} onOpportunityUpdate={onOpportunityUpdate} searchQuery={searchQuery} selectedTags={selectedTags} />)}
                  
                  {/* Empty Add Stage Column Body */}
                  <div className="flex-shrink-0 w-80">
                    <div className="bg-muted/30 rounded-lg border border-border p-4 min-h-[400px] flex items-center justify-center">
                      <p className="text-muted-foreground text-sm text-center">Add stages above to organize your deals</p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>;
};
export default KanbanLayout;
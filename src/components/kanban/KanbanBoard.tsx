
import React, { useState, useCallback } from 'react';
import { useKanbanData } from '@/hooks/useKanbanData';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import KanbanLayout from './KanbanLayout';
import CreateOpportunityDialog from '@/components/opportunities/CreateOpportunityDialog';
import OpportunityDetailDialog from './OpportunityDetailDialog';
import StageEditDialog from './StageEditDialog';
import StageAutomationsDialog from './StageAutomationsDialog';
import DeleteStageDialog from './DeleteStageDialog';
import CreateStageDialog from './CreateStageDialog';
import { type Opportunity, type Stage } from './types';
import { DateRange } from 'react-day-picker';

interface KanbanBoardProps {
  pipelineId: string;
  pipelineName?: string;
  onMetricsUpdate?: () => void;
  searchQuery?: string;
  selectedTags?: string[];
  dateRange?: DateRange;
  aiStatus?: "all" | "paused" | "active";
  opportunityStatuses?: string[];
  priorities?: string[];
  tagFilterMode?: 'AND' | 'OR';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  pipelineId,
  pipelineName,
  onMetricsUpdate,
  searchQuery = '',
  selectedTags = [],
  dateRange,
  aiStatus = 'all',
  opportunityStatuses = [],
  priorities = [],
  tagFilterMode = 'OR'
}) => {
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedStageForEdit, setSelectedStageForEdit] = useState<Stage | null>(null);
  const [selectedStageForAutomations, setSelectedStageForAutomations] = useState<Stage | null>(null);
  const [selectedStageForDelete, setSelectedStageForDelete] = useState<Stage | null>(null);
  const [createStageId, setCreateStageId] = useState<string>('');

  const {
    stages,
    opportunities,
    loading,
    setStages,
    setOpportunities,
    fetchKanbanData
  } = useKanbanData(
    pipelineId,
    dateRange?.from,
    dateRange?.to,
    aiStatus,
    opportunityStatuses,
    priorities
  );

  const { handleDragEnd } = useKanbanDragDrop({
    stages,
    opportunities,
    setStages,
    setOpportunities,
    fetchKanbanData,
    onMetricsUpdate
  });

  const handleAddOpportunity = (stageId: string) => {
    setCreateStageId(stageId);
    setShowCreateOpportunity(true);
  };

  const handleOpportunityCreated = useCallback((newOpportunity?: any) => {
    if (newOpportunity) {
      // Optimistic update
      setOpportunities(prev => [newOpportunity, ...prev]);
    }
    fetchKanbanData();
    setShowCreateOpportunity(false);
    setCreateStageId('');
  }, [fetchKanbanData, setOpportunities]);

  const handleOpportunityClick = (opportunity: Opportunity) => {
    const stageName = stages.find(s => s.id === opportunity.stage_id)?.stage_name;
    setSelectedOpportunity({
      ...opportunity,
      pipeline_name: pipelineName,
      stage_name: stageName,
    });
  };

  const handleOpportunityUpdated = useCallback(() => {
    fetchKanbanData();
    setSelectedOpportunity(null);
  }, [fetchKanbanData]);

  const handleEditStage = (stage: Stage) => {
    setSelectedStageForEdit(stage);
  };

  const handleStageAutomations = (stage: Stage) => {
    setSelectedStageForAutomations(stage);
  };

  const handleDeleteStage = (stage: Stage) => {
    setSelectedStageForDelete(stage);
  };

  const handleStageCreated = useCallback(() => {
    fetchKanbanData();
    setShowCreateStage(false);
  }, [fetchKanbanData]);

  // Client-side tag filtering - filter opportunities based on selected tags and mode
  const filteredOpportunities = React.useMemo(() => {
    if (!selectedTags || selectedTags.length === 0) {
      return opportunities;
    }

    return opportunities.filter(opp => {
      // Get opportunity tags (handle both string and array formats)
      let oppTags: string[] = [];
      if (typeof opp.tags === 'string') {
        oppTags = opp.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      } else if (Array.isArray(opp.tags)) {
        oppTags = opp.tags;
      }

      if (tagFilterMode === 'AND') {
        // Check if opportunity has ALL selected tags (AND logic)
        return selectedTags.every(selectedTag =>
          oppTags.some(oppTag => oppTag.toLowerCase() === selectedTag.toLowerCase())
        );
      } else {
        // Check if opportunity has ANY selected tags (OR logic)
        return selectedTags.some(selectedTag =>
          oppTags.some(oppTag => oppTag.toLowerCase() === selectedTag.toLowerCase())
        );
      }
    });
  }, [opportunities, selectedTags, tagFilterMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <KanbanLayout
        stages={stages}
        opportunities={filteredOpportunities}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        onDragEnd={handleDragEnd}
        onAddOpportunity={handleAddOpportunity}
        onOpportunityClick={handleOpportunityClick}
        onOpportunityUpdate={fetchKanbanData}
        onEditStage={handleEditStage}
        onStageAutomations={handleStageAutomations}
        onDeleteStage={handleDeleteStage}
        onAddStage={() => setShowCreateStage(true)}
      />

      <CreateOpportunityDialog
        open={showCreateOpportunity}
        onOpenChange={setShowCreateOpportunity}
        onSuccess={handleOpportunityCreated}
        defaultPipelineId={pipelineId}
        defaultStageId={createStageId}
      />

      <CreateStageDialog
        pipelineId={pipelineId}
        open={showCreateStage}
        onOpenChange={setShowCreateStage}
        onSuccess={handleStageCreated}
      />

      {selectedOpportunity && (
        <OpportunityDetailDialog
          opportunity={selectedOpportunity}
          open={!!selectedOpportunity}
          onOpenChange={(open) => !open && setSelectedOpportunity(null)}
          onSuccess={handleOpportunityUpdated}
        />
      )}

      {selectedStageForEdit && (
        <StageEditDialog
          stage={selectedStageForEdit}
          open={!!selectedStageForEdit}
          onOpenChange={(open) => !open && setSelectedStageForEdit(null)}
          onSuccess={fetchKanbanData}
        />
      )}

      {selectedStageForAutomations && (
        <StageAutomationsDialog
          stage={selectedStageForAutomations}
          open={!!selectedStageForAutomations}
          onOpenChange={(open) => !open && setSelectedStageForAutomations(null)}
          onSuccess={fetchKanbanData}
        />
      )}

      <DeleteStageDialog
        stage={selectedStageForDelete}
        open={!!selectedStageForDelete}
        onOpenChange={(open) => !open && setSelectedStageForDelete(null)}
        onSuccess={fetchKanbanData}
      />
    </div>
  );
};

export default KanbanBoard;

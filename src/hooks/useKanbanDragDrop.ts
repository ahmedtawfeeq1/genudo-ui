
import { DropResult } from '@hello-pangea/dnd';
import { db } from "@/lib/mock-db";
import { useToast } from '@/hooks/use-toast';
import { type Opportunity, type Stage } from '@/components/kanban/types';
import { triggerOpportunityOutreachWebhook } from '@/utils/opportunityWebhook';

interface UseKanbanDragDropProps {
  stages: Stage[];
  opportunities: Opportunity[];
  setStages: (stages: Stage[]) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
  fetchKanbanData: () => void;
  onMetricsUpdate?: () => void;
}

export function useKanbanDragDrop({
  stages,
  opportunities,
  setStages,
  setOpportunities,
  fetchKanbanData,
  onMetricsUpdate
}: UseKanbanDragDropProps) {
  const { toast } = useToast();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle stage reordering
    if (type === 'stage') {
      const reorderedStages = Array.from(stages);
      const [movedStage] = reorderedStages.splice(source.index, 1);
      reorderedStages.splice(destination.index, 0, movedStage);

      // Update UI optimistically
      setStages(reorderedStages);

      // Static mode: no backend updates, show success toast
      toast({ title: "Success", description: "Stage order updated (static)" });
      return;
    }

    // Handle opportunity movement between stages
    await handleOpportunityMove(draggableId, destination.droppableId);
  };

  const handleOpportunityMove = async (opportunityId: string, newStageId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);

    if (!opportunity) {
      console.error('Opportunity not found:', opportunityId);
      return;
    }

    // Find the target stage to check its nature
    const targetStage = stages.find(s => s.id === newStageId);
    if (!targetStage) {
      console.error('Target stage not found:', newStageId);
      return;
    }

    console.log(`Moving opportunity ${opportunityId} to stage ${newStageId} with nature ${targetStage.stage_nature}`);

    // Determine the new status based on stage nature
    let newStatus = opportunity.status; // Keep current status by default
    
    if (targetStage.stage_nature === 'won') {
      newStatus = 'won';
      console.log('🎯 Moving to WON stage - updating opportunity status to WON');
    } else if (targetStage.stage_nature === 'lost') {
      newStatus = 'lost';
      console.log('❌ Moving to LOST stage - updating opportunity status to LOST');
    } else if (targetStage.stage_nature === 'neutral') {
      // If moving from a won/lost stage to neutral, set status to active
      if (opportunity.status === 'won' || opportunity.status === 'lost') {
        newStatus = 'active';
        console.log('🔄 Moving from won/lost to neutral stage - updating opportunity status to ACTIVE');
      }
    }

    // Optimistically update the UI with both stage and status changes
    const updatedOpportunities = opportunities.map(opp =>
      opp.id === opportunityId 
        ? { ...opp, stage_id: newStageId, status: newStatus } 
        : opp
    );
    setOpportunities(updatedOpportunities);

    // Static mode: show toast and optionally trigger webhook
    let toastMessage = "Opportunity moved successfully";
    if (newStatus !== opportunity.status) {
      toastMessage = `Opportunity moved and status updated to ${newStatus.toUpperCase()}`;
    }

    if (targetStage.opening_message) {
      try {
        await triggerOpportunityOutreachWebhook(opportunityId);
        toast({ title: "Stage Updated", description: `${toastMessage}! Automated outreach has been triggered.` });
      } catch {
        toast({ title: "Stage Updated", description: `${toastMessage}, but automated outreach may have failed.` });
      }
    } else {
      toast({ title: "Stage Updated", description: toastMessage });
    }

    if (onMetricsUpdate) onMetricsUpdate();
  };

  return { handleDragEnd };
}

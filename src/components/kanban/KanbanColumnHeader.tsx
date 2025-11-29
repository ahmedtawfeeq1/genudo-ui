import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type Stage } from './types';
interface KanbanColumnHeaderProps {
  stage: Stage;
  index: number;
  opportunityCount: number;
  onAddOpportunity: (stageId: string) => void;
  onEditStage: (stage: Stage) => void;
  onStageAutomations: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
}
const KanbanColumnHeader: React.FC<KanbanColumnHeaderProps> = ({
  stage,
  index,
  opportunityCount,
  onAddOpportunity,
  onEditStage,
  onStageAutomations,
  onDeleteStage
}) => {
  const getStageColor = (stageName: string) => {
    const colors = ['bg-blue-100 border-blue-300 text-blue-800', 'bg-yellow-100 border-yellow-300 text-yellow-800', 'bg-purple-100 border-purple-300 text-purple-800', 'bg-green-100 border-green-300 text-green-800', 'bg-red-100 border-red-300 text-red-800', 'bg-indigo-100 border-indigo-300 text-indigo-800'];
    const hash = stageName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };
  return <Draggable draggableId={stage.id} index={index}>
      {(provided, snapshot) => <div ref={provided.innerRef} {...provided.draggableProps} className={`flex-shrink-0 w-80 bg-background border border-border rounded-lg min-h-[80px] ${snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105' : ''}`}>
          <div className="px-4 h-full flex items-center justify-between py-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing flex-shrink-0 mt-0.5">
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <Badge className={`px-2 py-1 text-xs font-medium border self-start ${getStageColor(stage.stage_name)}`}>
                  <span className="truncate max-w-[140px]" title={stage.stage_name}>
                    {stage.stage_name}
                  </span>
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {opportunityCount} deal{opportunityCount !== 1 ? 's' : ''}
                  </span>
                  {stage.opening_message && <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Outreach
                    </Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button variant="ghost" size="icon" onClick={() => onAddOpportunity(stage.id)} className="h-8 w-8 hover:bg-primary/10 flex-shrink-0">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditStage(stage)}>
                    Edit Stage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStageAutomations(stage)}>
                    Actions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => onDeleteStage(stage)}>
                    Delete Stage
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>}
    </Draggable>;
};
export default KanbanColumnHeader;

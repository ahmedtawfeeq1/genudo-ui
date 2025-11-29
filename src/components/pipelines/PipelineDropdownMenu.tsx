
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Archive, Copy, ArchiveRestore } from 'lucide-react';

interface PipelineDropdownMenuProps {
  pipelineId: string;
  onEdit: (pipelineId: string) => void;
  onArchive: (pipelineId: string) => void;
  onUnarchive?: (pipelineId: string) => void;
  onDuplicate: (pipelineId: string) => void;
  duplicating: boolean;
  showArchive: boolean;
  isArchived?: boolean;
}

const PipelineDropdownMenu: React.FC<PipelineDropdownMenuProps> = ({
  pipelineId,
  onEdit,
  onArchive,
  onUnarchive,
  onDuplicate,
  duplicating,
  showArchive,
  isArchived = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(pipelineId)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Pipeline
        </DropdownMenuItem>
        
        {showArchive && (
          <DropdownMenuItem onClick={() => onArchive(pipelineId)}>
            <Archive className="h-4 w-4 mr-2" />
            Archive Pipeline
          </DropdownMenuItem>
        )}
        
        {isArchived && onUnarchive && (
          <DropdownMenuItem onClick={() => onUnarchive(pipelineId)}>
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Unarchive Pipeline
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDuplicate(pipelineId)}
          disabled={duplicating}
        >
          <Copy className="h-4 w-4 mr-2" />
          {duplicating ? 'Duplicating...' : 'Duplicate Pipeline'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PipelineDropdownMenu;

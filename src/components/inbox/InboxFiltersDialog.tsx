
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import InboxFilters, { Channel, SortOption, OpportunityStatus, Priority } from "@/components/inbox/InboxFilters";

interface InboxFiltersDialogProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  selectedChannels: Channel[];
  setSelectedChannels: (channels: Channel[]) => void;
  availableChannels?: Channel[];
  aiStatus: "all" | "paused" | "active";
  setAiStatus: (status: "all" | "paused" | "active") => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  tagsLogic: 'AND' | 'OR';
  setTagsLogic: (logic: 'AND' | 'OR') => void;
  selectedOpportunityStatuses?: OpportunityStatus[];
  setSelectedOpportunityStatuses?: (statuses: OpportunityStatus[]) => void;
  selectedPriorities?: Priority[];
  setSelectedPriorities?: (priorities: Priority[]) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const InboxFiltersDialog: React.FC<InboxFiltersDialogProps> = ({
  dateRange,
  setDateRange,
  selectedChannels,
  setSelectedChannels,
  availableChannels = [],
  aiStatus,
  setAiStatus,
  selectedTags,
  setSelectedTags,
  availableTags,
  tagsLogic,
  setTagsLogic,
  selectedOpportunityStatuses = [],
  setSelectedOpportunityStatuses = () => { },
  selectedPriorities = [],
  setSelectedPriorities = () => { },
  onResetFilters,
  activeFiltersCount,
  open,
  setOpen
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Conversations</DialogTitle>
          <DialogDescription>
            Select filter categories to refine your conversation list
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <InboxFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedChannels={selectedChannels}
            setSelectedChannels={setSelectedChannels}
            availableChannels={availableChannels}
            aiStatus={aiStatus}
            setAiStatus={setAiStatus}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            tagsLogic={tagsLogic}
            setTagsLogic={setTagsLogic}
            selectedOpportunityStatuses={selectedOpportunityStatuses}
            setSelectedOpportunityStatuses={setSelectedOpportunityStatuses}
            selectedPriorities={selectedPriorities}
            setSelectedPriorities={setSelectedPriorities}
            onResetFilters={onResetFilters}
          />
        </div>
        <DialogFooter>
          <Button onClick={onResetFilters} variant="outline">Reset All</Button>
          <Button type="submit" onClick={() => setOpen(false)}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InboxFiltersDialog;

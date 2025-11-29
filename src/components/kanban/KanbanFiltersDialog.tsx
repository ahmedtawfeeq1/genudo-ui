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
import KanbanFilters, { OpportunityStatus, Priority } from "@/components/kanban/KanbanFilters";

interface KanbanFiltersDialogProps {
    dateRange: DateRange | undefined;
    setDateRange: (dateRange: DateRange | undefined) => void;
    aiStatus: "all" | "paused" | "active";
    setAiStatus: (status: "all" | "paused" | "active") => void;
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    availableTags: string[];
    selectedOpportunityStatuses: OpportunityStatus[];
    setSelectedOpportunityStatuses: (statuses: OpportunityStatus[]) => void;
    selectedPriorities: Priority[];
    setSelectedPriorities: (priorities: Priority[]) => void;
    onResetFilters: () => void;
    activeFiltersCount: number;
    open: boolean;
    setOpen: (open: boolean) => void;
    tagFilterMode?: 'AND' | 'OR';
    setTagFilterMode?: (mode: 'AND' | 'OR') => void;
    onApply: () => void;
}

const KanbanFiltersDialog: React.FC<KanbanFiltersDialogProps> = ({
    dateRange,
    setDateRange,
    aiStatus,
    setAiStatus,
    selectedTags,
    setSelectedTags,
    availableTags,
    selectedOpportunityStatuses,
    setSelectedOpportunityStatuses,
    selectedPriorities,
    setSelectedPriorities,
    onResetFilters,
    activeFiltersCount,
    open,
    setOpen,
    tagFilterMode,
    setTagFilterMode,
    onApply
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter Opportunities</DialogTitle>
                    <DialogDescription>
                        Select filter categories to refine your opportunity list
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <KanbanFilters
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        aiStatus={aiStatus}
                        setAiStatus={setAiStatus}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        availableTags={availableTags}
                        selectedOpportunityStatuses={selectedOpportunityStatuses}
                        setSelectedOpportunityStatuses={setSelectedOpportunityStatuses}
                        selectedPriorities={selectedPriorities}
                        setSelectedPriorities={setSelectedPriorities}

                        tagFilterMode={tagFilterMode}
                        setTagFilterMode={setTagFilterMode}
                        onResetFilters={onResetFilters}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={onResetFilters} variant="outline">Reset All</Button>
                    <Button type="submit" onClick={() => { onApply(); setOpen(false); }}>
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KanbanFiltersDialog;

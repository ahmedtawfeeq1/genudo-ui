import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type OpportunityStatus = "active" | "pending" | "won" | "lost";
export type Priority = "high" | "normal" | "low";

interface KanbanFiltersProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    aiStatus: "all" | "paused" | "active";
    setAiStatus: (status: "all" | "paused" | "active") => void;
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    availableTags: string[];
    selectedOpportunityStatuses: OpportunityStatus[];
    setSelectedOpportunityStatuses: (statuses: OpportunityStatus[]) => void;
    selectedPriorities: Priority[];
    setSelectedPriorities: (priorities: Priority[]) => void;
    tagFilterMode?: 'AND' | 'OR';
    setTagFilterMode?: (mode: 'AND' | 'OR') => void;
    onResetFilters: () => void;
}

const opportunityStatusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" }
];

const priorityOptions = [
    { value: "high", label: "High" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Low" }
];

const KanbanFilters: React.FC<KanbanFiltersProps> = ({
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
    tagFilterMode,
    setTagFilterMode,
    onResetFilters
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const toggleOpportunityStatus = (status: OpportunityStatus) => {
        if (selectedOpportunityStatuses.includes(status)) {
            setSelectedOpportunityStatuses(selectedOpportunityStatuses.filter(s => s !== status));
        } else {
            setSelectedOpportunityStatuses([...selectedOpportunityStatuses, status]);
        }
    };

    const togglePriority = (priority: Priority) => {
        if (selectedPriorities.includes(priority)) {
            setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
        } else {
            setSelectedPriorities([...selectedPriorities, priority]);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getFilterCount = (section: string) => {
        switch (section) {
            case 'dateRange':
                return dateRange ? 1 : 0;
            case 'tags':
                return selectedTags.length;
            case 'aiStatus':
                return aiStatus !== 'all' ? 1 : 0;
            case 'opportunityStatus':
                return selectedOpportunityStatuses.length;
            case 'priority':
                return selectedPriorities.length;
            default:
                return 0;
        }
    };

    return (
        <div className="space-y-4">
            {/* Category Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Date Range Button - Full Width */}
                <Button
                    variant={expandedSection === 'dateRange' ? 'default' : 'outline'}
                    className="justify-between h-auto py-3 col-span-2"
                    onClick={() => toggleSection('dateRange')}
                >
                    <span>Date Range</span>
                    {getFilterCount('dateRange') > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {getFilterCount('dateRange')}
                        </Badge>
                    )}
                </Button>

                {/* Tags Button */}
                <Button
                    variant={expandedSection === 'tags' ? 'default' : 'outline'}
                    className="justify-between h-auto py-3"
                    onClick={() => toggleSection('tags')}
                >
                    <span>Tags</span>
                    {getFilterCount('tags') > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {getFilterCount('tags')}
                        </Badge>
                    )}
                </Button>

                {/* Priority Button */}
                <Button
                    variant={expandedSection === 'priority' ? 'default' : 'outline'}
                    className="justify-between h-auto py-3"
                    onClick={() => toggleSection('priority')}
                >
                    <span>Priority</span>
                    {getFilterCount('priority') > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {getFilterCount('priority')}
                        </Badge>
                    )}
                </Button>

                {/* AI Status Button */}
                <Button
                    variant={expandedSection === 'aiStatus' ? 'default' : 'outline'}
                    className="justify-between h-auto py-3"
                    onClick={() => toggleSection('aiStatus')}
                >
                    <span>AI Status</span>
                    {getFilterCount('aiStatus') > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {getFilterCount('aiStatus')}
                        </Badge>
                    )}
                </Button>

                {/* Opportunity Status Button */}
                <Button
                    variant={expandedSection === 'opportunityStatus' ? 'default' : 'outline'}
                    className="justify-between h-auto py-3"
                    onClick={() => toggleSection('opportunityStatus')}
                >
                    <span>Opportunity Status</span>
                    {getFilterCount('opportunityStatus') > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {getFilterCount('opportunityStatus')}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Expanded Section Content */}
            {expandedSection && (
                <div className="border rounded-lg p-4 bg-gray-50">
                    {/* Date Range Section */}
                    {expandedSection === 'dateRange' && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Select Date Range</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "MMM d, yyyy")
                                            )
                                        ) : (
                                            "Pick a date range"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        className={cn("p-3")}
                                    />
                                    <div className="flex justify-end gap-2 p-3 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDateRange(undefined)}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Tags Section */}
                    {expandedSection === 'tags' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Select Tags</Label>
                                {setTagFilterMode && (
                                    <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                                        <button
                                            className={cn(
                                                "px-2 py-1 text-xs rounded-sm transition-colors",
                                                tagFilterMode === 'OR' ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setTagFilterMode('OR')}
                                        >
                                            Any
                                        </button>
                                        <button
                                            className={cn(
                                                "px-2 py-1 text-xs rounded-sm transition-colors",
                                                tagFilterMode === 'AND' ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setTagFilterMode('AND')}
                                        >
                                            All
                                        </button>
                                    </div>
                                )}
                            </div>
                            {availableTags.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {availableTags.map((tag) => (
                                        <div key={tag} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`tag-${tag}`}
                                                checked={selectedTags.includes(tag)}
                                                onCheckedChange={() => toggleTag(tag)}
                                            />
                                            <label
                                                htmlFor={`tag-${tag}`}
                                                className="text-sm cursor-pointer flex-1"
                                            >
                                                {tag}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">No tags available</div>
                            )}
                        </div>
                    )}

                    {/* AI Status Section */}
                    {expandedSection === 'aiStatus' && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">AI Status</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ai-all"
                                        checked={aiStatus === "all"}
                                        onCheckedChange={() => setAiStatus("all")}
                                    />
                                    <label htmlFor="ai-all" className="text-sm cursor-pointer flex-1">
                                        All
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ai-active"
                                        checked={aiStatus === "active"}
                                        onCheckedChange={() => setAiStatus("active")}
                                    />
                                    <label htmlFor="ai-active" className="text-sm cursor-pointer flex-1">
                                        AI Active
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ai-paused"
                                        checked={aiStatus === "paused"}
                                        onCheckedChange={() => setAiStatus("paused")}
                                    />
                                    <label htmlFor="ai-paused" className="text-sm cursor-pointer flex-1">
                                        AI Paused
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Opportunity Status Section */}
                    {expandedSection === 'opportunityStatus' && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Opportunity Status</Label>
                            <div className="space-y-2">
                                {opportunityStatusOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`opp-status-${option.value}`}
                                            checked={selectedOpportunityStatuses.includes(option.value as OpportunityStatus)}
                                            onCheckedChange={() => toggleOpportunityStatus(option.value as OpportunityStatus)}
                                        />
                                        <label
                                            htmlFor={`opp-status-${option.value}`}
                                            className="text-sm cursor-pointer flex-1"
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Priority Section */}
                    {expandedSection === 'priority' && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Priority</Label>
                            <div className="space-y-2">
                                {priorityOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`priority-${option.value}`}
                                            checked={selectedPriorities.includes(option.value as Priority)}
                                            onCheckedChange={() => togglePriority(option.value as Priority)}
                                        />
                                        <label
                                            htmlFor={`priority-${option.value}`}
                                            className="text-sm cursor-pointer flex-1"
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KanbanFilters;


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

export type Channel = "all" | "MESSENGER" | "WHATSAPP" | "TELEGRAM" | "WEBCHAT" | "LINKEDIN" | "GMAIL" | "EMAIL" | "IMAP" | "OUTLOOK";
export type SortOption = "newest" | "oldest" | "most-messages" | "least-messages";
export type OpportunityStatus = "active" | "pending" | "won" | "lost";
export type Priority = "high" | "normal" | "low";

interface InboxFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
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
}

// Helper function to get channel display name
const getChannelDisplayName = (channel: Channel): string => {
  const channelMap: Record<string, string> = {
    'all': 'All Channels',
    'MESSENGER': 'Messenger',
    'WHATSAPP': 'WhatsApp',
    'TELEGRAM': 'Telegram',
    'WEBCHAT': 'Web Chat',
    'LINKEDIN': 'LinkedIn',
    'GMAIL': 'Gmail',
    'EMAIL': 'Email',
    'IMAP': 'Email',
    'OUTLOOK': 'Outlook'
  };
  return channelMap[channel] || channel;
};

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

const InboxFilters: React.FC<InboxFiltersProps> = ({
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
  onResetFilters
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Build channel options from available channels
  const channelOptions = [
    { value: "all" as Channel, label: "All Channels" },
    ...availableChannels.map(ch => ({ value: ch, label: getChannelDisplayName(ch) }))
  ];

  const toggleChannel = (channel: Channel) => {
    if (channel === "all") {
      setSelectedChannels(["all"]);
      return;
    }

    let newChannels = [...selectedChannels];

    // Remove "all" if it's selected
    if (newChannels.includes("all")) {
      newChannels = newChannels.filter(c => c !== "all");
    }

    if (newChannels.includes(channel)) {
      newChannels = newChannels.filter(c => c !== channel);
      // If no channels are selected, default to "all"
      if (newChannels.length === 0) {
        newChannels = ["all"];
      }
    } else {
      newChannels.push(channel);
    }

    setSelectedChannels(newChannels);
  };

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
      case 'channels':
        return selectedChannels.includes('all') ? 0 : selectedChannels.length;
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
        {/* Date Range Button */}
        <Button
          variant={expandedSection === 'dateRange' ? 'default' : 'outline'}
          className="justify-between h-auto py-3"
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

        {/* Channels Button */}
        <Button
          variant={expandedSection === 'channels' ? 'default' : 'outline'}
          className="justify-between h-auto py-3"
          onClick={() => toggleSection('channels')}
        >
          <span>Channels</span>
          {getFilterCount('channels') > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getFilterCount('channels')}
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
                {selectedTags.length > 1 && (
                  <div className="flex items-center space-x-1 bg-white rounded-md border p-1">
                    <button
                      onClick={() => setTagsLogic('OR')}
                      className={cn(
                        "px-2 py-1 text-xs rounded-sm transition-colors",
                        tagsLogic === 'OR' ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                      )}
                    >
                      Any (OR)
                    </button>
                    <button
                      onClick={() => setTagsLogic('AND')}
                      className={cn(
                        "px-2 py-1 text-xs rounded-sm transition-colors",
                        tagsLogic === 'AND' ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                      )}
                    >
                      All (AND)
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

          {/* Channels Section */}
          {expandedSection === 'channels' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Channels</Label>
              <div className="space-y-2">
                {channelOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${option.value}`}
                      checked={selectedChannels.includes(option.value as Channel)}
                      onCheckedChange={() => toggleChannel(option.value as Channel)}
                    />
                    <label
                      htmlFor={`channel-${option.value}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
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

export default InboxFilters;

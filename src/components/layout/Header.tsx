import React from "react";
import { Bell, ChevronDown, Filter, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AgentSelector from "@/components/inbox/AgentSelector";
import PipelineSelector from "@/components/inbox/PipelineSelector";

interface Pipeline {
  id: string;
  pipeline_name: string;
}

interface Stage {
  id: string;
  name: string;
}

type HeaderProps = {
  title: string;
  dashboardType?: string;
  setDashboardType?: (type: string) => void;
  openFiltersDialog?: () => void;
  activeFiltersCount?: number;
  showAgentSelector?: boolean;
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string | null) => void;
  showPipelineSelector?: boolean;
  selectedPipelineId?: string | null;
  onSelectPipeline?: (pipelineId: string | null) => void;
  pipelines?: Pipeline[];
  showStageSelector?: boolean;
  availableStages?: Stage[];
  selectedStages?: string[];
  onStagesChange?: (stages: string[]) => void;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
  showSort?: boolean;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
};
const Header = ({
  title,
  dashboardType,
  setDashboardType,
  openFiltersDialog,
  activeFiltersCount = 0,
  showAgentSelector = false,
  selectedAgentId = null,
  onSelectAgent = () => {},
  showPipelineSelector = false,
  selectedPipelineId = null,
  onSelectPipeline = () => {},
  pipelines = [],
  showStageSelector = false,
  availableStages = [],
  selectedStages = [],
  onStagesChange = () => {},
  searchText = "",
  onSearchChange = () => {},
  showSearch = false,
  showSort = false,
  sortBy = "newest",
  onSortChange = () => {}
}: HeaderProps) => {
  const {
    signOut,
    user
  } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const handleProfileClick = () => {
    navigate('/profile');
  };
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'newest':
        return 'Newest first';
      case 'oldest':
        return 'Oldest first';
      case 'most-messages':
        return 'Most messages';
      case 'least-messages':
        return 'Least messages';
      default:
        return 'Newest first';
    }
  };

  return <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          
          {showAgentSelector && onSelectAgent && <AgentSelector selectedAgentId={selectedAgentId} onSelectAgent={onSelectAgent} className="ml-1" size="sm" />}

          {showPipelineSelector && onSelectPipeline && <PipelineSelector selectedPipelineId={selectedPipelineId} onSelectPipeline={onSelectPipeline} pipelines={pipelines} className="ml-1" size="sm" />}

          {/* Stage Selector - shows only when pipeline is selected */}
          {showStageSelector && onStagesChange && availableStages.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 ml-1">
                  <span>
                    {selectedStages.length > 0
                      ? `${selectedStages.length} Stage${selectedStages.length > 1 ? 's' : ''}`
                      : 'All Stages'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">Select Stages</div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onStagesChange(availableStages.map(s => s.name))}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onStagesChange([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableStages.map(stage => (
                      <div key={stage.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stage-${stage.id}`}
                          checked={selectedStages.includes(stage.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onStagesChange([...selectedStages, stage.name]);
                            } else {
                              onStagesChange(selectedStages.filter(s => s !== stage.name));
                            }
                          }}
                        />
                        <label
                          htmlFor={`stage-${stage.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {stage.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {dashboardType !== undefined && setDashboardType && <div className="flex items-center space-x-2">
            <Select value={dashboardType} onValueChange={setDashboardType}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Select Dashboard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interactions">Interactions Analysis</SelectItem>
                <SelectItem value="cost">Cost Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>}

        {/* Sort button */}
        {showSort && onSortChange && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-10">
                <ArrowUpDown className="h-4 w-4" />
                <span>{getSortLabel(sortBy)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most-messages">Most messages</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="least-messages">Least messages</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>}

        {/* Always show filter button if openFiltersDialog is provided */}
        {openFiltersDialog && <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-10" onClick={openFiltersDialog}>
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary hover:bg-primary/20">
                {activeFiltersCount}
              </Badge>}
          </Button>}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Conditional search input */}
        {showSearch && <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search conversations..." value={searchText} onChange={e => onSearchChange(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64" />
          </div>}
        
        {/* Notifications */}
        
        
        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline font-medium">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
};
export default Header;
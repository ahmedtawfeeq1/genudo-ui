
import * as React from "react";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X,
  Clock,
  Users,
  MessageSquare
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface AdvancedFiltersProps {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  agents: string[];
  channels: string[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AdvancedFilters({
  selectedAgent,
  setSelectedAgent,
  selectedChannel,
  setSelectedChannel,
  agents,
  channels,
  dateRange,
  setDateRange,
  open,
  setOpen
}: AdvancedFiltersProps) {
  const [activeTab, setActiveTab] = React.useState("time");
  
  // Preset date ranges
  const setPresetRange = (days: number) => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - days);
    setDateRange({ from, to: today });
  };

  // Reset all filters to default
  const resetFilters = () => {
    setSelectedAgent("all");
    setSelectedChannel("all");
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 7);
    setDateRange({ from, to: today });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Dashboard Filters</DialogTitle>
          <DialogDescription>
            Configure filters to customize your dashboard view.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="time" value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Time Period</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Agents</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Channels</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Time Period Tab */}
          <TabsContent value="time" className="space-y-4 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Date Range</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Presets</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8" 
                      onClick={() => setPresetRange(7)}
                    >
                      Last 7 days
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8" 
                      onClick={() => setPresetRange(30)}
                    >
                      Last 30 days
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8" 
                      onClick={() => setPresetRange(90)}
                    >
                      Last 90 days
                    </Button>
                  </div>
                </div>
                <div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    className="border rounded-md p-3 pointer-events-auto"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Select Agent</h4>
              <p className="text-xs text-muted-foreground">Filter data by specific agent or view all agents</p>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-4 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Select Channel</h4>
              <p className="text-xs text-muted-foreground">Filter data by specific communication channel</p>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channels.map((channel) => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
          >
            Reset All
          </Button>
          <Button 
            type="submit" 
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ExpandableTextarea } from "@/components/ui/expandable-textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Clock, Timer, RotateCcw, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  "UTC",
  "UTC+1",
  "UTC+2",
  "UTC+3",
  "UTC+4",
  "UTC+5",
  "UTC+6",
  "UTC+7",
  "UTC+8",
  "UTC+9",
  "UTC+10",
  "UTC+11",
  "UTC+12",
  "UTC-1",
  "UTC-2",
  "UTC-3",
  "UTC-4",
  "UTC-5",
  "UTC-6",
  "UTC-7",
  "UTC-8",
  "UTC-9",
  "UTC-10",
  "UTC-11",
  "UTC-12",
];

const INTERVAL_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
];

interface StageFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    follow_up_interval_value: number;
    follow_up_interval_unit: 'minutes' | 'hours' | 'days' | 'months';
    follow_up_time_of_day: string;
    follow_up_timezone: string;
    follow_up_max_occurrences: number;
    follow_up_delay_enabled?: boolean;
    follow_up_delay_days?: number;
    follow_up_delay_time_of_day?: string;
    follow_up_instructions?: string;
    follow_up_assets?: string;
    opening_message?: boolean;
  };
  onInputChange: (field: string, value: any) => void;
  onSave: () => void;
  loading?: boolean;
}

export const StageFollowUpDialog: React.FC<StageFollowUpDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSave,
  loading,
}) => {
  const [instructionsOpen, setInstructionsOpen] = React.useState(false);
  const [assetsOpen, setAssetsOpen] = React.useState(false);

  const handleFirstFollowUpDelayChange = (checked: boolean) => {
    if (checked && formData.opening_message) {
      // Show warning and disable opening message
      onInputChange("opening_message", false);
    }
    onInputChange("follow_up_delay_enabled", checked);
  };

  const isFirstFollowUpDelayDisabled = formData.opening_message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Configure Follow-up Activities
          </DialogTitle>
          <DialogDescription>
            Set up automated follow-up messages for opportunities in this stage. Configure timing, frequency, and content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* FIRST FOLLOW-UP SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium">First Follow-up</h3>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              {/* First Follow-up Delay Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="follow_up_delay_enabled" 
                    className={cn("text-sm font-medium", isFirstFollowUpDelayDisabled && "text-muted-foreground")}
                  >
                    Enable First Follow-up Delay
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add a delay before the first follow-up message
                  </p>
                </div>
                <Switch
                  id="follow_up_delay_enabled"
                  checked={formData.follow_up_delay_enabled || false}
                  onCheckedChange={handleFirstFollowUpDelayChange}
                  disabled={isFirstFollowUpDelayDisabled}
                />
              </div>

              {/* Warning when disabled due to opening message */}
              {isFirstFollowUpDelayDisabled && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-100 p-3 rounded border-amber-200 border">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Cannot enable with Opening Message</p>
                    <p className="text-xs">Opening messages are sent immediately when opportunities enter the stage, making follow-up delays unnecessary. Disable "Send Opening Message" to use this feature.</p>
                  </div>
                </div>
              )}

              {/* First Follow-up Configuration (shown when delay is enabled) */}
              {formData.follow_up_delay_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-200 pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="follow_up_delay_days">Days to Wait</Label>
                    <Input
                      id="follow_up_delay_days"
                      type="number"
                      min={1}
                      max={365}
                      value={formData.follow_up_delay_days || 1}
                      onChange={e => onInputChange('follow_up_delay_days', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Days to wait before first follow-up
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="follow_up_delay_time_of_day">Time of Day</Label>
                    <Input
                      id="follow_up_delay_time_of_day"
                      type="time"
                      value={formData.follow_up_delay_time_of_day || "09:00"}
                      onChange={e => onInputChange('follow_up_delay_time_of_day', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time for the first follow-up
                    </p>
                  </div>
                </div>
              )}

              {/* Notice when delay is not enabled */}
              {!formData.follow_up_delay_enabled && !isFirstFollowUpDelayDisabled && (
                <div className="text-sm text-muted-foreground border-t border-blue-200 pt-4">
                  Without delay enabled, the first follow-up will be scheduled based on the regular interval settings below.
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* SUBSEQUENT FOLLOW-UPS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium">Subsequent Follow-ups</h3>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <p className="text-xs text-muted-foreground">
                Configure how often to send follow-up messages after the first one.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="follow_up_interval_value">Interval Value</Label>
                  <Input
                    id="follow_up_interval_value"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.follow_up_interval_value}
                    onChange={e => onInputChange('follow_up_interval_value', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">How many units between follow-ups</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="follow_up_interval_unit">Interval Unit</Label>
                  <Select 
                    value={formData.follow_up_interval_unit} 
                    onValueChange={(value) => onInputChange('follow_up_interval_unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVAL_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time of Day for subsequent follow-ups (for days and months) */}
              {(formData.follow_up_interval_unit === 'days' || formData.follow_up_interval_unit === 'months') && (
                <div className="space-y-1">
                  <Label htmlFor="follow_up_time_of_day">Time of Day for Subsequent Follow-ups</Label>
                  <Input
                    id="follow_up_time_of_day"
                    type="time"
                    value={formData.follow_up_time_of_day}
                    onChange={e => onInputChange('follow_up_time_of_day', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time for subsequent follow-up messages (applies to days and months intervals)
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* GENERAL SETTINGS SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">General Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="follow_up_timezone">Timezone</Label>
                <Select value={formData.follow_up_timezone} onValueChange={(value) => onInputChange('follow_up_timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="follow_up_max_occurrences">Maximum Occurrences</Label>
                <Input
                  id="follow_up_max_occurrences"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.follow_up_max_occurrences}
                  onChange={e => onInputChange('follow_up_max_occurrences', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">Total follow-ups to send (1-100)</p>
              </div>
            </div>

            {/* Follow-up Instructions (expandable) */}
            <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-normal">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <Label className="cursor-pointer">Follow-up Instructions</Label>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", instructionsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <ExpandableTextarea
                  id="follow_up_instructions"
                  placeholder="Enter specific instructions for follow-up messages..."
                  value={formData.follow_up_instructions || ''}
                  onChange={(value) => onInputChange('follow_up_instructions', value)}
                  rows={4}
                  label="Follow-up Instructions"
                  description="These instructions will be included in the AI prompt when generating follow-up messages."
                />
                <p className="text-xs text-muted-foreground">
                  These instructions will be included in the AI prompt when generating follow-up messages.
                </p>
              </CollapsibleContent>
            </Collapsible>

            {/* Follow-up Assets (expandable) */}
            <Collapsible open={assetsOpen} onOpenChange={setAssetsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-normal">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <Label className="cursor-pointer">Follow-up Assets</Label>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", assetsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <ExpandableTextarea
                  id="follow_up_assets"
                  placeholder="Add assets like key features, unique selling points, or interest-capturing items..."
                  value={formData.follow_up_assets || ''}
                  onChange={(value) => onInputChange('follow_up_assets', value)}
                  rows={4}
                  label="Follow-up Assets"
                  description="Add a list of assets that could be used as follow-up items."
                />
                <p className="text-xs text-muted-foreground">
                  Add a list of assets that could be used as follow-up items, things like key features, unique selling points, or things that can capture user interest.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={!!loading}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

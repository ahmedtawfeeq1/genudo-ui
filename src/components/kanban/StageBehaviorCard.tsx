
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, MessageSquare, Info, AlertTriangle } from "lucide-react";

interface Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
  onAutomationsClick: () => void;
  onFollowUpClick: () => void;
  creating?: boolean;
}

const StageBehaviorCard: React.FC<Props> = ({
  formData,
  onInputChange,
  onAutomationsClick,
  onFollowUpClick,
  creating = false,
}) => {
  const handleOpeningMessageChange = (checked: boolean) => {
    if (checked && formData.follow_up_delay_enabled) {
      // Show warning and disable follow-up delay
      onInputChange("follow_up_delay_enabled", false);
    }
    onInputChange("opening_message", checked);
  };

  const isOpeningMessageDisabled = formData.follow_up_delay_enabled;
  const isFollowUpDelayConflicted = formData.opening_message && formData.follow_up_delay_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage Behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Opening Message */}
          <div className="flex flex-col gap-2 border-t pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="opening_message"
                  checked={formData.opening_message}
                  onCheckedChange={handleOpeningMessageChange}
                  disabled={isOpeningMessageDisabled}
                />
                <Label 
                  htmlFor="opening_message" 
                  className={isOpeningMessageDisabled ? "text-muted-foreground" : ""}
                >
                  Send Opening Message
                </Label>
              </div>
            </div>
            
            {isOpeningMessageDisabled && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertTriangle className="w-4 h-4" />
                <span>Disabled because First Follow-up Delay is enabled</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3 mr-1" />
              When enabled, an automated opening message will be sent when an opportunity enters this stage.
            </p>
          </div>

          {/* Requires Action and Configure Actions */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="requires_action"
                checked={formData.requires_action}
                onCheckedChange={(checked) => onInputChange("requires_action", checked)}
              />
              <Label htmlFor="requires_action">Requires Action</Label>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onAutomationsClick}
              className="flex items-center gap-2"
              disabled={creating || !formData.requires_action}
              title={
                creating
                  ? "Save this stage first to configure automations"
                  : !formData.requires_action
                  ? "Enable 'Requires Action' to configure automations"
                  : undefined
              }
            >
              <Zap className="h-4 w-4" />
              Configure Actions
            </Button>
          </div>
          {creating && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3 mr-1" />
              Please save this stage before configuring automations.
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3 mr-1" />
            When enabled, this stage will trigger automated actions that require user interaction or external API calls.
          </p>

          {/* Follow-up toggles and Configure Follow-up */}
          <div className="flex flex-col pt-2 border-t">
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="follow_up_enabled"
                checked={formData.follow_up_enabled}
                onCheckedChange={(checked) => onInputChange("follow_up_enabled", checked)}
              />
              <Label htmlFor="follow_up_enabled">Enable Follow-up Activities</Label>
              <Button
                variant="outline"
                type="button"
                size="sm"
                className="ml-auto flex items-center gap-2"
                onClick={onFollowUpClick}
                disabled={!formData.follow_up_enabled}
              >
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Configure Follow-up
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 mr-1" />
              When enabled, automated follow-ups will be sent at the interval you configure.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageBehaviorCard;

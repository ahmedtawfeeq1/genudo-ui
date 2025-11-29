
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTriggerConditions, type EnumOption } from "@/hooks/useEnumValues";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { db } from "@/lib/mock-db";
import type { StageAction, Stage } from "./types";
import ActionFormFields from "./ActionFormFields";

const REQUEST_TYPES: EnumOption[] = [
  { value: "post", label: "POST" },
  { value: "get", label: "GET" },
];

interface ActionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  action: StageAction;
  stage: Stage;
  userId: string;
}

const ActionEditDialog: React.FC<ActionEditDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  action,
  stage,
  userId,
}) => {
  const [formData, setFormData] = useState({
    action_name: action.action_name,
    webhook_url: action.webhook_url || "",
    trigger_condition: action.trigger_condition,
    request_type: action.request_type,
    is_active: action.is_active,
    required_fields: Array.isArray(action.required_fields)
      ? (action.required_fields as any[])
      : [],
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { options: triggerConditionOptions } = useTriggerConditions();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.action_name.trim()) {
      toast({
        title: "Error",
        description: "Action name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate required fields list
      const rf = (formData.required_fields as any[]).filter(f => f && f.name?.trim());
      if (rf.some(f => !f.notes || !f.name)) {
        throw new Error("Each required field must include name and capture notes");
      }

      const actionData = {
        action_name: formData.action_name.trim(),
        webhook_url: formData.webhook_url.trim() || null,
        trigger_condition: formData.trigger_condition,
        request_type: formData.request_type,
        is_active: formData.is_active,
        required_fields: rf,
        stage_id: stage.id,
        user_id: userId,
      };

      await new Promise(res => setTimeout(res, 300));

      toast({
        title: "Success",
        description: "Stage action updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stage action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Action: {action.action_name}
          </DialogTitle>
          <DialogDescription>
            Edit the settings of your automation action below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ActionFormFields
            values={{
              action_name: formData.action_name,
              webhook_url: formData.webhook_url,
              trigger_condition: formData.trigger_condition,
              is_active: formData.is_active,
              required_fields: formData.required_fields as any[],
            }}
            onChange={handleInputChange}
            triggerConditionOptions={triggerConditionOptions}
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Action"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActionEditDialog;

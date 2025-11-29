
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/mock-db";
import type { Stage } from "./types";

export type ActionType = "get_available_slots" | "book_meeting" | "collect_data" | "custom_action";
export type TriggerCondition = "on_stage_entry" | "on_user_message" | "post_response";
export type RecordingPolicy = "once" | "recurring";
export type RequestType = "post" | "get";

export const defaultForm = {
  action_name: "",
  webhook_url: "",
  trigger_condition: "on_stage_entry" as TriggerCondition,
  request_type: "post" as RequestType,
  is_active: true,
  required_fields: [] as any[],
};

export const useCreateActionForm = ({
  stage,
  userId,
  onSuccess,
  onOpenChange,
}: {
  stage: Stage;
  userId: string;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const [formData, setFormData] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => setFormData({ ...defaultForm });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.action_name.trim()) {
      toast({
        title: "Required Field",
        description: "Action name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate required fields list
      const rf = (formData.required_fields as any[]).filter(f => f && f.name?.trim());
      if (rf.length === 0) {
        throw new Error("Add at least one required field (name and notes)");
      }
      if (rf.some(f => !f.notes)) {
        throw new Error("Each required field must include capture notes");
      }

      const actionData = {
        action_name: formData.action_name.trim(),
        webhook_url: formData.webhook_url.trim() || null,
        trigger_condition: formData.trigger_condition as TriggerCondition,
        request_type: formData.request_type as RequestType,
        is_active: formData.is_active,
        required_fields: rf,
        stage_id: stage.id,
        user_id: userId,
      };

      const { error } = await db.from("stage_actions").insert(actionData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stage action created successfully.",
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Create",
        description: error.message || "Could not create stage action.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    resetForm,
    handleInputChange,
    handleSubmit,
  };
};

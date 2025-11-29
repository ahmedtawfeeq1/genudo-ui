
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { Stage } from "./types";
import { useCreateActionForm } from "./useCreateActionForm";
import ActionFormFields from "./ActionFormFields";

interface CreateActionFormProps {
  loading: boolean;
  formData: ReturnType<typeof useCreateActionForm>["formData"];
  handleInputChange: ReturnType<typeof useCreateActionForm>["handleInputChange"];
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  triggerConditionOptions: any;
}

export const CreateActionForm: React.FC<CreateActionFormProps> = ({
  loading,
  formData,
  handleInputChange,
  handleSubmit,
  onCancel,
  triggerConditionOptions,
}) => {
  return (
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
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Action"}
        </Button>
      </div>
    </form>
  );
};

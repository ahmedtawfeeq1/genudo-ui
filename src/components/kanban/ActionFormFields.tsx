import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EnumSelect } from "@/components/ui/enum-select";
import { Button } from "@/components/ui/button";

interface ActionFormFieldsProps {
  values: {
    action_name: string;
    webhook_url: string;
    trigger_condition: string;
    is_active: boolean;
    required_fields: any[];
  };
  onChange: (field: string, value: any) => void;
  triggerConditionOptions: any[];
}

const ActionFormFields: React.FC<ActionFormFieldsProps> = ({ values, onChange, triggerConditionOptions }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="action_name">Action Name *</Label>
          <Input
            id="action_name"
            value={values.action_name}
            onChange={(e) => onChange("action_name", e.target.value)}
            placeholder="Enter action name"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={values.is_active}
            onCheckedChange={(checked) => onChange("is_active", checked)}
          />
          <Label htmlFor="is_active">Action is active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook_url">Webhook URL</Label>
        <Input
          id="webhook_url"
          value={values.webhook_url}
          onChange={(e) => onChange("webhook_url", e.target.value)}
          placeholder="https://your-webhook-url.com/endpoint"
        />
        <p className="text-xs text-muted-foreground">
          Always use the <strong>Respond to Webhook</strong> node to return results back to the agent (e.g., available slots, order details).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trigger_condition">Trigger Condition *</Label>
          <EnumSelect
            options={triggerConditionOptions}
            value={values.trigger_condition}
            onValueChange={(value) => onChange("trigger_condition", value)}
            placeholder="Select trigger"
          />
        </div>
        {/* Request type defaults to POST internally; no UI control */}
      </div>

      <div className="space-y-2">
        <Label>Required Fields</Label>
        <div className="space-y-2">
          {(values.required_fields as any[]).map((f: any, idx: number) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Field name"
                value={f.name || ""}
                onChange={(e) => {
                  const next = [...(values.required_fields as any[])];
                  next[idx] = { ...next[idx], name: e.target.value };
                  onChange("required_fields", next);
                }}
              />
              <Input
                placeholder="Notes / How to capture"
                value={f.notes || ""}
                onChange={(e) => {
                  const next = [...(values.required_fields as any[])];
                  next[idx] = { ...next[idx], notes: e.target.value };
                  onChange("required_fields", next);
                }}
              />
              <Input
                placeholder="Example value(s)"
                value={f.examples || ""}
                onChange={(e) => {
                  const next = [...(values.required_fields as any[])];
                  next[idx] = { ...next[idx], examples: e.target.value };
                  onChange("required_fields", next);
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange("required_fields", [ ...(values.required_fields as any[]), { name: "", notes: "", examples: "" } ])}
          >
            Add Field
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionFormFields;

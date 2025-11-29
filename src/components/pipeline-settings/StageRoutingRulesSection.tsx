import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/mock-db";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Save, X, GitBranch } from "lucide-react";
import { ExpandableTextarea } from "@/components/ui/expandable-textarea";

interface Stage {
  id: string;
  stage_name: string;
  when_to_enter: string | null;
  when_to_exit: string | null;
  stage_position_index: number;
}

interface Props {
  stages: Stage[];
  onStagesUpdate: () => void;
  pipelineId: string;
}

const StageRoutingRulesSection: React.FC<Props> = ({ stages, onStagesUpdate, pipelineId }) => {
  // Inline edit state: map of stage id -> when_to_enter value
  const [editMap, setEditMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const sortedStages = [...stages].sort((a, b) => a.stage_position_index - b.stage_position_index);

  const handleChange = (stageId: string, value: string) => {
    setEditMap((prev) => ({ ...prev, [stageId]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Stage Routing Rules
        </CardTitle>
        <CardDescription>
          Configure when leads should enter each stage
        </CardDescription>
        <div className="ml-auto">
          <Button size="sm" onClick={async () => {
            setSaving(true);
            try {
              const routingArray = sortedStages.map(st => ({
                key: st.stage_name,
                cond: (editMap[st.id] ?? st.when_to_enter ?? "").trim()
              })).filter(item => {
                const cond = item.cond.toLowerCase().trim();
                if (!cond) return false;
                if (cond === 'n/a' || cond === 'na') return false;
                if (cond === 'no condition') return false;
                if (cond === 'null') return false;
                if (cond === 'undefined') return false;
                if (/^n\s*[\/\\]?\s*a$/.test(cond)) return false;
                return true;
              });
              const hasFollowUp = routingArray.some(item => item.key === 'FollowUp');
              if (!hasFollowUp) {
                routingArray.push({
                  key: 'FollowUp',
                  cond: 'User requests a follow-up AND provides a specific day/date and time. Do NOT raise until day/date and time is confirmed.'
                });
              }
              toast.success("Routing rules prepared (static)");
              onStagesUpdate();
            } catch (e: any) {
              toast.error(e.message || "Failed to save routing rules");
            } finally {
              setSaving(false);
            }
          }} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedStages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No stages found. Create stages to configure routing rules.
          </p>
        ) : (
          sortedStages.map((stage) => (
            <div key={stage.id} className="flex items-start gap-4 p-3 border rounded-md">
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate" title={stage.stage_name}>{stage.stage_name}</span>
              </div>
              <div className="flex-[3]">
                <Label htmlFor={`enter-${stage.id}`} className="text-xs font-semibold">When to enter this stage</Label>
                <ExpandableTextarea
                  id={`enter-${stage.id}`}
                  value={editMap[stage.id] ?? stage.when_to_enter ?? ""}
                  onChange={(value) => handleChange(stage.id, value)}
                  placeholder="Describe when leads should enter this stage..."
                  rows={2}
                  className="w-full"
                  hideOpenEditor
                />

              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default StageRoutingRulesSection;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Zap, Clock } from "lucide-react";
import type { StageAction } from "./types";

interface StageActionCardProps {
  action: StageAction;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

const StageActionCard: React.FC<StageActionCardProps> = ({
  action,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <Card
      className={`border-l-4 ${
        action.is_active ? "border-l-green-500" : "border-l-gray-300"
      } transition-shadow shadow-md hover:shadow-lg`}
    >
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-base">
              {action.action_name}
            </h4>
            <Badge variant={action.is_active ? "default" : "secondary"}>
              {action.is_active ? "Active" : "Inactive"}
            </Badge>
            {/* Action type removed from display */}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Trigger: {action.trigger_condition.replace(/_/g, " ")}
            </div>
            {/* Recording policy removed from list view */}
          </div>
          {action.webhook_url && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              URL: {action.webhook_url}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center flex-shrink-0 mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <Switch
              id={`action-toggle-${action.id}`}
              checked={action.is_active}
              onCheckedChange={() => onToggleActive()}
            />
            <span className="text-sm">{action.is_active ? "Active" : "Inactive"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            aria-label="Delete Action"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageActionCard;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StageActionCard from "./StageActionCard";
import type { StageAction } from "./types";

interface StageActionsListProps {
  actions: StageAction[];
  loading: boolean;
  onEdit: (action: StageAction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (action: StageAction) => void;
}

const StageActionsList: React.FC<StageActionsListProps> = ({
  actions,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading actions...
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No actions configured for this stage yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <StageActionCard
          key={action.id}
          action={action}
          onEdit={() => onEdit(action)}
          onDelete={() => onDelete(action.id)}
          onToggleActive={() => onToggleActive(action)}
        />
      ))}
    </div>
  );
};

export default StageActionsList;

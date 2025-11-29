
import { useState } from "react";
 
import type { StageAction } from "./types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for listing, toggling, and deleting stage actions.
 */
const useStageActions = ({
  stageId,
  userId,
  onSuccess,
}: {
  stageId: string;
  userId: string;
  onSuccess: () => void;
}) => {
  const [actions, setActions] = useState<StageAction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActions = async () => {
    setLoading(true);
    try {
      const demo: StageAction[] = [
        { id: `${stageId}-ex1`, stage_id: stageId, action_name: "EXAMPLE: Send Welcome Message", is_active: true, required_fields: [], trigger_condition: "on_stage_entry", webhook_url: null } as any,
        { id: `${stageId}-ex2`, stage_id: stageId, action_name: "EXAMPLE: Capture Email", is_active: true, required_fields: [{ name: "email", notes: "Extract from latest user message", examples: "alice@example.com" }], trigger_condition: "on_user_message", webhook_url: null } as any,
        { id: `${stageId}-ex3`, stage_id: stageId, action_name: "EXAMPLE: Book Meeting", is_active: false, required_fields: [{ name: "preferred_time", notes: "Ask user for preferred time slot", examples: "Tomorrow 2pm" }], trigger_condition: "post_response", webhook_url: null } as any,
        { id: `${stageId}-ex4`, stage_id: stageId, action_name: "EXAMPLE: Collect Company Name", is_active: false, required_fields: [{ name: "company_name", notes: "Infer from signature or ask directly", examples: "Acme Corp" }], trigger_condition: "on_user_message", webhook_url: null } as any,
      ];
      setActions(demo);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchActions();
    onSuccess();
  };

  const handleDelete = async (actionId: string) => {
    setLoading(true);
    setActions(prev => prev.filter(a => a.id !== actionId));
    toast({ title: "Deleted", description: "Stage action deleted (static)" });
    setLoading(false);
  };

  const handleToggleActive = async (action: StageAction) => {
    setLoading(true);
    setActions(prev => prev.map(a => a.id === action.id ? { ...a, is_active: !a.is_active } : a));
    toast({ title: "Action Updated", description: `Action is now ${!action.is_active ? "active" : "inactive"}` });
    setLoading(false);
  };

  return {
    actions,
    loading,
    fetchActions,
    handleEditSuccess,
    handleDelete,
    handleToggleActive,
  };
};

export default useStageActions;

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePageSafeguards } from "@/hooks/usePageSafeguards";
import { useConfirmDialog, useUnsavedChangesDialog } from "@/components/ui/confirm-dialog";

export interface Agent {
  id: string;
  name: string;
  external_agent_id: string;
}

export type StageNature = "neutral" | "won" | "lost";

export interface StageForm {
  stage_name: string;
  stage_description: string;
  external_stage_id: number | null;
  instructions: string;
  persona: string;
  example_messages: string;
  routing_array: any;
  assigned_agent_id: string;
  external_agent_id: string;
  stage_nature: StageNature;
  requires_action: boolean;
  opening_message: boolean;
  follow_up_enabled: boolean;
  follow_up_interval_value: number;
  follow_up_interval_unit: "minutes" | "hours" | "days" | "months";
  follow_up_time_of_day: string;
  follow_up_max_occurrences: number;
  follow_up_timezone: string;
  follow_up_delay_enabled: boolean;
  follow_up_delay_days: number;
  follow_up_delay_time_of_day: string;
  follow_up_instructions: string;
  follow_up_assets: string;
  when_to_enter: string;
  when_to_exit: string;
}

export const defaultStageForm: StageForm = {
  stage_name: "",
  stage_description: "",
  external_stage_id: null,
  instructions: "--",
  persona: "--",
  example_messages: "--",
  routing_array: null,
  assigned_agent_id: "unassigned",
  external_agent_id: "",
  stage_nature: "neutral",
  requires_action: false,
  opening_message: false,
  follow_up_enabled: false,
  follow_up_interval_value: 1,
  follow_up_interval_unit: "days",
  follow_up_time_of_day: "09:00",
  follow_up_max_occurrences: 1,
  follow_up_timezone: "UTC",
  follow_up_delay_enabled: false,
  follow_up_delay_days: 1,
  follow_up_delay_time_of_day: "09:00",
  follow_up_instructions: "",
  follow_up_assets: "",
  when_to_enter: "",
  when_to_exit: "",
};

interface Params {
  open: boolean;
  mode: "create" | "edit";
  stage?: any;
  pipelineId?: string;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useStageModalForm = ({
  open,
  mode,
  stage,
  pipelineId,
  onSuccess,
  onOpenChange,
}: Params) => {
  const user: any = { id: 'demo' };
  const { toast } = useToast();
  const [formData, setFormData] = useState<StageForm>(defaultStageForm);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoaded, setAgentsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasRestoredFromAutoSave, setHasRestoredFromAutoSave] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pipelineExternalAgentId, setPipelineExternalAgentId] = useState<string | null>(null);

  // Use refs to prevent unnecessary re-renders
  const initialFormDataRef = useRef<StageForm>(defaultStageForm);
  const lastUserChangeRef = useRef<number>(0);

  // New 3-option unsaved changes dialog
  const { UnsavedChangesDialog, showUnsavedChangesDialog } = useUnsavedChangesDialog();

  // Restore dialog state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreResolve, setRestoreResolve] = useState<((value: boolean) => void) | null>(null);

  const askForRestore = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setRestoreResolve(() => resolve);
      setShowRestoreDialog(true);
    });
  }, []);

  const handleRestoreConfirm = useCallback(() => {
    if (restoreResolve) {
      restoreResolve(true);
      setRestoreResolve(null);
    }
    setShowRestoreDialog(false);
  }, [restoreResolve]);

  const handleRestoreCancel = useCallback(() => {
    if (restoreResolve) {
      restoreResolve(false);
      setRestoreResolve(null);
    }
    setShowRestoreDialog(false);
  }, [restoreResolve]);

  // Enhanced page safeguards with controlled auto-restore
  const { loadAutoSaved, clearAutoSaved } = usePageSafeguards({
    isDirty,
    formData,
    autoSaveKey: `stage-form-${stage?.id || `new-${pipelineId}`}`,
    // Disable automatic restore to prevent interference
    enableVisibilityProtection: true
  });

  // Manual save draft function
  const saveDraft = useCallback(async () => {
    try {
      // Force save to localStorage
      const autoSaveKey = `stage-form-${stage?.id || `new-${pipelineId}`}`;
      localStorage.setItem(autoSaveKey, JSON.stringify({
        data: formData,
        timestamp: Date.now(),
        version: '1.0'
      }));

      toast({
        title: "Draft Saved",
        description: "Your changes have been saved as a draft.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft.",
        variant: "destructive",
      });
    }
  }, [formData, stage?.id, pipelineId, toast]);

  // Fetch agents and pipeline agent when modal opens
  useEffect(() => {
    if (open && !agentsLoaded) {
      fetchAgents();
      fetchPipelineAgent();
    }
  }, [open, agentsLoaded]);

  // Initialize form data ONCE when modal opens and agents are loaded
  useEffect(() => {
    if (open && agentsLoaded && !isInitialized) {
      console.log('Initializing form data...');

      if (mode === "edit" && stage) {
        const stageFormData: StageForm = {
          stage_name: stage.stage_name || "",
          stage_description: stage.stage_description || "",
          external_stage_id: typeof stage.external_stage_id === "number" ? stage.external_stage_id : null,
          instructions: stage.instructions || "--",
          persona: stage.persona || "--",
          example_messages: stage.example_messages || "--",
          routing_array: stage.routing_array || null,
          assigned_agent_id: stage.assigned_agent_id || "unassigned",
          external_agent_id: stage.external_agent_id || "",
          stage_nature: stage.stage_nature || "neutral",
          requires_action: stage.requires_action || false,
          opening_message: stage.opening_message || false,
          follow_up_enabled: stage.follow_up_enabled || false,
          follow_up_interval_value: stage.follow_up_interval_value || 1,
          follow_up_interval_unit: stage.follow_up_interval_unit || "days",
          follow_up_time_of_day: stage.follow_up_time_of_day || "09:00",
          follow_up_max_occurrences: stage.follow_up_max_occurrences || 1,
          follow_up_timezone: stage.follow_up_timezone ?? "UTC",
          follow_up_delay_enabled: stage.follow_up_delay_enabled || false,
          follow_up_delay_days: stage.follow_up_delay_days || 1,
          follow_up_delay_time_of_day: stage.follow_up_delay_time_of_day || "09:00",
          follow_up_instructions: stage.follow_up_instructions || "",
          follow_up_assets: stage.follow_up_assets || "",
          when_to_enter: stage.when_to_enter || "",
          when_to_exit: stage.when_to_exit || "",
        };

        initialFormDataRef.current = stageFormData;

        // Check for auto-saved data - but only once during initialization
        const savedData = loadAutoSaved();
        if (savedData && Object.keys(savedData).length > 0 && !hasRestoredFromAutoSave) {
          // Use custom dialog to ask user if they want to restore auto-saved data
          askForRestore().then((shouldRestore) => {
            if (shouldRestore) {
              console.log('Restoring auto-saved data');
              setFormData(savedData);
              setIsDirty(true);
              setHasRestoredFromAutoSave(true);
              toast({
                title: "Draft Restored",
                description: "Your unsaved changes have been restored.",
                duration: 5000,
              });
            } else {
              console.log('Using original stage data');
              setFormData(stageFormData);
              clearAutoSaved(); // Clear the old auto-saved data
            }
          });
        } else {
          console.log('No auto-saved data, using original');
          setFormData(stageFormData);
        }
      } else {
        // For create mode - use pipeline's agent external_agent_id if available
        const newStageDefaults = {
          ...defaultStageForm,
          external_agent_id: pipelineExternalAgentId || ""
        };
        initialFormDataRef.current = newStageDefaults;

        const savedData = loadAutoSaved();
        if (savedData && Object.keys(savedData).length > 0 && !hasRestoredFromAutoSave) {
          askForRestore().then((shouldRestore) => {
            if (shouldRestore) {
              console.log('Restoring auto-saved data for create mode');
              setFormData(savedData);
              setIsDirty(true);
              setHasRestoredFromAutoSave(true);
              toast({
                title: "Draft Restored",
                description: "Your unsaved changes have been restored.",
                duration: 5000,
              });
            } else {
              console.log('Using default form for create mode with pipeline agent');
              setFormData(newStageDefaults);
              clearAutoSaved();
            }
          });
        } else {
          console.log('No auto-saved data for create mode, using pipeline agent if available');
          setFormData(newStageDefaults);
        }
      }

      setIsInitialized(true);
    }
  }, [open, agentsLoaded, isInitialized, mode, stage, loadAutoSaved, clearAutoSaved, toast, askForRestore, hasRestoredFromAutoSave]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      console.log('Modal closed, resetting state');
      setIsDirty(false);
      setHasRestoredFromAutoSave(false);
      setIsInitialized(false);
      lastUserChangeRef.current = 0;
    }
  }, [open]);

  // Fetch pipeline's assigned agent external_agent_id for new stages
  const fetchPipelineAgent = async () => {
    if (!pipelineId || mode !== "create") return;
    setPipelineExternalAgentId("ext-agent-demo");
  };

  const fetchAgents = async () => {
    setAgentsLoaded(false);
    setAgents([
      { id: 'agent-001', name: 'Sales Pro Alpha', external_agent_id: 'ext-001' },
      { id: 'agent-002', name: 'Arabic Outreach', external_agent_id: 'ext-002' },
    ]);
    setAgentsLoaded(true);
  };

  const handleInputChange = (field: string, value: any) => {
    console.log(`Input change: ${field} = ${value}`);

    // Record this as a user change
    lastUserChangeRef.current = Date.now();
    setIsDirty(true);

    setFormData((prev) => {
      if (field === "external_stage_id") {
        let parsedValue: number | null = null;
        if (typeof value === "string" && value.trim() !== "") {
          const num = Number(value);
          parsedValue = isNaN(num) ? null : num;
        } else if (typeof value === "number") {
          parsedValue = value;
        }
        return { ...prev, external_stage_id: parsedValue };
      }

      if (field === "follow_up_enabled") {
        return {
          ...prev,
          follow_up_enabled: value,
          follow_up_timezone: value ? prev.follow_up_timezone ?? "UTC" : "UTC",
        };
      }

      // Handle mutual exclusion between opening_message and follow_up_delay_enabled
      if (field === "opening_message" && value === true) {
        if (prev.follow_up_delay_enabled) {
          toast({
            title: "Follow-up Delay Disabled",
            description: "First follow-up delay has been disabled because opening messages are sent immediately.",
          });
        }
        return {
          ...prev,
          opening_message: true,
          follow_up_delay_enabled: false,
        };
      }

      if (field === "follow_up_delay_enabled" && value === true) {
        if (prev.opening_message) {
          toast({
            title: "Opening Message Disabled",
            description: "Opening message has been disabled to allow the first follow-up delay configuration.",
          });
        }
        return {
          ...prev,
          follow_up_delay_enabled: true,
          opening_message: false,
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.stage_name.trim()) {
      toast({
        title: "Error",
        description: "Stage name is required",
        variant: "destructive",
      });
      return;
    }
    if (
      formData.external_stage_id !== null &&
      (typeof formData.external_stage_id !== "number" || isNaN(formData.external_stage_id))
    ) {
      toast({
        title: "Error",
        description: "External Stage ID must be a number or left blank.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      if (mode === "edit") {
        const updateData = {
          stage_name: formData.stage_name.trim(),
          stage_description: formData.stage_description.trim() || null,
          instructions: formData.instructions.trim() || "--",
          persona: formData.persona.trim() || "--",
          example_messages: formData.example_messages.trim() || "--",
          routing_array: formData.routing_array,
          assigned_agent_id: formData.assigned_agent_id === "unassigned" ? null : formData.assigned_agent_id || null,
          external_agent_id: formData.external_agent_id.trim() || null,
          stage_nature: formData.stage_nature,
          requires_action: formData.requires_action,
          opening_message: formData.opening_message,
          external_stage_id: formData.external_stage_id !== null ? formData.external_stage_id : null,
          follow_up_enabled: formData.follow_up_enabled,
          follow_up_interval_value: formData.follow_up_enabled ? formData.follow_up_interval_value : null,
          follow_up_interval_unit: formData.follow_up_enabled ? formData.follow_up_interval_unit : null,
          follow_up_time_of_day: formData.follow_up_enabled ? formData.follow_up_time_of_day : null,
          follow_up_max_occurrences: formData.follow_up_enabled ? formData.follow_up_max_occurrences : null,
          follow_up_timezone: formData.follow_up_enabled ? formData.follow_up_timezone : null,
          follow_up_delay_enabled: formData.follow_up_enabled ? formData.follow_up_delay_enabled : false,
          follow_up_delay_days: formData.follow_up_enabled && formData.follow_up_delay_enabled ? formData.follow_up_delay_days : null,
          follow_up_delay_time_of_day: formData.follow_up_enabled && formData.follow_up_delay_enabled ? formData.follow_up_delay_time_of_day : null,
          follow_up_instructions: formData.follow_up_enabled ? formData.follow_up_instructions : null,
          follow_up_assets: formData.follow_up_enabled ? formData.follow_up_assets : null,
          when_to_enter: formData.when_to_enter || null,
          when_to_exit: formData.when_to_exit || null,
        };

        console.log("Updating stage with assigned_agent_id:", updateData.assigned_agent_id);

        toast({ title: "Success", description: "Stage updated (static)" });
        setIsDirty(false);
        clearAutoSaved();
        onSuccess();
        onOpenChange(false);
      } else {
        const nextPosition = 0;

        const insertData = {
          stage_name: formData.stage_name.trim(),
          stage_description: formData.stage_description.trim() || null,
          instructions: formData.instructions.trim() || "--",
          persona: formData.persona.trim() || "--",
          example_messages: formData.example_messages.trim() || "--",
          routing_array: formData.routing_array,
          assigned_agent_id: formData.assigned_agent_id === "unassigned" ? null : formData.assigned_agent_id || null,
          external_agent_id: formData.external_agent_id.trim() || null,
          stage_nature: formData.stage_nature,
          requires_action: formData.requires_action,
          opening_message: formData.opening_message,
          external_stage_id: formData.external_stage_id !== null ? formData.external_stage_id : null,
          follow_up_enabled: formData.follow_up_enabled,
          follow_up_interval_value: formData.follow_up_enabled ? formData.follow_up_interval_value : null,
          follow_up_interval_unit: formData.follow_up_enabled ? formData.follow_up_interval_unit : null,
          follow_up_time_of_day: formData.follow_up_enabled ? formData.follow_up_time_of_day : null,
          follow_up_max_occurrences: formData.follow_up_enabled ? formData.follow_up_max_occurrences : null,
          follow_up_timezone: formData.follow_up_enabled ? formData.follow_up_timezone : null,
          follow_up_delay_enabled: formData.follow_up_enabled ? formData.follow_up_delay_enabled : false,
          follow_up_delay_days: formData.follow_up_enabled && formData.follow_up_delay_enabled ? formData.follow_up_delay_days : null,
          follow_up_delay_time_of_day: formData.follow_up_enabled && formData.follow_up_delay_enabled ? formData.follow_up_delay_time_of_day : null,
          follow_up_instructions: formData.follow_up_enabled ? formData.follow_up_instructions : null,
          follow_up_assets: formData.follow_up_enabled ? formData.follow_up_assets : null,
          when_to_enter: formData.when_to_enter || null,
          when_to_exit: formData.when_to_exit || null,
          pipeline_id: pipelineId,
          user_id: user.id,
          stage_position_index: nextPosition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        toast({ title: "Success", description: "Stage created (static)" });
        setIsDirty(false);
        clearAutoSaved();
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error saving stage:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save stage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced close handler with 3-option dialog
  const handleClose = () => {
    if (isDirty) {
      showUnsavedChangesDialog({
        onSaveDraft: () => {
          // Save draft and close
          saveDraft().then(() => {
            onOpenChange(false);
          });
        },
        onIgnoreChanges: () => {
          // Clear draft and close without saving
          clearAutoSaved();
          setIsDirty(false);
          onOpenChange(false);
        },
        onCancel: () => {
          // Do nothing - stay in modal
        },
      });
    } else {
      onOpenChange(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    agents,
    isDirty,
    handleInputChange,
    handleSubmit,
    handleClose,
    saveDraft,
    // Dialog components
    UnsavedChangesDialog,
    // Restore dialog state and handlers
    showRestoreDialog,
    handleRestoreConfirm,
    handleRestoreCancel,
  };
};
